// OxySync screens: Dashboard, Autopilot, Face Unlock, Alerts
const { useState: useS, useEffect: useE, useMemo: useM } = React;

// ═══════════════════════════════════════════════════════════════
// 1) DASHBOARD
// ═══════════════════════════════════════════════════════════════
function ScreenDashboard({ data, onRefresh, onNavigate, toast }) {
  const d  = data.dashboard;
  const ap = data.autopilot;
  const fu = data.faceUnlock;
  const al = data.alerts;
  const [refreshing, setR] = useS(false);

  const doRefresh = async () => {
    setR(true);
    try { await onRefresh(); } catch(e) {}
    setTimeout(() => setR(false), 600);
  };

  const apActive = ap.running;
  const fuActive = fu.job && (fu.job.status === 'processing' || fu.job.status === 'pending');

  return (
    <div className="screen-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Панель аккаунтов</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot"/>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>accountops.org · подключено</span>
          </div>
        </div>
        <button className={`btn btn-secondary btn-sm ${refreshing ? 'spin' : ''}`} onClick={doRefresh} style={{ width: 36, padding: 0 }}>
          <span style={{ display: 'inline-flex', transition: 'transform 600ms', transform: refreshing ? 'rotate(360deg)' : 'rotate(0)' }}>
            {Icon.refresh(15)}
          </span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div className="card-hdr">
          <div className="title">Активные аккаунты</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="h-display">{d.activeCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }} className="mono">
              из {d.totalConnected} · {d.totalConnected > 0 ? Math.round((d.activeCount / d.totalConnected) * 100) : 0}%
            </div>
          </div>
          <div style={{ color: 'var(--accent)' }}>
            <Sparkline data={d.spark} w={120} h={42} stroke="currentColor"/>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => onNavigate('alerts')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: al.enabled ? '#4ade80' : 'var(--text-3)', display: 'flex' }}>{Icon.bell(14)}</span>
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--text-1)' }}>Порог <span className="mono">&lt; {al.threshold}</span></div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{al.enabled ? 'Уведомления включены' : 'Выключено'}</div>
            </div>
          </div>
          <span style={{ color: 'var(--text-3)' }}>{Icon.chevR(16)}</span>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 10 }}>
        <Stat label="Пассивные"    value={d.passiveCount}   tone="idle" sub="ожидают"/>
        <Stat label="Нестабильные" value={d.unstableCount}  tone="warn" sub="перезагрузка"/>
      </div>

      <div className="card tight" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'grid', placeItems: 'center', color: '#1a1106', fontWeight: 700, fontSize: 14, boxShadow: '0 0 0 1px rgba(251,191,36,0.2), 0 2px 8px rgba(251,191,36,0.18)' }}>$</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06, fontWeight: 500 }}>ZeroPoint баланс</div>
            <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 500, marginTop: 2 }}>
              ${d.zp.usd.toFixed(2)}
              <span style={{ fontSize: 11.5, color: d.zp.change24h >= 0 ? '#4ade80' : '#fb7185', marginLeft: 8 }}>
                {d.zp.change24h >= 0 ? '+' : ''}{d.zp.change24h.toFixed(2)} 24ч
              </span>
            </div>
          </div>
        </div>
        <button className="btn btn-sm btn-secondary">Пополнить</button>
      </div>

      <SectionHdr label="Питомцы · трекинг" action={<span style={{ fontSize: 11, color: 'var(--text-3)' }} className="mono">{d.pets.tracked} отслеж. · {d.pets.totalKinds} видов</span>}/>
      <PetTracker pets={d.pets.items} style={{ marginBottom: 14 }}/>

      <SectionHdr label="Сейчас в работе"/>
      <div className="card" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => onNavigate('autopilot')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: apActive ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: apActive ? 'var(--accent-soft)' : 'var(--bg-raised)', display: 'grid', placeItems: 'center', color: apActive ? 'var(--accent)' : 'var(--text-3)' }}>{Icon.bolt(16)}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>AutoTradeToMain</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }} className="mono">
                {apActive ? `${ap.queue.done + ap.queue.active}/${ap.queue.done + ap.queue.active + ap.queue.pending + ap.queue.stuck} обработано` : 'не запущен'}
              </div>
            </div>
          </div>
          {apActive ? <span className="badge ok"><span className="dot"/>RUNNING</span> : <span className="badge idle"><span className="dot"/>IDLE</span>}
        </div>
        {apActive && <SegBar active={ap.queue.active} pending={ap.queue.pending} done={ap.queue.done} stuck={ap.queue.stuck}/>}
      </div>

      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('face')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: fuActive ? 'var(--accent-soft)' : 'var(--bg-raised)', display: 'grid', placeItems: 'center', color: fuActive ? 'var(--accent)' : 'var(--text-3)' }}>{Icon.face(16)}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Auto-Unlock-Face</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }} className="mono">
                {fuActive ? `${fu.job.processed}/${fu.job.total} · ${fmtElapsed(fu.job.startedAt)}` : `след. через ${timeIn(fu.nextRunAt)}`}
              </div>
            </div>
          </div>
          {fuActive ? <span className="badge accent"><span className="dot"/>{fu.job.status.toUpperCase()}</span>
            : fu.autoEnabled ? <span className="badge ok"><span className="dot"/>AUTO</span>
            : <span className="badge idle"><span className="dot"/>IDLE</span>}
        </div>
        {fuActive && (
          <div style={{ marginTop: 12 }}>
            <div className="seg-bar">
              <div className="seg active"  style={{ flex: fu.job.processed }}/>
              <div className="seg pending" style={{ flex: fu.job.total - fu.job.processed }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, padding: '0 4px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">обновлено {timeAgo(d.lastUpdated)} назад</span>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">v1.5.2</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2) AUTOPILOT (AutoTradeToMain)
// ═══════════════════════════════════════════════════════════════
function ScreenAutopilot({ data, setData, progressStyle, openModal, toast }) {
  const ap     = data.autopilot;
  const update = (patch) => setData(d => ({ ...d, autopilot: { ...d.autopilot, ...patch } }));
  const [busy, setBusy] = useS(false);

  const total    = ap.queue.active + ap.queue.pending + ap.queue.done + ap.queue.stuck;
  const progress = total > 0 ? Math.round((ap.queue.done / total) * 100) : 0;

  // Debounced save for stepper changes
  const saveConfig = useM(() => makeDebounced(body => API.setAutopilotConfig(body).catch(() => {})), []);

  const onToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (ap.running) {
        await API.stopAutopilot();
        update({ running: false, queue: { active: 0, pending: 0, done: 0, stuck: 0 } });
        toast('Авто-пилот остановлен', 'warn');
      } else {
        const res = await API.startAutopilot();
        update({ running: true, startedAt: new Date(), queue: { active: 0, pending: res.queued || 0, done: 0, stuck: 0 } });
        toast(`Запущен · ${res.queued || 0} в очереди`);
      }
    } catch (e) {
      toast(e.message, 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen-scroll" style={{ paddingBottom: 88 }}>
      {/* Status hero */}
      <div className="card" style={{ marginBottom: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>AutoTradeToMain</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {ap.running ? (
                <><span className="live-dot"/><span style={{ fontSize: 14, fontWeight: 500 }}>RUNNING</span><span style={{ fontSize: 12, color: 'var(--text-3)' }} className="mono">· {fmtElapsed(ap.startedAt)}</span></>
              ) : (
                <span className="badge idle"><span className="dot"/>STOPPED</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="h-display" style={{ fontSize: 32 }}>{progress}<span style={{ fontSize: 18, color: 'var(--text-3)' }}>%</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }} className="mono">прогресс</div>
          </div>
        </div>

        <SegBar active={ap.queue.active} pending={ap.queue.pending} done={ap.queue.done} stuck={ap.queue.stuck} style={progressStyle}/>

        <div className="stat-grid cols-4" style={{ marginTop: 14, gap: 6 }}>
          {[
            { v: ap.queue.active,  label: 'active',  bg: 'var(--accent-soft)', color: 'var(--accent)' },
            { v: ap.queue.pending, label: 'pending', bg: 'var(--idle-soft)',   color: 'var(--text-2)' },
            { v: ap.queue.done,    label: 'done',    bg: 'var(--ok-soft)',     color: '#4ade80' },
            { v: ap.queue.stuck,   label: 'stuck',   bg: 'var(--bad-soft)',    color: '#fb7185' },
          ].map(({ v, label, bg, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: bg }}>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 500, color }}>{v}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <SectionHdr label="Лента событий" action={<span style={{ fontSize: 11, color: 'var(--text-3)' }} className="mono">{ap.recent.length} последних</span>}/>
      <div className="card flush" style={{ marginBottom: 10, overflow: 'hidden' }}>
        {ap.recent.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < ap.recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: r.status === 'done' ? 'var(--ok)' : r.status === 'active' ? 'var(--accent)' : 'var(--bad)', boxShadow: r.status === 'active' ? '0 0 6px var(--accent-glow)' : 'none' }}/>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{r.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }} className="mono">{r.t < 60 ? `${r.t}с` : `${Math.floor(r.t/60)}м`}</span>
              <span className={`badge ${r.status === 'done' ? 'ok' : r.status === 'active' ? 'accent' : 'bad'}`} style={{ textTransform: 'lowercase', fontSize: 10.5 }}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration */}
      <SectionHdr label="Конфигурация"/>
      <div className="card" style={{ marginBottom: 10 }}>
        <div className="row" onClick={() => openModal('mainAccount')} style={{ cursor: 'pointer' }}>
          <span className="row-key">Основной аккаунт</span>
          <span className="row-val">@{ap.mainAccount || '—'} {Icon.chevR(14)}</span>
        </div>
        <div className="row" onClick={() => openModal('configPicker')} style={{ cursor: 'pointer' }}>
          <span className="row-key">Игровой конфиг</span>
          <span className="row-val">{ap.config?.name || 'Не задан'} {Icon.chevR(14)}</span>
        </div>
        <div className="row" onClick={() => openModal('petManager')} style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
          <span className="row-key" style={{ alignSelf: 'flex-start', paddingTop: 4 }}>Питомцы ({ap.pets.length})</span>
          <div style={{ flex: 1, marginLeft: 12, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: '60%' }}>
            {ap.pets.slice(0, 2).map(p => (
              <span key={p.id} className="tag" style={{ padding: '4px 8px', fontSize: 10.5 }}>{p.label || p.id}</span>
            ))}
            {ap.pets.length > 2 && <span className="tag" style={{ padding: '4px 8px', fontSize: 10.5, color: 'var(--text-3)' }}>+{ap.pets.length - 2}</span>}
            <span style={{ color: 'var(--text-3)', display: 'flex', alignSelf: 'center' }}>{Icon.chevR(14)}</span>
          </div>
        </div>
      </div>

      <SectionHdr label="Параметры цикла"/>
      <div className="card">
        <div className="row">
          <div>
            <div className="row-key">Размер батча</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>аккаунтов одновременно</div>
          </div>
          <Stepper value={ap.batchSize} onChange={v => { update({ batchSize: v }); saveConfig({ batch_size: v }); }} min={1} max={50} step={1}/>
        </div>
        <div className="row">
          <div>
            <div className="row-key">Интервал проверки</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>секунд между опросами</div>
          </div>
          <Stepper value={ap.checkInterval} onChange={v => { update({ checkInterval: v }); saveConfig({ check_interval: v }); }} min={10} max={300} step={5} suffix="с"/>
        </div>
        <div className="row">
          <div>
            <div className="row-key">Таймаут зависания</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>минут до замены</div>
          </div>
          <Stepper value={ap.stuckTimeout} onChange={v => { update({ stuckTimeout: v }); saveConfig({ stuck_timeout: v }); }} min={1} max={60} step={1} suffix="м"/>
        </div>
      </div>

      {/* Sticky action button */}
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, padding: '12px 14px', background: 'linear-gradient(180deg, transparent 0%, var(--bg-app) 30%)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          {ap.running ? (
            <button className="btn btn-danger btn-lg btn-block" onClick={onToggle} disabled={busy}>
              {busy ? '...' : <>{Icon.stop()} Остановить авто-пилот</>}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" onClick={onToggle} disabled={busy}>
              {busy ? '...' : <>{Icon.play()} Запустить авто-пилот</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3) AUTO-UNLOCK-FACE
// ═══════════════════════════════════════════════════════════════
function ScreenFace({ data, setData, openModal, toast }) {
  const fu        = data.faceUnlock;
  const update    = (patch) => setData(d => ({ ...d, faceUnlock: { ...d.faceUnlock, ...patch } }));
  const updateJob = (patch) => setData(d => ({ ...d, faceUnlock: { ...d.faceUnlock, job: d.faceUnlock.job ? { ...d.faceUnlock.job, ...patch } : patch } }));
  const [busy, setBusy] = useS(false);

  const job      = fu.job;
  const pct      = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
  const isActive = job && (job.status === 'processing' || job.status === 'pending');

  const onRun = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await API.startFaceUnlock();
      update({ job: { id: res.job_id || '', status: 'processing', startedAt: new Date(), processed: 0, unlocked: 0, errors: 0, total: res.accounts || 0, files: null } });
      toast(`Задача запущена · ${res.accounts || 0} акк.`);
    } catch (e) {
      toast(e.message, 'bad');
    } finally {
      setBusy(false);
    }
  };

  const onCancel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await API.cancelFaceUnlock();
      updateJob({ status: 'cancelled' });
      toast('Задача отменена', 'warn');
    } catch (e) {
      toast(e.message, 'bad');
    } finally {
      setBusy(false);
    }
  };

  const saveAutoUnlock = useM(() => makeDebounced(body => API.setAlerts(body).catch(() => {})), []);

  return (
    <div className="screen-scroll">
      <div className="card" style={{ marginBottom: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Текущая задача</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }} className="mono">{job ? job.id : 'нет активной'}</div>
          </div>
          {isActive ? <span className="badge accent"><span className="dot"/>{job.status}</span>
            : job && job.status === 'completed' ? <span className="badge ok"><span className="dot"/>completed</span>
            : <span className="badge idle"><span className="dot"/>idle</span>}
        </div>

        {isActive ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div className="h-display">{job.processed}<span style={{ color: 'var(--text-4)', fontSize: 28 }}> / {job.total}</span></div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{pct}%</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="seg-bar">
                <div className="seg active"  style={{ flex: job.processed }}/>
                <div className="seg pending" style={{ flex: job.total - job.processed }}/>
              </div>
            </div>
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 14, gap: 6 }}>
              <div style={{ padding: 10, background: 'var(--ok-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Unlocked</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#4ade80', marginTop: 2 }}>{job.unlocked}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bad-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Errors</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#fb7185', marginTop: 2 }}>{job.errors}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg-raised)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Elapsed</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: 'var(--text-1)', marginTop: 2 }}>{fmtElapsed(job.startedAt)}</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-secondary btn-block" onClick={onCancel} disabled={busy}>
                {busy ? '...' : 'Отменить'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="empty">
              <div className="ico">{Icon.face(20)}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 4 }}>Нет активной задачи</div>
              <div style={{ fontSize: 11.5 }}>Следующий запуск через <span className="mono" style={{ color: 'var(--text-2)' }}>{timeIn(fu.nextRunAt)}</span></div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={onRun} disabled={busy}>
              {busy ? '...' : <>{Icon.play()} Запустить face unlock</>}
            </button>
          </>
        )}
      </div>

      {!isActive && job && job.status === 'completed' && job.files && (
        <>
          <SectionHdr label="Файлы результата"/>
          <div className="card flush" style={{ marginBottom: 10, overflow: 'hidden' }}>
            {job.files.map((f, i) => {
              const fname = typeof f === 'string' ? f : f.filename;
              return (
                <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < job.files.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-raised)', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}>{Icon.download(14)}</div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{fname}</div>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => toast(`Загрузка ${fname}`)}>скачать</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <SectionHdr label="Авто-цикл"/>
      <div className="card" style={{ marginBottom: 10 }}>
        <div className="row" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="row-key" style={{ color: 'var(--text-1)', fontWeight: 500 }}>Автоматический запуск</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>Циклически запускать face unlock</div>
          </div>
          <Toggle on={fu.autoEnabled} onChange={v => { update({ autoEnabled: v }); toast(v ? 'Авто-цикл включён' : 'Авто-цикл выключен', v ? 'ok' : 'warn'); }}/>
        </div>
        <div className="row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="row-key">Интервал</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>часов между запусками</div>
          </div>
          <Stepper value={fu.intervalHours} onChange={v => update({ intervalHours: v })} min={1} max={48} step={1} suffix="ч"/>
        </div>
      </div>

      <SectionHdr label="ZeroPoint"/>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => openModal('zpKey')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-raised)', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}>{Icon.key(15)}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>API ключ</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }} className="mono">{fu.apiKeyMasked}</div>
            </div>
          </div>
          <span style={{ color: 'var(--text-3)' }}>{Icon.chevR(16)}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4) ALERTS
// ═══════════════════════════════════════════════════════════════
function ScreenAlerts({ data, setData, toast }) {
  const al     = data.alerts;
  const d      = data.dashboard;
  const update = (patch) => setData(s => ({ ...s, alerts: { ...s.alerts, ...patch } }));
  const ratio  = Math.min(1, d.activeCount / (al.threshold * 4));
  const above  = d.activeCount >= al.threshold;

  const saveAlerts = useM(() => makeDebounced(body => API.setAlerts(body).catch(() => {})), []);

  return (
    <div className="screen-scroll">
      <div className="card" style={{ marginBottom: 10, padding: 16 }}>
        <div className="card-hdr">
          <div className="title">Состояние</div>
          {al.enabled ? <span className="badge ok"><span className="dot"/>ENABLED</span> : <span className="badge idle"><span className="dot"/>DISABLED</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Сейчас активных</div>
            <div className="h-display">{d.activeCount}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Порог</div>
            <div className="h-display" style={{ fontSize: 32, color: above ? '#4ade80' : '#fb7185' }}>&lt;{al.threshold}</div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 8, borderRadius: 100, background: 'var(--bg-input)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${ratio * 100}%`, background: 'var(--accent)', borderRadius: 100, transition: 'width 320ms ease' }}/>
          <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.min(96, 25)}%`, width: 2, background: '#fb7185', borderRadius: 2 }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }} className="mono">0</span>
          <span style={{ fontSize: 11, color: above ? '#4ade80' : '#fb7185' }}>
            {above ? `+${d.activeCount - al.threshold} над порогом` : `${al.threshold - d.activeCount} до порога`}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }} className="mono">{al.threshold * 4}+</span>
        </div>
      </div>

      <SectionHdr label="Настройки"/>
      <div className="card" style={{ marginBottom: 10 }}>
        <div className="row" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="row-key" style={{ color: 'var(--text-1)', fontWeight: 500 }}>Уведомления</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>Алерт когда активных меньше порога</div>
          </div>
          <Toggle on={al.enabled} onChange={async v => {
            try {
              await API.setAlerts({ toggle: true });
              update({ enabled: v });
              toast(v ? 'Уведомления включены' : 'Уведомления выключены', v ? 'ok' : 'warn');
            } catch (e) { toast(e.message, 'bad'); }
          }}/>
        </div>
        <div className="row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="row-key">Порог</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>активных аккаунтов</div>
          </div>
          <Stepper value={al.threshold} onChange={v => { update({ threshold: v }); saveAlerts({ threshold: v }); }} min={1} max={1000} step={5}/>
        </div>
      </div>

      <SectionHdr label="История событий" action={<span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{al.history.length}</span>}/>
      <div className="card flush" style={{ overflow: 'hidden' }}>
        {al.history.map((e, i) => (
          <div key={e.id} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < al.history.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: e.kind === 'breach' ? 'var(--bad-soft)' : 'var(--ok-soft)', color: e.kind === 'breach' ? '#fb7185' : '#4ade80', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {e.kind === 'breach' ? Icon.warn(14) : Icon.check(14)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{e.kind === 'breach' ? 'Порог нарушен' : 'Восстановлено'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }} className="mono">active: {e.value} {e.kind === 'breach' ? '↓' : '↑'} {al.threshold}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }} className="mono">{timeAgo(e.at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDashboard, ScreenAutopilot, ScreenFace, ScreenAlerts });

// ── Pet tracker ────────────────────────────────────────────────────────────
function PetTracker({ pets, style }) {
  const [expanded, setExp] = useS(false);
  const visible = expanded ? pets : pets.slice(0, 6);

  const fmtDelta  = v => (!v ? '—' : v > 0 ? `+${v}` : `${v}`);
  const colorDelta = v => (!v ? 'var(--text-4)' : v > 0 ? '#4ade80' : '#fb7185');
  const PERIODS = [{ key: 'h1', label: '1ч' }, { key: 'h12', label: '12ч' }, { key: 'h24', label: '24ч' }, { key: 'd3', label: '3д' }, { key: 'd7', label: '7д' }];

  return (
    <div className="card flush" style={{ overflow: 'hidden', ...style }}>
      {visible.map((p, i) => (
        <div key={p.name} style={{ padding: '10px 12px', borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>×</span>
              <span style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{p.count}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, marginLeft: 36 }}>
            {PERIODS.map(per => (
              <div key={per.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 0.04, fontWeight: 500 }}>{per.label}</span>
                <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 500, color: colorDelta(p.deltas[per.key]), marginTop: 1 }}>{fmtDelta(p.deltas[per.key])}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {pets.length > 6 && (
        <button onClick={() => setExp(!expanded)} style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 12, fontWeight: 500, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
          {expanded ? 'Свернуть' : `Показать ещё ${pets.length - 6}`}
          <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}>{Icon.chevD(14)}</span>
        </button>
      )}
    </div>
  );
}

Object.assign(window, { PetTracker });
