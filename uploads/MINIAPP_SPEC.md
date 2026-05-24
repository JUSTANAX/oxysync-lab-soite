# OxySync Bot — Техническое описание для Mini App

## Стек и архитектура

- **Python 3.11+**, asyncio, aiogram v3 (Telegram Bot API)
- **SQLite** — одна БД, постоянное соединение (`isolation_level=None`)
- **Внешние API**: AccountsOps (`https://accountops.org`) и ZeroPoint
- Бот **single-user** — пропускает все события не от `OWNER_ID` через middleware
- Фоновые asyncio-задачи крутятся параллельно с polling'ом

---

## База данных — таблицы

### `panels`
| Поле | Тип | Описание |
|---|---|---|
| user_id | INTEGER PK | Telegram ID |
| api_key | TEXT | Ключ AccountsOps |
| connected_at | TEXT | Дата подключения |

### `alert_thresholds`
| Поле | Тип | Описание |
|---|---|---|
| user_id | INTEGER PK | |
| threshold | INTEGER | Порог активных аккаунтов |
| enabled | INTEGER | Вкл/Выкл |
| last_notified | TEXT | Последнее уведомление |
| triggered | INTEGER | Флаг: порог уже сработал |

### `zp_keys`
| user_id | api_key | — ключ ZeroPoint |

### `zp_jobs`
| user_id | job_id | notified | added_at | — активная задача face unlock |

### `auto_unlock`
| user_id | enabled | interval_hours | last_run_at | — настройки авто-цикла unlock |

### `autopilot_config`
| Поле | Тип | Default | Описание |
|---|---|---|---|
| user_id | INTEGER PK | | |
| main_account | TEXT | | Username основного аккаунта |
| config_id | INTEGER | | ID игрового конфига |
| running | INTEGER | 0 | Запущен ли сейчас |
| started_at | TEXT | | UTC время запуска |
| batch_size | INTEGER | 10 | Аккаунтов одновременно |
| check_interval | INTEGER | 30 | Секунд между проверками |
| stuck_timeout | INTEGER | 10 | Минут до замены зависшего |
| last_checked_at | TEXT | | Последняя обработка |

### `autopilot_pets`
| Поле | Тип | Описание |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| user_id | INTEGER | |
| pet_id | TEXT | Полный ID пета (напр. `soggy_spring_2026_strawberry_shortcake_ducky`) |

UNIQUE(user_id, pet_id)

### `autopilot_queue`
| Поле | Тип | Описание |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| user_id | INTEGER | |
| account_id | TEXT | ID аккаунта в AccountsOps |
| username | TEXT | Username аккаунта |
| status | TEXT | `pending` / `active` / `done` / `stuck` |
| activated_at | TEXT | UTC когда стал active |

---

## AccountsOps API

**Base URL**: `https://accountops.org`
**Auth**: заголовок `X-Api-Key: {key}`
Все запросы с retry x3 + exponential backoff. Chunking по 50 на `/api/accounts/enable`.

| Метод | Endpoint | Описание |
|---|---|---|
| GET | `/api/dashboard` | `{active_count, passive_count, unstable_count, ...}` |
| GET | `/api/trackstats/accounts` | Список всех аккаунтов `[{id, username, ...}]` |
| GET | `/api/trackstats/accounts/{id}/pets` | Питомцы аккаунта `[{pet_kind, quantity, is_egg}]` |
| PUT/PATCH/POST | `/api/accounts/enable` | `{usernames: [...], enabled: bool}` |
| POST | `/api/accounts/config` | `{usernames: [...], config_id: int}` |
| GET | `/api/player-configs` | Список конфигов `[{id, name}]` |
| POST | `/api/devices/accounts` | `{tag: "status:face"}` → аккаунты с тегом |

`pet_kind` пример: `soggy_spring_2026_strawberry_shortcake_ducky`

---

## ZeroPoint API

| Метод | Endpoint | Описание |
|---|---|---|
| POST | `/api/job` | Отправить задачу face unlock (тело: список cookie-строк) |
| GET | `/api/job/{job_id}` | Статус: `pending / processing / completed / failed / cancelled` |
| GET | `/api/job/{job_id}/download/{filename}` | Скачать файл результата |

Аккаунт форматируется как `username:password:cookie` или просто `cookie` (без `.ROBLOSECURITY=` префикса).

---

## Функции бота

### 1. Главный экран — статистика
- `GET /api/dashboard` → `active_count`, `passive_count`, `unstable_count`
- Сообщение редактируется каждые 300 сек (фоновая задача `stats_refresh_loop`)
- Кнопки: Обновить, Уведомления, Настройки, Автоматизация

### 2. Уведомления об активных аккаунтах
- Порог задаётся вручную (например: `< 50`)
- Проверка каждые 300 сек
- Когда `active_count < threshold` — шлёт алерт и ставит `triggered=1`
- Когда восстановилось — шлёт уведомление и снимает `triggered`
- Можно включить/выключить не меняя порог

### 3. Auto-Unlock-Face
- Берёт аккаунты с тегом `status:face` из AccountsOps
- Форматирует и отправляет в ZeroPoint как задачу
- Фоновый poller каждые 30 сек проверяет статус задачи
- По завершении: шлёт статистику (разблокировано / ошибок) + ссылки на файлы результата
- **Авто-цикл**: настраиваемый интервал (кнопка в UI), запускает новый цикл автоматически
- Если задача уже активна — не дублирует, подхватывает существующий `job_id`

### 4. AutoTradeToMain (Авто-пилот)

**Логика запуска:**
1. Отключает все аккаунты разом
2. Включает основной аккаунт (`main_account`)
3. Сканирует аккаунты с нужными петами параллельно по всем `pet_ids`
4. Фильтрует: пропускает `status:face`, `status:dead`, сам `main_account`
5. Строит очередь (`autopilot_queue`, статус `pending`)
6. Опционально применяет `config_id` на все аккаунты очереди
7. Активирует первый батч (`batch_size` штук) — статус `active`

**Цикл (каждые `check_interval` секунд):**
- Для каждого `active` аккаунта: запрашивает его питомцев
- Если ни одного из `pet_ids` нет → питомец передан → отключает аккаунт, статус `done`
- Проверяет зависшие: `activated_at` > `stuck_timeout` минут → отключает, статус `stuck`, уведомляет
- Добирает из `pending` до `batch_size`
- Если `active=0` и `pending=0` → отключает `main_account`, отправляет итог (кол-во, время)

**Настройки (все меняются в UI):**
| Параметр | Диапазон | Default | Описание |
|---|---|---|---|
| main_account | username | — | Принимает питомцев |
| pet_ids | список | — | Один или несколько ID петов |
| config_id | выбор из API | — | Игровой конфиг на аккаунты |
| batch_size | 1–50 | 10 | Аккаунтов одновременно |
| check_interval | 10–300 сек | 30 | Как часто проверять инвентари |
| stuck_timeout | 1–60 мин | 10 | Когда заменять зависший аккаунт |

---

## Навигация (callback_data)

```
back / refresh
settings → set_key
alerts → alert_set / alert_toggle
automation
  └─ face_unlock → fu_run / fu_refresh / fu_cancel / fu_confirm
               → fu_auto_toggle / fu_interval_cycle
               → fu_set_key / fu_dl:{filename}
  └─ autopilot (подменю)
       └─ autotrade_main
            → ap_set_main
            → ap_set_pet → ap_add_pet / ap_del_pet:{id}
            → ap_set_config → ap_cfg:{id}
            → ap_set_batch / ap_set_interval / ap_set_stuck
            → ap_start / ap_stop / ap_refresh
```

---

## Фоновые задачи

| Задача | Интервал | Что делает |
|---|---|---|
| `alert_loop` | 300 сек | Проверяет пороги активных аккаунтов |
| `auto_unlock_loop` | 1800 сек | Запускает face unlock для юзеров с авто-циклом |
| `job_poller_loop` | 30 сек | Проверяет статус ZP-задач, шлёт результат |
| `stats_refresh_loop` | 300 сек | Обновляет главный экран со статистикой |
| `autopilot_transfer_loop` | 5 сек (глобально) | Обрабатывает каждого юзера по его `check_interval` |

---

## Что должен уметь Mini App

Минимальный набор экранов:

1. **Dashboard** — `active_count`, `passive_count`, `unstable_count`, кнопка обновить
2. **AutoTradeToMain**
   - Показать текущий конфиг (main_account, список петов, все параметры)
   - Статус: запущен / остановлен, прогресс (active / pending / done / stuck)
   - Кнопки: Запустить / Остановить
   - Редактирование параметров: batch_size, check_interval, stuck_timeout
   - Управление петами: добавить / удалить
   - Выбор конфига из списка
3. **Auto-Unlock-Face**
   - Статус текущей задачи
   - Кнопки: Запустить / Отменить / Скачать результат
   - Авто-цикл вкл/выкл + интервал
4. **Уведомления**
   - Порог + вкл/выкл

## HTTP API (уже реализован, `api_server.py`)

Сервер поднимается на `0.0.0.0:{API_PORT}` (default: 8080) вместе с ботом.

### Аутентификация

Каждый запрос должен содержать заголовок:
```
X-Init-Data: <initData из window.Telegram.WebApp.initData>
```

Сервер верифицирует HMAC-SHA256 подпись и проверяет что `user.id == OWNER_ID`.

### Эндпоинты

| Метод | URL | Описание |
|---|---|---|
| GET | `/api/dashboard` | `{active_count, passive_count, unstable_count}` |
| GET | `/api/alerts` | `{threshold, enabled}` |
| PUT | `/api/alerts` | `{threshold?, toggle?}` |
| GET | `/api/autopilot` | Полный конфиг + статус очереди |
| PUT | `/api/autopilot/config` | `{main_account?, batch_size?, check_interval?, stuck_timeout?, config_id?}` |
| GET | `/api/autopilot/pets` | `[{id, pet_id}]` |
| POST | `/api/autopilot/pets` | `{pet_id}` |
| DELETE | `/api/autopilot/pets/{id}` | Удалить пет по row id |
| GET | `/api/autopilot/configs` | `[{id, name}]` — список конфигов из AccountsOps |
| POST | `/api/autopilot/start` | Запустить AutoTradeToMain |
| POST | `/api/autopilot/stop` | Остановить |
| GET | `/api/faceunlock` | `{zp_key: bool, job: {...} or null}` |
| POST | `/api/faceunlock/start` | Запустить face unlock |
| POST | `/api/faceunlock/cancel` | Отменить текущую задачу |

### GET `/api/autopilot` — пример ответа
```json
{
  "main_account": "myaccount",
  "config_id": 3,
  "batch_size": 10,
  "check_interval": 30,
  "stuck_timeout": 10,
  "running": true,
  "started_at": "2025-05-24 12:00:00",
  "pets": [
    {"id": 1, "pet_id": "soggy_spring_2026_strawberry_shortcake_ducky"}
  ],
  "queue": {
    "active": 5,
    "pending": 42,
    "done": 13
  }
}
```

### Пример запроса из Mini App (JS)
```js
const tg = window.Telegram.WebApp;

async function apiFetch(method, url, body) {
  const res = await fetch(`https://your-server.com${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Init-Data": tg.initData,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// Примеры
const dashboard = await apiFetch("GET", "/api/dashboard");
await apiFetch("POST", "/api/autopilot/start");
await apiFetch("PUT", "/api/autopilot/config", { batch_size: 5 });
await apiFetch("POST", "/api/autopilot/pets", { pet_id: "soggy_spring_2026_..." });
await apiFetch("DELETE", `/api/autopilot/pets/3`);
```
