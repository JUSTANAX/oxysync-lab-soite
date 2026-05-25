// OxySync Mini App — main shell, navigation, tweaks integration
const { useState: useAS, useEffect: useAE, useRef: useAR } = React;

const TABS = [
  { id: 'dashboard', label: 'Главная', icon: Icon.dashboard },
  { id: 'autopilot', label: 'Авто-пилот', icon: Icon.bolt },
  { id: 'face', label: 'Face', icon: Icon.face },
  { id: 'alerts', label: 'Алерты', icon: Icon.bell },
];

const ACCENT_PRESETS = {
  navy:   { accent: '#4a7bf7', deep: '#2d3a8c', soft: 'rgba(74,123,247,0.12)',   glow: 'rgba(74,123,247,0.35)'  },
  cyan:   { accent: '#06b6d4', deep: '#0e7490', soft: 'rgba(6,182,212,0.12)',    glow: 'rgba(6,182,212,0.35)'   },
  violet: { accent: '#8b5cf6', deep: '#5b21b6', soft: 'rgba(139,92,246,0.12)',   glow: 'rgba(139,92,246,0.35)'  },
};

function App({ isTelegram = false }) {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#4a7bf7",
    "density": "regular",
    "progressStyle": "segmented"
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab]       = useAS('dashboard');
  const [prevTab, setPrev]  = useAS(null);
  const [data, setData]     = useAS(MOCK);
  const [modal, setModal]   = useAS(null);
  const [toastMsg, setToast]= useAS(null);
  const [loading, setLoading] = useAS(true);

  // ── Telegram WebApp init ──────────────────────────────────────────────────
  useAE(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);

  // ── Load data on mount ────────────────────────────────────────────────────
  useAE(() => {
    loadAllData()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Auto-refresh every 30s ────────────────────────────────────────────────
  useAE(() => {
    const id = setInterval(() => {
      loadAllData().then(d => setData(d)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Accent CSS vars ───────────────────────────────────────────────────────
  useAE(() => {
    const map = { '#4a7bf7': ACCENT_PRESETS.navy, '#06b6d4': ACCENT_PRESETS.cyan, '#8b5cf6': ACCENT_PRESETS.violet };
    const p   = map[tweaks.accent] || ACCENT_PRESETS.navy;
    const r   = document.documentElement;
    r.style.setProperty('--accent',      p.accent);
    r.style.setProperty('--accent-deep', p.deep);
    r.style.setProperty('--accent-soft', p.soft);
    r.style.setProperty('--accent-glow', p.glow);
  }, [tweaks.accent]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = (msg, kind = 'ok') => setToast({ msg, kind, t: Date.now() });
  useAE(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toastMsg]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const go = (next) => {
    if (next === tab) return;
    setPrev(tab);
    setTab(next);
    setTimeout(() => setPrev(null), 360);
  };

  // ── Refresh dashboard ─────────────────────────────────────────────────────
  const onRefresh = async () => {
    try {
      const d = await API.getDashboard();
      setData(prev => ({ ...prev, dashboard: mapDashboard(d) }));
      toast('Статистика обновлена');
    } catch (e) {
      toast('Ошибка обновления', 'bad');
    }
  };

  // ── screenProps ───────────────────────────────────────────────────────────
  const screenProps = {
    data, setData,
    onNavigate: go,
    onRefresh,
    openModal:  setModal,
    toast,
    progressStyle: tweaks.progressStyle,
  };

  const renderScreen = (id, state) => {
    const cls   = `screen-wrap ${state}`;
    const inner = (() => {
      switch (id) {
        case 'dashboard': return <ScreenDashboard {...screenProps}/>;
        case 'autopilot': return <ScreenAutopilot {...screenProps}/>;
        case 'face':      return <ScreenFace      {...screenProps}/>;
        case 'alerts':    return <ScreenAlerts    {...screenProps}/>;
        default:          return null;
      }
    })();
    return <div key={id} className={cls}>{inner}</div>;
  };

  const apActive = data.autopilot.running;
  const fuActive = data.faceUnlock.job && (data.faceUnlock.job.status === 'processing' || data.faceUnlock.job.status === 'pending');

  return (
    <div className={`tg-mini ${tweaks.density === 'compact' ? 'dense' : ''}`} style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-app)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Telegram chrome — скрывается в реальном Telegram */}
      {!isTelegram && (
        <div className="tg-chrome">
          <div className="bot">
            <div className="bot-avatar">{Icon.planet(20)}</div>
            <div className="bot-meta">
              <div className="bot-name">OxySync</div>
              <div className="bot-handle">mini app</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="tg-btn" title="меню">{Icon.kebab()}</button>
            <button className="tg-btn" title="закрыть (превью — в Telegram закрывает приложение)" onClick={() => alert('В Telegram эта кнопка закрывает Mini App')}>{Icon.x(15)}</button>
          </div>
        </div>
      )}

      {/* Screens */}
      <div className="app-body">
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 10, background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Загрузка данных...</div>
            </div>
          </div>
        )}
        {prevTab && renderScreen(prevTab, 'exit')}
        {renderScreen(tab, 'active')}
        {toastMsg && <Toast msg={toastMsg.msg} kind={toastMsg.kind}/>}

        {/* Modals */}
        <ModalZpKey
          open={modal === 'zpKey'}
          onClose={() => setModal(null)}
          value={data.faceUnlock.apiKeyMasked}
          toast={toast}
        />
        <ModalConfigPicker
          open={modal === 'configPicker'}
          onClose={() => setModal(null)}
          configs={data.configs}
          current={data.autopilot.config}
          title="Трейд конфиг"
          description="Применяется когда аккаунт получил пета и переходит в trading."
          onPick={async c => {
            try {
              await API.setAutopilotConfig({ config_id: c.id });
              setData(d => ({ ...d, autopilot: { ...d.autopilot, config: c } }));
              toast(`Трейд конфиг: ${c.name}`);
            } catch (e) { toast(e.message, 'bad'); }
          }}
          toast={toast}
        />
        <ModalConfigPicker
          open={modal === 'farmConfigPicker'}
          onClose={() => setModal(null)}
          configs={data.configs}
          current={data.autopilot.farmConfig}
          title="Фарм конфиг"
          description="Применяется пока аккаунт фармит (до получения пета)."
          onPick={async c => {
            try {
              await API.setAutopilotConfig({ farm_config_id: c.id });
              setData(d => ({ ...d, autopilot: { ...d.autopilot, farmConfig: c } }));
              toast(`Фарм конфиг: ${c.name}`);
            } catch (e) { toast(e.message, 'bad'); }
          }}
          toast={toast}
        />
        <ModalPetManager
          open={modal === 'petManager'}
          onClose={() => setModal(null)}
          selected={data.autopilot.pets}
          onAdd={async petId => {
            await API.addPet(petId);
            const pets = await API.getPets();
            setData(d => ({ ...d, autopilot: { ...d.autopilot, pets: pets.map(p => ({ id: p.pet_id, rowId: p.id, label: p.pet_id, set: '' })) } }));
          }}
          onRemove={async rowId => {
            await API.deletePet(rowId);
            setData(d => ({ ...d, autopilot: { ...d.autopilot, pets: d.autopilot.pets.filter(p => p.rowId !== rowId) } }));
            toast('Питомец удалён', 'warn');
          }}
          toast={toast}
        />
        <ModalMainAccount
          open={modal === 'mainAccount'}
          onClose={() => setModal(null)}
          value={data.autopilot.mainAccount}
          onSave={async v => {
            try {
              await API.setAutopilotConfig({ main_account: v });
              setData(d => ({ ...d, autopilot: { ...d.autopilot, mainAccount: v } }));
              toast(`Основной: @${v}`);
            } catch (e) { toast(e.message, 'bad'); }
          }}
          toast={toast}
        />
      </div>

      {/* Tab bar */}
      <nav className="tabbar">
        {TABS.map(t => {
          const isActive  = tab === t.id;
          const hasNotice =
            (t.id === 'autopilot' && apActive) ||
            (t.id === 'face'      && fuActive) ||
            (t.id === 'alerts'    && data.alerts.triggered);
          return (
            <button key={t.id} className={`tab ${isActive ? 'active' : ''}`} onClick={() => go(t.id)}>
              <span className="tab-ind"/>
              {t.icon(20)}
              <span>{t.label}</span>
              {hasNotice && <span className="badge-dot"/>}
            </button>
          );
        })}
      </nav>

      {/* Tweaks panel — только в dev-режиме (desktop preview) */}
      {!isTelegram && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Акцент"/>
          <TweakColor
            label="Цвет"
            value={tweaks.accent}
            options={['#4a7bf7', '#06b6d4', '#8b5cf6']}
            onChange={hex => setTweak('accent', hex)}
          />
          <TweakSection label="Плотность"/>
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={['regular', 'compact']}
            onChange={v => setTweak('density', v)}
          />
          <TweakSection label="Прогресс авто-пилота"/>
          <TweakRadio
            label="Стиль"
            value={tweaks.progressStyle}
            options={['segmented', 'dots']}
            onChange={v => setTweak('progressStyle', v)}
          />
        </TweaksPanel>
      )}
    </div>
  );
}

// ───── Mount — Telegram-режим или desktop preview ─────
function Mount() {
  const isTelegram = !!(window.Telegram?.WebApp?.initData);
  const ref = useAR(null);
  const [scale, setScale] = useAS(1);

  useAE(() => {
    if (isTelegram) return;
    const calc = () => {
      const margin = 24;
      const sw = (window.innerWidth  - margin * 2) / 402;
      const sh = (window.innerHeight - margin * 2) / 874;
      setScale(Math.min(1, sw, sh));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [isTelegram]);

  if (isTelegram) {
    return (
      <div style={{
        height: '100vh', width: '100%',
        background: 'var(--bg-app)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <App isTelegram={true}/>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'grid', placeItems: 'center',
      background: 'radial-gradient(ellipse at center, #14151a 0%, #08090b 70%)',
      padding: 24, boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,123,247,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', position: 'relative', zIndex: 1 }}>
        <IOSDevice width={402} height={874} dark={true}>
          <div style={{ height: '100%', paddingTop: 44, paddingBottom: 28, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
            <App isTelegram={false}/>
          </div>
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mount/>);
