// OxySync — API layer
// Connects Mini App to the bot's HTTP server (api_server.py)

// ── Config ──────────────────────────────────────────────────────────────────
// Set window.API_BASE_URL in the HTML <script> block before loading this file
const API_BASE = (window.API_BASE_URL || '').replace(/\/$/, '');

// ── Core fetch ───────────────────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const tg = window.Telegram?.WebApp;
  const headers = { 'Content-Type': 'application/json' };
  if (tg?.initData) headers['X-Init-Data'] = tg.initData;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Named API calls ───────────────────────────────────────────────────────────
const API = {
  getDashboard:       ()       => apiFetch('GET',    '/api/dashboard'),
  getAlerts:          ()       => apiFetch('GET',    '/api/alerts'),
  setAlerts:          body     => apiFetch('PUT',    '/api/alerts', body),
  getAutopilot:       ()       => apiFetch('GET',    '/api/autopilot'),
  setAutopilotConfig: body     => apiFetch('PUT',    '/api/autopilot/config', body),
  getPets:            ()       => apiFetch('GET',    '/api/autopilot/pets'),
  addPet:             pet_id   => apiFetch('POST',   '/api/autopilot/pets', { pet_id }),
  deletePet:          id       => apiFetch('DELETE', `/api/autopilot/pets/${id}`),
  getConfigs:         ()       => apiFetch('GET',    '/api/autopilot/configs'),
  startAutopilot:     ()       => apiFetch('POST',   '/api/autopilot/start'),
  stopAutopilot:      ()       => apiFetch('POST',   '/api/autopilot/stop'),
  getFaceUnlock:      ()       => apiFetch('GET',    '/api/faceunlock'),
  startFaceUnlock:    ()       => apiFetch('POST',   '/api/faceunlock/start'),
  cancelFaceUnlock:   ()       => apiFetch('POST',   '/api/faceunlock/cancel'),
  setFaceUnlock:      body     => apiFetch('PUT',    '/api/faceunlock', body),
  downloadFile: async (filename) => {
    const tg = window.Telegram?.WebApp;
    const headers = {};
    if (tg?.initData) headers['X-Init-Data'] = tg.initData;
    const res = await fetch(`${API_BASE}/api/faceunlock/download/${encodeURIComponent(filename)}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ── Data mappers ─────────────────────────────────────────────────────────────
function mapDashboard(d) {
  if (!d) return MOCK.dashboard;
  return {
    ...MOCK.dashboard,
    activeCount:    d.active_count   || 0,
    passiveCount:   d.passive_count  || 0,
    unstableCount:  d.unstable_count || 0,
    totalConnected: (d.active_count || 0) + (d.passive_count || 0) + (d.unstable_count || 0),
    zpBalance:      d.zp_balance?.effective ?? null,
    zpReserved:     d.zp_balance?.reserved  ?? 0,
    lastUpdated:    new Date(),
  };
}

function mapAutopilot(ap, existingConfigs) {
  if (!ap) return MOCK.autopilot;
  const configName     = existingConfigs?.find(c => c.id === ap.config_id)?.name      || (ap.config_id      ? `Config ${ap.config_id}`      : 'Не задан');
  const farmConfigName = existingConfigs?.find(c => c.id === ap.farm_config_id)?.name  || (ap.farm_config_id ? `Config ${ap.farm_config_id}` : 'Не задан');
  return {
    ...MOCK.autopilot,
    running:       ap.running      || false,
    startedAt:     ap.started_at   ? new Date(ap.started_at.replace(' ', 'T') + 'Z') : null,
    mainAccount:   ap.main_account || '',
    pets:          (ap.pets || []).map(p => ({ id: p.pet_id, rowId: p.id, label: p.pet_id, set: '' })),
    config:        { id: ap.config_id      || null, name: configName },
    farmConfig:    { id: ap.farm_config_id || null, name: farmConfigName },
    tradesDone:         ap.trades_done           || 0,
    maxTradersPerServer: ap.max_traders_per_server ?? 10,
    checkInterval:      ap.check_interval        || 30,
    stuckTimeout:       ap.stuck_timeout         || 10,
    queue: {
      farming: ap.queue?.farming || 0,
      trading: ap.queue?.trading || 0,
      stuck:   ap.queue?.stuck   || 0,
      total:   ap.queue?.total   || 0,
    },
    recent: ap.recent
      ? ap.recent.map(r => ({ username: r.username, type: r.type, time: r.time ? new Date(r.time.replace(' ', 'T') + (r.time.includes('Z') ? '' : 'Z')) : null }))
      : [],
  };
}

function mapAlerts(al) {
  if (!al) return MOCK.alerts;
  return { ...MOCK.alerts, threshold: al.threshold ?? 50, enabled: al.enabled ?? false };
}

function mapFaceUnlock(fu) {
  if (!fu) return MOCK.faceUnlock;
  const job = fu.job;
  return {
    ...MOCK.faceUnlock,
    apiKeyMasked:  fu.zp_key         ? 'zp_••••••••••••••' : 'не задан',
    autoEnabled:   fu.auto_enabled   ?? MOCK.faceUnlock.autoEnabled,
    intervalHours: fu.interval_hours ?? MOCK.faceUnlock.intervalHours,
    nextRunAt:     fu.next_run_at    ? new Date(fu.next_run_at) : MOCK.faceUnlock.nextRunAt,
    job: job ? {
      id:        job.job_id    || '',
      status:    job.status    || 'pending',
      total:     job.total_accounts || 0,
      processed: (job.successful || 0) + (job.failed || 0) + (job.other_failed || 0),
      unlocked:  job.successful   || 0,
      errors:    (job.failed || 0) + (job.other_failed || 0),
      startedAt: new Date(Date.now() - 60000),
      files:     job.result_files || null,
    } : null,
  };
}

// ── Load all data ─────────────────────────────────────────────────────────────
async function loadAllData() {
  const [dash, alerts, ap, fu, cfgs] = await Promise.allSettled([
    API.getDashboard(),
    API.getAlerts(),
    API.getAutopilot(),
    API.getFaceUnlock(),
    API.getConfigs(),
  ]);
  const configs = (cfgs.status === 'fulfilled' && cfgs.value.length > 0) ? cfgs.value : MOCK.configs;
  return {
    dashboard:  mapDashboard(dash.status === 'fulfilled'   ? dash.value   : null),
    alerts:     mapAlerts(alerts.status === 'fulfilled'    ? alerts.value : null),
    autopilot:  mapAutopilot(ap.status === 'fulfilled'     ? ap.value     : null, configs),
    faceUnlock: mapFaceUnlock(fu.status === 'fulfilled'    ? fu.value     : null),
    configs,
    petCatalog: MOCK.petCatalog,
  };
}

// ── Debounce helper ───────────────────────────────────────────────────────────
function makeDebounced(fn, delay = 800) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

Object.assign(window, { API, apiFetch, loadAllData, mapDashboard, mapAutopilot, mapAlerts, mapFaceUnlock, makeDebounced });
