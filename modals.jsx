// Modals: API key input, config picker, pet manager, main account
const { useState: useMS, useEffect: useSheetE, useRef: useSheetR } = React;

function SheetWrap({ open, onClose, title, children, footer, height }) {
  const [mounted, setMounted] = useMS(open);
  const timerRef = useSheetR(null);

  useSheetE(() => {
    if (open) {
      setMounted(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      // Ждём окончания анимации (320ms), потом полностью убираем из DOM
      timerRef.current = setTimeout(() => setMounted(false), 360);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [open]);

  // Закрыть по Escape
  useSheetE(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`sheet-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      <div className={`sheet ${open ? 'open' : ''}`} style={height ? { maxHeight: height } : undefined}>
        <div className="sheet-grabber"/>
        <div className="sheet-hdr">
          <h3>{title}</h3>
          <button type="button" className="btn-ghost" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center' }}>
            {Icon.x(16)}
          </button>
        </div>
        <div className="sheet-body" style={{ flex: 1, minHeight: 0 }}>{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>
  );
}

// ─── API key input (ZeroPoint) ───
function ModalZpKey({ open, onClose, value, toast }) {
  return (
    <SheetWrap open={open} onClose={onClose} title="API ключ ZeroPoint" footer={
      <button className="btn btn-primary btn-block" onClick={onClose}>Закрыть</button>
    }>
      <div style={{ marginBottom: 12, fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
        Текущий ключ:
      </div>
      <div className="mono" style={{
        padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 10,
        border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-2)',
        marginBottom: 12,
      }}>
        {value || 'не задан'}
      </div>
      <div style={{ padding: 10, background: 'var(--warn-soft)', borderRadius: 8, display: 'flex', gap: 8 }}>
        <span style={{ color: '#fbbf24', display: 'flex', flexShrink: 0 }}>{Icon.warn(14)}</span>
        <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Для изменения ключа используйте команду в Telegram-боте.
        </div>
      </div>
    </SheetWrap>
  );
}

// ─── Config picker ───
function ModalConfigPicker({ open, onClose, configs, current, onPick, toast, title = 'Выбрать конфиг', description = 'Будет применён ко всем аккаунтам при переходе в trading.' }) {
  return (
    <SheetWrap open={open} onClose={onClose} title={title}>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-3)' }}>
        {description}
      </div>
      {configs.map(c => (
        <div
          key={c.id}
          className={`list-row ${current?.id === c.id ? 'selected' : ''}`}
          onClick={() => { onPick(c); onClose(); }}
        >
          <div className="lr-main">
            <div className="lr-icon" style={{ color: current.id === c.id ? 'var(--accent)' : 'var(--text-3)' }}>
              {Icon.settings(14)}
            </div>
            <div className="lr-text">
              <div className="lr-t">{c.name}</div>
              <div className="lr-s">id: {c.id}</div>
            </div>
          </div>
          {current.id === c.id && <span style={{ color: 'var(--accent)' }}>{Icon.check(16)}</span>}
        </div>
      ))}
    </SheetWrap>
  );
}

// ─── Pet manager ───
function ModalPetManager({ open, onClose, selected, onAdd, onRemove, toast }) {
  const [newId, setNewId] = useMS('');
  const [busy, setBusy]   = useMS(false);

  React.useEffect(() => { if (open) setNewId(''); }, [open]);

  const add = async () => {
    const id = newId.trim();
    if (!id) { toast('Введите ID питомца', 'bad'); return; }
    if (selected.some(p => p.id === id)) { toast('Уже добавлен', 'warn'); return; }
    setBusy(true);
    try {
      await onAdd(id);
      setNewId('');
      toast('Питомец добавлен');
    } catch (e) {
      toast(e.message || 'Ошибка добавления', 'bad');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (pet) => {
    setBusy(true);
    try {
      await onRemove(pet.rowId);
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetWrap open={open} onClose={onClose} title={`Питомцы · ${selected.length}`} height="80%">
      {/* current pets */}
      {selected.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 8 }}>Активные</div>
          {selected.map(p => (
            <div key={p.rowId} className="list-row" style={{ opacity: busy ? 0.6 : 1 }}>
              <div className="lr-main">
                <div className="lr-icon" style={{ color: 'var(--accent)' }}>{Icon.pet ? Icon.pet(14) : Icon.bolt(14)}</div>
                <div className="lr-text">
                  <div className="lr-t mono" style={{ fontSize: 11.5, wordBreak: 'break-all' }}>{p.id}</div>
                </div>
              </div>
              <button
                className="btn-ghost"
                style={{ color: 'var(--bad)', width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}
                onClick={() => remove(p)}
                disabled={busy}
              >
                {Icon.x(14)}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty" style={{ marginBottom: 16 }}>
          <div className="ico">{Icon.bolt(18)}</div>
          <div>Питомцы не добавлены</div>
        </div>
      )}

      {/* add new */}
      <div className="label" style={{ marginBottom: 8 }}>Добавить</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
        Введите полный ID питомца, например:<br/>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>soggy_spring_2026_strawberry_shortcake_ducky</span>
      </div>
      <input
        className="input"
        placeholder="pet_id..."
        value={newId}
        onChange={e => setNewId(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
        disabled={busy}
        style={{ marginBottom: 8 }}
      />
      <button className="btn btn-primary btn-block" onClick={add} disabled={busy || !newId.trim()}>
        {busy ? '...' : '+ Добавить'}
      </button>
    </SheetWrap>
  );
}

// ─── Main account input ───
function ModalMainAccount({ open, onClose, value, onSave, toast }) {
  const [v, setV] = useMS(value);
  React.useEffect(() => { if (open) setV(value); }, [open, value]);
  const save = () => {
    if (!v.trim()) { toast('Введите username', 'bad'); return; }
    onSave(v.trim());
    onClose();
    toast(`Основной: @${v.trim()}`);
  };
  return (
    <SheetWrap open={open} onClose={onClose} title="Основной аккаунт" footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
        <button className="btn btn-primary btn-block" onClick={save}>Сохранить</button>
      </div>
    }>
      <div style={{ marginBottom: 10, fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
        Аккаунт, который будет принимать всех питомцев. Будет автоматически включён при запуске и выключен по завершении цикла.
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>@</span>
        <input
          className="input"
          style={{ paddingLeft: 28 }}
          placeholder="username"
          value={v}
          onChange={e => setV(e.target.value.replace(/^@/, ''))}
          autoFocus
        />
      </div>
    </SheetWrap>
  );
}

Object.assign(window, { ModalZpKey, ModalConfigPicker, ModalPetManager, ModalMainAccount });
