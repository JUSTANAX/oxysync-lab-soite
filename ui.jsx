// Shared UI primitives — icons, sparkline, generic chunks
const { useState, useEffect, useRef, useMemo } = React;

// ───── Icons (1.6 stroke, 20×20 viewBox, currentColor) ─────
const Icon = {
  dashboard: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6" height="8" rx="1.5"/>
      <rect x="2.5" y="12.5" width="6" height="5" rx="1.5"/>
      <rect x="11.5" y="2.5" width="6" height="5" rx="1.5"/>
      <rect x="11.5" y="9.5" width="6" height="8" rx="1.5"/>
    </svg>
  ),
  bolt: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L4 11.5h5L8.5 18l7-9.5h-5L11 2z"/>
    </svg>
  ),
  face: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="4"/>
      <circle cx="7.5" cy="8.5" r="0.8" fill="currentColor"/>
      <circle cx="12.5" cy="8.5" r="0.8" fill="currentColor"/>
      <path d="M7 13c.8.7 1.9 1 3 1s2.2-.3 3-1"/>
    </svg>
  ),
  bell: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8.5a5 5 0 0110 0V12l1.5 2.5h-13L5 12V8.5z"/>
      <path d="M8 16.5a2 2 0 004 0"/>
    </svg>
  ),
  refresh: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4v4h-4M4 16v-4h4"/>
      <path d="M16 8a6 6 0 00-10.5-2L4 8M4 12a6 6 0 0010.5 2L16 12"/>
    </svg>
  ),
  chevR: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5l5 5-5 5"/>
    </svg>
  ),
  chevD: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5"/>
    </svg>
  ),
  plus: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4v12M4 10h12"/>
    </svg>
  ),
  x: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15"/>
    </svg>
  ),
  edit: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3l3 3-9 9H5v-3l9-9z"/>
    </svg>
  ),
  kebab: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="4" r="1.4"/>
      <circle cx="10" cy="10" r="1.4"/>
      <circle cx="10" cy="16" r="1.4"/>
    </svg>
  ),
  play: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 4.5v11l9-5.5-9-5.5z"/>
    </svg>
  ),
  stop: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor">
      <rect x="5" y="5" width="10" height="10" rx="1.5"/>
    </svg>
  ),
  download: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12"/>
    </svg>
  ),
  key: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="13.5" r="3.5"/>
      <path d="M9 11l8-8m-3 0h3v3"/>
    </svg>
  ),
  warn: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3l8 14H2l8-14z"/>
      <path d="M10 8v4M10 14.5v.5"/>
    </svg>
  ),
  check: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-9"/>
    </svg>
  ),
  search: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5"/>
      <path d="M13 13l4 4"/>
    </svg>
  ),
  settings: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"/>
    </svg>
  ),
  planet: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#4a7bf7"/>
      <path d="M3 13c5 1 22 1 26 0" stroke="#2d3a8c" strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
      <path d="M5 22c6 1 16 1 22 0" stroke="#2d3a8c" strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
      <ellipse cx="11" cy="17" rx="3" ry="1" fill="#e3ecff" opacity="0.7"/>
      <ellipse cx="22" cy="20" rx="2.5" ry="0.8" fill="#e3ecff" opacity="0.7"/>
    </svg>
  ),
};

// ───── Sparkline ─────
function Sparkline({ data, w = 80, h = 24, stroke = 'currentColor', fill = 'none' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 3) - 1.5]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` : `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} className="spark">
      <path d={d} stroke={stroke} strokeWidth="1.4" fill={fill} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke}/>
    </svg>
  );
}

// ───── Segmented progress bar ─────
function SegBar({ active, pending, done, stuck, style = 'segmented' }) {
  const total = active + pending + done + stuck || 1;
  if (style === 'dots') {
    const a = Array(active).fill('active');
    const d = Array(done).fill('done');
    const p = Array(pending).fill('pending');
    const s = Array(stuck).fill('stuck');
    const all = [...a, ...d, ...s, ...p];
    return (
      <div className="dots">
        {all.slice(0, 80).map((k, i) => <span key={i} className={`dot ${k === 'pending' ? '' : k}`}/>)}
        {all.length > 80 && <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center', marginLeft: 4 }} className="mono">+{all.length - 80}</span>}
      </div>
    );
  }
  return (
    <div className="seg-bar">
      <div className="seg done" style={{ flex: done }}/>
      <div className="seg active" style={{ flex: active }}/>
      <div className="seg stuck" style={{ flex: stuck }}/>
      <div className="seg pending" style={{ flex: pending }}/>
    </div>
  );
}

// ───── Stat tile ─────
function Stat({ label, value, tone = 'idle', sub, spark }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="lbl">{label}</div>
      <div className="v">{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }} className="mono">{sub}</div>}
      {spark && <div style={{ marginTop: 6 }}><Sparkline data={spark} w={84} h={16} stroke="currentColor"/></div>}
    </div>
  );
}

// ───── Toggle switch ─────
function Toggle({ on, onChange }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}/>;
}

// ───── Stepper ─────
function Stepper({ value, onChange, min = 0, max = 999, step = 1, suffix = '' }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div className="stepper" style={{ width: 140 }}>
      <button onClick={dec} disabled={value <= min}>−</button>
      <div className="val">{value}{suffix && <span style={{ color: 'var(--text-3)', marginLeft: 2 }}>{suffix}</span>}</div>
      <button onClick={inc} disabled={value >= max}>+</button>
    </div>
  );
}

// ───── Section header ─────
function SectionHdr({ label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 8px' }}>
      <div className="label">{label}</div>
      {action}
    </div>
  );
}

// ───── Toast ─────
function Toast({ msg, kind = 'ok' }) {
  if (!msg) return null;
  const ico = kind === 'ok' ? Icon.check(14) : kind === 'warn' ? Icon.warn(14) : Icon.x(14);
  const tone = kind === 'ok' ? '#4ade80' : kind === 'warn' ? '#fbbf24' : '#fb7185';
  return (
    <div className="toast-slot">
      <div className="toast" style={{ pointerEvents: 'auto' }}>
        <span style={{ color: tone, display: 'flex' }}>{ico}</span>
        <span>{msg}</span>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Sparkline, SegBar, Stat, Toggle, Stepper, SectionHdr, Toast });
