// Mock data for the OxySync Mini App prototype
const MOCK = {
  dashboard: {
    activeCount: 487,
    passiveCount: 213,
    unstableCount: 41,
    totalConnected: 741,
    lastUpdated: new Date(Date.now() - 1000 * 47),
    spark: [420, 432, 445, 460, 478, 472, 481, 487, 491, 487, 485, 487],
    zp: { usd: 7.17, change24h: -1.23 },
    pets: {
      tracked: 16,
      totalKinds: 68,
      items: [
        { emoji: '🦄', name: 'Alicorn',                  count: 349, deltas: { h1: +2,  h12: +14, h24: +28,  d3: +71,  d7: +124 } },
        { emoji: '🦄', name: 'Unicorn',                  count: 132, deltas: { h1: 0,   h12: +6,  h24: +11,  d3: +24,  d7: +42  } },
        { emoji: '🦄', name: 'Golden Unicorn',           count: 18,  deltas: { h1: 0,   h12: 0,   h24: +1,   d3: +3,   d7: +5   } },
        { emoji: '🐉', name: 'Ancient Dragon',           count: 321, deltas: { h1: +4,  h12: +18, h24: +33,  d3: +88,  d7: +156 } },
        { emoji: '🐉', name: 'Dragon',                   count: 90,  deltas: { h1: -1,  h12: +3,  h24: +8,   d3: +19,  d7: +31  } },
        { emoji: '🐉', name: 'Golden Dragon',            count: 12,  deltas: { h1: 0,   h12: 0,   h24: +1,   d3: +2,   d7: +4   } },
        { emoji: '🐉', name: 'Dragonfruit Fox',          count: 11,  deltas: { h1: 0,   h12: +1,  h24: +2,   d3: +5,   d7: +7   } },
        { emoji: '🐉', name: 'Diamond Dragon',           count: 9,   deltas: { h1: 0,   h12: 0,   h24: 0,    d3: +1,   d7: +2   } },
        { emoji: '🐾', name: 'Dragonfly',                count: 373, deltas: { h1: +6,  h12: +22, h24: +41,  d3: +98,  d7: +172 } },
        { emoji: '🐾', name: 'Purrowl',                  count: 98,  deltas: { h1: +1,  h12: +4,  h24: +9,   d3: +18,  d7: +29  } },
        { emoji: '🐾', name: 'Strawberry Shortcake Ducky', count: 18, deltas: { h1: 0,  h12: +1,  h24: +2,   d3: +5,   d7: +8   } },
        { emoji: '🐾', name: 'Diamond Griffin',          count: 13,  deltas: { h1: 0,   h12: 0,   h24: +1,   d3: +2,   d7: +4   } },
        { emoji: '🥚', name: 'Egg',                      count: 11,  deltas: { h1: 0,   h12: -2,  h24: -5,   d3: -8,   d7: -12  } },
        { emoji: '🐾', name: 'Emberlight',               count: 9,   deltas: { h1: 0,   h12: 0,   h24: 0,    d3: +1,   d7: +2   } },
        { emoji: '🐾', name: 'Dango Penguins',           count: 7,   deltas: { h1: 0,   h12: 0,   h24: +1,   d3: +1,   d7: +3   } },
        { emoji: '🐾', name: 'Sushi Penguin',            count: 7,   deltas: { h1: 0,   h12: 0,   h24: 0,    d3: +2,   d7: +3   } },
      ],
    },
  },
  alerts: {
    threshold: 50,
    enabled: true,
    triggered: false,
    lastNotified: new Date(Date.now() - 1000 * 60 * 60 * 6),
    history: [
      { id: 1, kind: 'recover', at: new Date(Date.now() - 1000 * 60 * 60 * 6), value: 87 },
      { id: 2, kind: 'breach', at: new Date(Date.now() - 1000 * 60 * 60 * 8), value: 42 },
      { id: 3, kind: 'recover', at: new Date(Date.now() - 1000 * 60 * 60 * 24), value: 124 },
      { id: 4, kind: 'breach', at: new Date(Date.now() - 1000 * 60 * 60 * 26), value: 48 },
    ],
  },
  faceUnlock: {
    job: {
      id: 'zp_8f2a1c9d3b',
      status: 'processing', // pending / processing / completed / failed
      total: 124,
      processed: 87,
      unlocked: 79,
      errors: 8,
      startedAt: new Date(Date.now() - 1000 * 60 * 4),
      files: null,
    },
    autoEnabled: true,
    intervalHours: 6,
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 2.5),
    apiKeyMasked: 'zp_••••••••••3f8a',
  },
  autopilot: {
    running: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 12),
    mainAccount: 'OxyMainXyz',
    pets: [
      { id: 'soggy_spring_2026_strawberry_shortcake_ducky', label: 'Strawberry Shortcake Ducky', set: 'Soggy Spring 2026' },
      { id: 'soggy_spring_2026_rainbow_axolotl', label: 'Rainbow Axolotl', set: 'Soggy Spring 2026' },
      { id: 'winter_2025_arctic_fox_pet', label: 'Arctic Fox', set: 'Winter 2025' },
    ],
    config: { id: 14, name: 'Adopt-Me-Trade-v3' },
    batchSize: 10,
    checkInterval: 30,
    stuckTimeout: 10,
    queue: {
      active: 7,
      pending: 84,
      done: 32,
      stuck: 2,
    },
    recent: [
      { username: 'roblo_acc_2914', status: 'done', t: 35 },
      { username: 'roblo_acc_7102', status: 'active', t: 12 },
      { username: 'roblo_acc_3471', status: 'stuck', t: 11 * 60 },
      { username: 'roblo_acc_8855', status: 'active', t: 4 },
      { username: 'roblo_acc_5623', status: 'done', t: 28 },
    ],
  },
  configs: [
    { id: 12, name: 'Default Login Bot' },
    { id: 13, name: 'Pet Farm Standard' },
    { id: 14, name: 'Adopt-Me-Trade-v3' },
    { id: 15, name: 'Trade Verify v2' },
    { id: 16, name: 'Idle Pet Hatch' },
  ],
  petCatalog: [
    { id: 'soggy_spring_2026_strawberry_shortcake_ducky', label: 'Strawberry Shortcake Ducky', set: 'Soggy Spring 2026' },
    { id: 'soggy_spring_2026_rainbow_axolotl', label: 'Rainbow Axolotl', set: 'Soggy Spring 2026' },
    { id: 'soggy_spring_2026_cloud_corgi', label: 'Cloud Corgi', set: 'Soggy Spring 2026' },
    { id: 'winter_2025_arctic_fox_pet', label: 'Arctic Fox', set: 'Winter 2025' },
    { id: 'winter_2025_polar_bear_cub', label: 'Polar Bear Cub', set: 'Winter 2025' },
    { id: 'halloween_2025_ghost_kitten', label: 'Ghost Kitten', set: 'Halloween 2025' },
    { id: 'halloween_2025_pumpkin_pup', label: 'Pumpkin Pup', set: 'Halloween 2025' },
    { id: 'summer_2025_tropical_macaw', label: 'Tropical Macaw', set: 'Summer 2025' },
  ],
};

function timeAgo(d) {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s} с`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  const day = Math.floor(h / 24);
  return `${day} д`;
}

function timeIn(d) {
  if (!d) return '—';
  const s = Math.floor((new Date(d).getTime() - Date.now()) / 1000);
  if (s < 60) return `< 1 мин`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
}

function fmtElapsed(startedAt) {
  if (!startedAt) return '—';
  const s = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  if (m < 60) return `${m}:${String(ss).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h}ч ${m % 60}м`;
}

Object.assign(window, { MOCK, timeAgo, timeIn, fmtElapsed });
