// frontend/src/pages/merchant/Analytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = `http://${window.location.hostname}:5000/api`;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dayem_token')}`
});
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: authHeaders() }).then(r => r.json());

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — DAYEM Brand
═══════════════════════════════════════════════════════ */
const NAVY   = '#0C2540';
const NAVY2  = '#091D33';
const NAVY3  = '#071628';
const GOLD   = '#D4AF37';
const GOLD2  = '#B8962E';
const GOLD3  = 'rgba(212,175,55,0.18)';
const GOLD4  = 'rgba(212,175,55,0.07)';
const CREAM  = '#EAE0C8';
const MUTED  = '#6B85A0';
const DIM    = '#334455';
const GREEN  = '#00C896';
const RED    = '#FF4D6D';
const BLUE   = '#4D9FFF';
const PURPLE = '#A78BFA';
const CYAN   = '#22D3EE';
const AMBER  = '#FBBF24';

const STATUS = {
  new:        { ar: 'جديد',         color: AMBER  },
  confirmed:  { ar: 'مؤكد',         color: BLUE   },
  processing: { ar: 'جاري التجهيز', color: PURPLE },
  shipped:    { ar: 'تم الشحن',     color: CYAN   },
  delivered:  { ar: 'تم التوصيل',   color: GREEN  },
  cancelled:  { ar: 'ملغي',          color: RED    },
};

const PERIODS = [
  { key: '7d',  label: '٧ أيام'  },
  { key: '30d', label: '٣٠ يوم'  },
  { key: '90d', label: '٩٠ يوم'  },
  { key: '1y',  label: 'سنة'     },
];

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const num = (n) => Number(Math.round(n || 0)).toLocaleString('en-US');
const cur = (n) => `${num(n)} ج`;
const kk  = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : num(n);

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.an { background: ${NAVY3}; min-height: 100vh; direction: rtl; font-family: 'Tajawal', sans-serif; color: ${CREAM}; overflow-x: hidden; }

/* ── Decorative bg lines ── */
.an::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(212,175,55,0.03) 80px),
    repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(212,175,55,0.03) 80px);
}

.an-wrap { position: relative; z-index: 1; max-width: 1320px; margin: 0 auto; padding: 36px 40px 60px; }
@media (max-width: 768px) { .an-wrap { padding: 20px 16px 40px; } }

/* ── Gold top bar ── */
.an-topbar {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD} 70%, transparent 100%);
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
}

/* ── HEADER ── */
.an-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 20px; margin-bottom: 44px; padding-top: 12px;
}

.an-logo-mark {
  font-size: 11px; letter-spacing: 5px; color: ${GOLD};
  font-weight: 400; margin-bottom: 10px; opacity: 0.8;
  display: flex; align-items: center; gap: 10px;
}
.an-logo-mark::before, .an-logo-mark::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, ${GOLD}60);
}
.an-logo-mark::before { background: linear-gradient(270deg, transparent, ${GOLD}60); }

.an-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 700; line-height: 1.05;
  color: #fff; letter-spacing: -1px;
}
.an-h1 em { color: ${GOLD}; font-style: italic; }

.an-subdate {
  font-size: 12px; color: ${MUTED}; margin-top: 8px; letter-spacing: 1px;
}

.an-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }

/* Back btn */
.an-back {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 20px;
  border: 1px solid rgba(212,175,55,0.3);
  background: transparent;
  color: ${GOLD}; font-family: 'Tajawal', sans-serif;
  font-size: 13px; font-weight: 500; letter-spacing: 1px;
  cursor: pointer; transition: all 0.25s;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
}
.an-back:hover { background: ${GOLD4}; border-color: ${GOLD}; color: #fff; }

/* Period tabs */
.an-tabs {
  display: flex; gap: 0;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.2);
}
.an-tab {
  padding: 8px 20px; border: none; background: transparent;
  color: ${MUTED}; font-family: 'Tajawal', sans-serif;
  font-size: 13px; font-weight: 500; cursor: pointer;
  border-left: 1px solid rgba(212,175,55,0.1);
  transition: all 0.2s;
}
.an-tab:first-child { border-left: none; }
.an-tab:hover { color: ${CREAM}; background: ${GOLD4}; }
.an-tab.on { background: ${GOLD}; color: ${NAVY}; font-weight: 700; }

/* ── GOLD RULE ── */
.an-rule {
  height: 1px; margin-bottom: 36px;
  background: linear-gradient(90deg, ${GOLD}60 0%, ${GOLD}20 60%, transparent 100%);
}

/* ── KPI STRIP ── */
.an-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: rgba(212,175,55,0.12);
  border: 1px solid rgba(212,175,55,0.12);
  margin-bottom: 28px;
}
@media (max-width: 900px) { .an-kpis { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 480px) { .an-kpis { grid-template-columns: 1fr; } }

.an-kpi {
  background: ${NAVY2}; padding: 28px 24px;
  position: relative; overflow: hidden;
  transition: background 0.3s;
}
.an-kpi:hover { background: #0D2748; }
.an-kpi-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.an-kpi-lbl {
  font-size: 11px; font-weight: 500; letter-spacing: 2px;
  color: ${MUTED}; text-transform: uppercase; margin-bottom: 14px;
}
.an-kpi-val {
  font-family: 'Playfair Display', serif;
  font-size: clamp(26px, 3vw, 40px); font-weight: 700;
  color: #fff; line-height: 1; margin-bottom: 14px;
}
.an-kpi-val sub { font-size: 0.45em; color: ${GOLD}; vertical-align: 0.15em; margin-left: 4px; font-family: 'Tajawal',sans-serif; font-weight: 400; }
.an-kpi-foot { display: flex; align-items: center; justify-content: space-between; }
.an-kpi-sub  { font-size: 11px; color: ${DIM}; }
.badge { font-size: 11px; font-weight: 700; padding: 3px 9px; letter-spacing: 0.5px; }
.badge.up   { background: rgba(0,200,150,0.12); color: ${GREEN}; border: 1px solid rgba(0,200,150,0.25); }
.badge.dn   { background: rgba(255,77,109,0.12); color: ${RED};   border: 1px solid rgba(255,77,109,0.25); }
.badge.fl   { background: rgba(255,255,255,0.04); color: ${MUTED}; border: 1px solid ${DIM}; }

/* ── CARD ── */
.an-card {
  background: ${NAVY2};
  border: 1px solid rgba(212,175,55,0.12);
  padding: 28px; position: relative;
  transition: border-color 0.3s;
}
.an-card:hover { border-color: rgba(212,175,55,0.28); }
.an-card-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px; padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.an-card-title {
  font-size: 13px; font-weight: 700; letter-spacing: 2px;
  color: ${MUTED}; text-transform: uppercase;
}
.an-card-ico {
  width: 30px; height: 30px;
  border: 1px solid rgba(212,175,55,0.2);
  display: flex; align-items: center; justify-content: center;
  color: ${GOLD}; font-size: 14px;
}

/* GRID */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.g3 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; margin-bottom: 16px; }
@media (max-width: 860px) { .g2, .g3 { grid-template-columns: 1fr; } }

/* ── SKELETON ── */
.skel {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.02) 0%,
    rgba(212,175,55,0.06) 50%,
    rgba(255,255,255,0.02) 100%);
  background-size: 200% 100%;
  animation: sk 1.8s ease infinite;
  border-radius: 2px;
}
@keyframes sk { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

/* ── EMPTY ── */
.empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 52px;
  color: ${DIM};
}
.empty-ico { font-size: 30px; opacity: 0.25; }
.empty-txt { font-size: 12px; letter-spacing: 2px; color: ${DIM}; }

/* ── TABLE ── */
.an-tbl { width: 100%; border-collapse: collapse; }
.an-tbl th {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: ${DIM}; padding: 0 14px 14px; text-align: right;
  border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600;
}
.an-tbl td {
  padding: 13px 14px; border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 13px; color: ${CREAM};
}
.an-tbl tr:last-child td { border-bottom: none; }
.an-tbl tbody tr { transition: background 0.2s; }
.an-tbl tbody tr:hover { background: ${GOLD4}; }

.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; font-size: 11px; font-weight: 600;
  letter-spacing: 0.5px;
}
.pill::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }

/* ── FADE IN ── */
.fade { animation: fi 0.55s ease both; }
@keyframes fi { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
.fade:nth-child(1){animation-delay:0.04s}
.fade:nth-child(2){animation-delay:0.08s}
.fade:nth-child(3){animation-delay:0.13s}
.fade:nth-child(4){animation-delay:0.18s}
.fade:nth-child(5){animation-delay:0.23s}
.fade:nth-child(6){animation-delay:0.28s}
.fade:nth-child(7){animation-delay:0.33s}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.25);border-radius:2px}
`;

/* ═══════════════════════════════════════════════════════
   LINE CHART
═══════════════════════════════════════════════════════ */
function LineChart({ data }) {
  const [hov, setHov] = useState(null);
  if (!data?.length) return (
    <div className="empty"><div className="empty-ico">◈</div><div className="empty-txt">لا توجد بيانات</div></div>
  );

  const W = 860, H = 280;
  const p = { t: 28, r: 28, b: 48, l: 68 };
  const iW = W - p.l - p.r, iH = H - p.t - p.b;

  const maxR = Math.max(...data.map(d => d.revenue), 1);
  const maxO = Math.max(...data.map(d => d.orders), 1);
  const xs = i => (i / Math.max(data.length - 1, 1)) * iW;
  const yr = v => iH - (v / maxR) * iH;
  const yo = v => iH - (v / maxO) * iH;

  const rPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${yr(d.revenue).toFixed(1)}`).join(' ');
  const oPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${yo(d.orders).toFixed(1)}`).join(' ');
  const rArea = `${rPath} L${xs(data.length - 1)},${iH} L0,${iH} Z`;

  const step  = Math.max(1, Math.ceil(data.length / 8));
  const ytix  = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
      onMouseLeave={() => setHov(null)}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.25" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <filter id="gl">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g transform={`translate(${p.l},${p.t})`}>
        {/* Grid */}
        {ytix.map((t, i) => (
          <line key={i} x1={0} y1={iH * (1 - t)} x2={iW} y2={iH * (1 - t)}
            stroke={i === 0 ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)'}
            strokeWidth="1" strokeDasharray={i === 0 ? '' : '5 7'} />
        ))}

        {/* Y labels */}
        {ytix.map((t, i) => (
          <text key={i} x={-10} y={iH * (1 - t) + 4}
            fill={MUTED} fontSize="11" textAnchor="end" fontFamily="Tajawal">
            {t === 0 ? '0' : kk(maxR * t)}
          </text>
        ))}

        {/* Area + lines */}
        <path d={rArea} fill="url(#revGrad)" />
        <path d={rPath} fill="none" stroke={GOLD} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" filter="url(#gl)" />
        <path d={oPath} fill="none" stroke={BLUE} strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="7 5" opacity="0.65" />

        {/* Hover */}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHov(i)}>
            <rect x={xs(i) - 15} y={0} width={30} height={iH}
              fill="transparent" style={{ cursor: 'crosshair' }} />
            {hov === i && (
              <>
                <line x1={xs(i)} y1={0} x2={xs(i)} y2={iH}
                  stroke={`${GOLD}30`} strokeWidth="1" strokeDasharray="5 5" />
                <g transform={`translate(${Math.min(xs(i) + 14, iW - 155)},${Math.max(yr(d.revenue) - 76, 0)})`}>
                  <rect x={0} y={0} width={150} height={68} rx={2}
                    fill={NAVY} stroke={`${GOLD}40`} strokeWidth="1" />
                  <text x={10} y={18} fill={GOLD} fontSize="11"
                    fontFamily="Tajawal" fontWeight="700">{d.label}</text>
                  <text x={10} y={38} fill={CREAM} fontSize="12"
                    fontFamily="Tajawal">{cur(d.revenue)}</text>
                  <text x={10} y={56} fill={BLUE} fontSize="11"
                    fontFamily="Tajawal">{num(d.orders)} طلب</text>
                </g>
              </>
            )}
            <circle cx={xs(i)} cy={yr(d.revenue)} r={hov === i ? 5.5 : 3.5}
              fill={GOLD} stroke={NAVY3} strokeWidth="2"
              style={{ transition: 'r 0.15s' }} />
          </g>
        ))}

        {/* X labels */}
        {data.filter((_, i) => i % step === 0 || i === data.length - 1)
          .map((d, _, arr) => {
            const idx = data.indexOf(d);
            return (
              <text key={idx} x={xs(idx)} y={iH + 30}
                fill={MUTED} fontSize="10" textAnchor="middle" fontFamily="Tajawal">
                {d.label?.slice(-5)}
              </text>
            );
          })}

        <line x1={0} y1={iH} x2={iW} y2={iH}
          stroke={`${GOLD}20`} strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════ */
function DonutChart({ data }) {
  const [hov, setHov] = useState(null);
  if (!data?.length) return (
    <div className="empty"><div className="empty-ico">◉</div><div className="empty-txt">لا توجد بيانات</div></div>
  );

  const total = data.reduce((s, d) => s + d.count, 0);
  const cx = 110, cy = 110, R = 90, ri = 58;
  let ang = -Math.PI / 2;

  const slices = data.map(d => {
    const sw  = (d.count / total) * Math.PI * 2;
    const mid = ang + sw / 2;
    const arc = (r) => `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
    const arc2= (r) => `${cx + r * Math.cos(ang + sw)},${cy + r * Math.sin(ang + sw)}`;
    const lg  = sw > Math.PI ? 1 : 0;
    const path= `M${arc(ri)} A${ri},${ri} 0 ${lg},1 ${arc2(ri)} L${arc2(R)} A${R},${R} 0 ${lg},0 ${arc(R)} Z`;
    ang += sw;
    return { ...d, path, mid, sw };
  });

  const active = hov !== null ? slices[hov] : null;

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 220 220" style={{ width: '200px', flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hov === null || hov === i ? 1 : 0.2}
            transform={hov === i
              ? `translate(${(Math.cos(s.mid) * 6).toFixed(2)},${(Math.sin(s.mid) * 6).toFixed(2)})`
              : ''}
            style={{ cursor: 'pointer', transition: 'all 0.25s' }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          />
        ))}
        {/* Decorative inner ring */}
        <circle cx={cx} cy={cy} r={ri - 4}
          fill="none" stroke={`${GOLD}15`} strokeWidth="1" />
        {/* Center */}
        <text x={cx} y={cy - 10} textAnchor="middle"
          fill={active ? active.color : GOLD}
          fontSize="26" fontFamily="'Playfair Display',serif" fontWeight="700">
          {active ? active.count : total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle"
          fill={MUTED} fontSize="11" fontFamily="Tajawal">
          {active ? active.label : 'إجمالي'}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle"
          fill={DIM} fontSize="10" fontFamily="Tajawal">
          {active ? `${((active.count / total) * 100).toFixed(0)}%` : 'الطلبات'}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
        {slices.map((s, i) => (
          <div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px',
              background: hov === i ? GOLD4 : 'transparent',
              border: `1px solid ${hov === i ? `${GOLD}25` : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}>
            <div style={{ width: '3px', height: '34px', background: s.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: CREAM, fontSize: '13px', fontWeight: '600', fontFamily: 'Tajawal' }}>
                {s.label}
              </div>
              <div style={{ color: MUTED, fontSize: '11px', fontFamily: 'Tajawal', marginTop: '2px' }}>
                {num(s.count)} طلب · {((s.count / total) * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ color: s.color, fontSize: '13px', fontFamily: 'Tajawal', fontWeight: '700', flexShrink: 0 }}>
              {cur(s.revenue)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOP PRODUCTS
═══════════════════════════════════════════════════════ */
function TopProducts({ data }) {
  if (!data?.length) return (
    <div className="empty"><div className="empty-ico">◆</div><div className="empty-txt">لا توجد بيانات</div></div>
  );
  const max = Math.max(...data.map(d => d.totalRevenue), 1);
  const medals = [GOLD, '#C0C0C0', '#CD7F32'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {data.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Rank */}
          <div style={{
            width: '34px', height: '34px', flexShrink: 0,
            border: `1px solid ${medals[i] || `${GOLD}20`}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: medals[i] || DIM, fontSize: '14px', fontWeight: '900',
            fontFamily: "'Playfair Display',serif",
            background: i < 3 ? `${medals[i]}0D` : 'transparent'
          }}>
            {i + 1}
          </div>

          {/* Image */}
          {p.image && (
            <img src={p.image} alt={p.name}
              style={{ width: '42px', height: '42px', objectFit: 'cover', border: `1px solid ${GOLD3}`, flexShrink: 0 }} />
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
              <span style={{ color: CREAM, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <span style={{ color: GOLD, fontSize: '13px', fontWeight: '700', flexShrink: 0, fontFamily: 'Tajawal' }}>
                {cur(p.totalRevenue)}
              </span>
            </div>
            {/* Bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                height: '100%', width: `${(p.totalRevenue / max) * 100}%`,
                background: `linear-gradient(90deg, ${GOLD2}, ${GOLD})`,
                boxShadow: `0 0 10px ${GOLD}50`,
              }} />
            </div>
            <div style={{ color: MUTED, fontSize: '11px', marginTop: '5px' }}>
              {num(p.totalSold)} وحدة مباعة
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HEATMAP
═══════════════════════════════════════════════════════ */
function Heatmap({ data }) {
  const [hov, setHov] = useState(null);
  if (!data?.length) return (
    <div className="empty"><div className="empty-ico">◎</div><div className="empty-txt">لا توجد بيانات</div></div>
  );

  const DAYS  = ['أحد','اثن','ثلث','أرب','خمس','جمع','سبت'];
  const max   = Math.max(...data.map(d => d.count), 1);
  const grid  = {};
  data.forEach(({ day, hour, count }) => { grid[`${day}-${hour}`] = count; });

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '580px' }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', marginRight: '44px', marginBottom: '8px' }}>
          {[0, 4, 8, 12, 16, 20].map(h => (
            <div key={h} style={{
              flex: '4 0 0', color: MUTED, fontSize: '10px',
              fontFamily: 'Tajawal', textAlign: 'center'
            }}>{h}:00</div>
          ))}
        </div>

        {DAYS.map((day, di) => (
          <div key={di} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
              width: '40px', color: MUTED, fontSize: '11px',
              fontFamily: 'Tajawal', textAlign: 'right',
              paddingRight: '8px', flexShrink: 0
            }}>{day}</div>
            <div style={{ display: 'flex', flex: 1, gap: '2px' }}>
              {Array.from({ length: 24 }, (_, h) => {
                const val  = grid[`${di}-${h}`] || 0;
                const heat = val / max;
                const key  = `${di}-${h}`;
                return (
                  <div key={h}
                    title={`${day} ${h}:00 — ${val} طلب`}
                    onMouseEnter={() => setHov(key)}
                    onMouseLeave={() => setHov(null)}
                    style={{
                      flex: 1, height: '24px',
                      background: val === 0
                        ? 'rgba(255,255,255,0.025)'
                        : `rgba(212,175,55,${0.08 + heat * 0.88})`,
                      border: `1px solid ${hov === key ? GOLD : 'transparent'}`,
                      cursor: 'default',
                      transition: 'transform 0.15s, border-color 0.15s',
                      transform: hov === key ? 'scaleY(1.35)' : 'scaleY(1)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', marginRight: '44px' }}>
          <span style={{ color: MUTED, fontSize: '10px', fontFamily: 'Tajawal' }}>أقل</span>
          {[0.04, 0.2, 0.38, 0.56, 0.74, 0.92].map((v, i) => (
            <div key={i} style={{ width: '20px', height: '12px', background: `rgba(212,175,55,${v})` }} />
          ))}
          <span style={{ color: MUTED, fontSize: '10px', fontFamily: 'Tajawal' }}>أكثر</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════ */
function KPI({ label, value, unit, growth, sub, color = GOLD }) {
  const up = growth > 0, dn = growth < 0;
  return (
    <div className="an-kpi">
      <div className="an-kpi-accent" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="an-kpi-lbl">{label}</div>
      <div className="an-kpi-val">
        {value}
        {unit && <sub>{unit}</sub>}
      </div>
      <div className="an-kpi-foot">
        <div className="an-kpi-sub">{sub || '\u00A0'}</div>
        {growth !== undefined && (
          <span className={`badge ${up ? 'up' : dn ? 'dn' : 'fl'}`}>
            {up ? '↑' : dn ? '↓' : '—'} {Math.abs(growth)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CARD SHELL
═══════════════════════════════════════════════════════ */
function Card({ title, icon, children, style = {} }) {
  return (
    <div className="an-card" style={style}>
      <div className="an-card-hd">
        <div className="an-card-title">{title}</div>
        {icon && <div className="an-card-ico">{icon}</div>}
      </div>
      {children}
    </div>
  );
}

const Skel = ({ h = 40, mb = 0 }) =>
  <div className="skel" style={{ height: h, marginBottom: mb }} />;

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function Analytics() {
  const nav = useNavigate();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null, revenueChart: [], topProducts: [],
    ordersByStatus: [], heatmap: [], recentOrders: []
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, revenueChart, topProducts, ordersByStatus, heatmap, recentOrders] =
        await Promise.all([
          apiFetch(`/analytics/overview?period=${period}`),
          apiFetch(`/analytics/revenue-chart?period=${period}`),
          apiFetch(`/analytics/top-products?period=${period}`),
          apiFetch(`/analytics/orders-by-status?period=${period}`),
          apiFetch(`/analytics/hourly-heatmap?period=${period}`),
          apiFetch(`/analytics/recent-orders`),
        ]);
      setData({ overview, revenueChart, topProducts, ordersByStatus, heatmap, recentOrders });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const ov = data.overview;
  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="an">
      <style>{CSS}</style>
      <div className="an-topbar" />

      <div className="an-wrap">

        {/* ── HEADER ── */}
        <div className="an-header fade">
          <div>
            <div className="an-logo-mark">DAYEM ∞ — ANALYTICS</div>
            <h1 className="an-h1">لوحة <em>التحليلات</em></h1>
            <div className="an-subdate">{dateStr}</div>
          </div>
          <div className="an-header-right">
            <button className="an-back" onClick={() => nav('/dashboard')}>
              ← الرئيسية
            </button>
            <div className="an-tabs">
              {PERIODS.map(p => (
                <button key={p.key}
                  className={`an-tab${period === p.key ? ' on' : ''}`}
                  onClick={() => setPeriod(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="an-rule" />

        {/* ── KPIs ── */}
        <div className="an-kpis fade">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="an-kpi">
                <Skel h={10} mb={16} />
                <Skel h={38} mb={14} />
                <Skel h={10} />
              </div>
            ))
          ) : (<>
            <KPI label="إجمالي الإيرادات"  value={num(ov?.revenue?.value)}      unit="ج"  growth={ov?.revenue?.growth}  color={GOLD}   />
            <KPI label="الطلبات"            value={num(ov?.orders?.value)}                 growth={ov?.orders?.growth}   color={BLUE}   sub={ov?.orders?.pending ? `${ov.orders.pending} طلب معلق` : undefined} />
            <KPI label="متوسط قيمة الطلب"  value={num(ov?.avgOrderValue?.value)} unit="ج"                               color={PURPLE} />
            <KPI label="المنتجات النشطة"   value={num(ov?.products?.value)}                                              color={GREEN}  />
          </>)}
        </div>

        {/* ── Revenue Chart ── */}
        <div className="fade" style={{ marginBottom: '16px' }}>
          <Card title="المبيعات والطلبات عبر الزمن" icon="↗">
            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
              {[
                { color: GOLD, label: 'الإيرادات', dash: false },
                { color: BLUE, label: 'الطلبات',   dash: true  },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="22" height="10">
                    <line x1="0" y1="5" x2="22" y2="5"
                      stroke={l.color} strokeWidth="2.5"
                      strokeDasharray={l.dash ? '6 4' : ''} />
                  </svg>
                  <span style={{ color: MUTED, fontSize: '12px', fontFamily: 'Tajawal', letterSpacing: '1px' }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
            {loading ? <Skel h={240} /> : <LineChart data={data.revenueChart} />}
          </Card>
        </div>

        {/* ── Donut + Top Products ── */}
        <div className="g2 fade">
          <Card title="توزيع الطلبات حسب الحالة" icon="◉">
            {loading ? <Skel h={220} /> : <DonutChart data={data.ordersByStatus} />}
          </Card>
          <Card title="أفضل المنتجات مبيعاً" icon="◆">
            {loading ? <Skel h={220} /> : <TopProducts data={data.topProducts} />}
          </Card>
        </div>

        {/* ── Heatmap ── */}
        <div className="fade" style={{ marginBottom: '16px' }}>
          <Card title="خريطة الحرارة — أوقات الذروة" icon="◈">
            <p style={{ color: MUTED, fontSize: '12px', fontFamily: 'Tajawal', marginBottom: '20px', letterSpacing: '0.5px' }}>
              كثافة الطلبات حسب ساعة اليوم ويوم الأسبوع
            </p>
            {loading ? <Skel h={200} /> : <Heatmap data={data.heatmap} />}
          </Card>
        </div>

        {/* ── Recent Orders ── */}
        <div className="fade" style={{ marginBottom: '16px' }}>
          <Card title="آخر الطلبات" icon="◎">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skel key={i} h={52} mb={4} />)
            ) : !data.recentOrders?.length ? (
              <div className="empty"><div className="empty-ico">◎</div><div className="empty-txt">لا توجد طلبات</div></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="an-tbl">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>العميل</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map(o => {
                      const m = STATUS[o.status] || { ar: o.status, color: MUTED };
                      return (
                        <tr key={o._id}>
                          <td>
                            <span style={{ color: GOLD, fontWeight: '700', letterSpacing: '0.5px' }}>
                              {o.orderNumber || `#${String(o._id).slice(-6).toUpperCase()}`}
                            </span>
                          </td>
                          <td>{o.customerName || '—'}</td>
                          <td>
                            <span style={{ fontWeight: '700', color: CREAM }}>
                              {cur(o.total)}
                            </span>
                          </td>
                          <td>
                            <span className="pill" style={{
                              color: m.color,
                              background: `${m.color}14`,
                              border: `1px solid ${m.color}28`
                            }}>
                              {m.ar}
                            </span>
                          </td>
                          <td style={{ color: MUTED, fontSize: '12px' }}>
                            {new Date(o.createdAt).toLocaleDateString('ar-EG', {
                              day: '2-digit', month: 'short', year: '2-digit',
                            })}
                            {' — '}
                            {new Date(o.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', paddingTop: '32px',
          borderTop: `1px solid ${GOLD3}`,
          color: DIM, fontSize: '11px', fontFamily: 'Tajawal',
          letterSpacing: '3px'
        }}>
          DAYEM ∞ — TRADE WITHOUT RESTRICTIONS
        </div>

      </div>
    </div>
  );
}
