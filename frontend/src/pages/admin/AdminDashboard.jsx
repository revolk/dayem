// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`
const adminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dayem_admin_token')}`
})
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}/admin${path}`, { headers: adminHeaders(), ...opts }).then(r => r.json())

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

/* ═══════════════════════════════════════════════
   DESIGN SYSTEM — DAYEM ADMIN INTELLIGENCE
═══════════════════════════════════════════════ */
const T = {
  bg:      '#0D1B2E',
  surface: '#112240',
  card:    '#152848',
  cardHov: '#1a3058',
  border:  'rgba(212,175,55,0.12)',
  borderHi:'rgba(212,175,55,0.35)',
  gold:    '#D4AF37',
  goldDim: '#B8962E',
  goldSoft:'rgba(212,175,55,0.08)',
  cream:   '#EAE0C8',
  muted:   '#5A7A9A',
  dim:     '#243040',
  green:   '#00D68F',
  red:     '#FF4D6D',
  blue:    '#4D9FFF',
  purple:  '#A78BFA',
  cyan:    '#22D3EE',
  amber:   '#FBBF24',
  indigo:  '#6366F1',
}

const PLAN = {
  starter:{ label:'ستارتر', color:T.muted,  bg:'rgba(90,122,154,.12)',  icon:'◇' },
  tajer:  { label:'تاجر',   color:T.blue,   bg:'rgba(77,159,255,.12)',  icon:'◈' },
  pro:    { label:'برو',    color:T.gold,   bg:'rgba(212,175,55,.12)', icon:'◆' },
}

const STATUS = {
  new:       { label:'جديد',   color:T.amber  },
  confirmed: { label:'مؤكد',   color:T.blue   },
  processing:{ label:'جاري',   color:T.purple },
  shipped:   { label:'شحن',    color:T.cyan   },
  delivered: { label:'تسليم',  color:T.green  },
  cancelled: { label:'ملغي',   color:T.red    },
}

const num = n => Number(Math.round(n||0)).toLocaleString('en-US')
const cur = n => `${num(n)} ج`
const timeAgo = d => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000)
  if (m < 1) return 'الآن'
  if (m < 60) return `${m}د`
  if (h < 24) return `${h}س`
  return `${dy}ي`
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${T.bg}}

/* Ambient glow */
.adm-root::before{content:'';position:fixed;top:-30%;right:-10%;width:60vw;height:60vh;background:radial-gradient(ellipse,rgba(212,175,55,.04) 0%,transparent 65%);pointer-events:none;z-index:0}
.adm-root::after{content:'';position:fixed;bottom:-20%;left:-5%;width:40vw;height:40vh;background:radial-gradient(ellipse,rgba(99,102,241,.03) 0%,transparent 65%);pointer-events:none;z-index:0}

.adm-root{min-height:100vh;background:${T.bg};font-family:'Tajawal',sans-serif;direction:rtl;color:${T.cream};position:relative;overflow-x:hidden}

/* ── Sidebar ── */
.adm-sidebar{position:fixed;top:0;right:0;bottom:0;width:232px;background:${T.surface};border-left:1px solid ${T.border};z-index:50;display:flex;flex-direction:column}
.adm-sidebar-top{height:2px;background:linear-gradient(90deg,transparent,${T.gold},transparent);flex-shrink:0}
.adm-logo-wrap{padding:18px 20px 16px;border-bottom:1px solid rgba(255,255,255,.04);flex-shrink:0}
.adm-logo{display:flex;align-items:center;gap:10px}
.adm-logo-mark{width:34px;height:34px;border:1.5px solid ${T.gold};display:flex;align-items:center;justify-content:center;font-size:1rem;color:${T.gold};position:relative;flex-shrink:0}
.adm-logo-mark::after{content:'';position:absolute;inset:-3px;border:1px solid rgba(212,175,55,.12)}
.adm-logo-name{font-size:.88rem;font-weight:900;color:#fff;letter-spacing:2px;line-height:1.2}
.adm-logo-sub{font-size:.36rem;letter-spacing:2.5px;color:rgba(212,175,55,.45);text-transform:uppercase}

.adm-nav{flex:1;padding:14px 0;overflow-y:auto}
.adm-nav-item{display:flex;align-items:center;gap:12px;padding:13px 20px;cursor:pointer;transition:all .2s;border-right:2px solid transparent;position:relative}
.adm-nav-item:hover{background:rgba(255,255,255,.025)}
.adm-nav-item.active{background:rgba(212,175,55,.06);border-right-color:${T.gold}}
.adm-nav-item.active .adm-nav-icon{color:${T.gold}}
.adm-nav-item.active .adm-nav-label{color:#fff;font-weight:700}
.adm-nav-icon{font-size:.95rem;color:${T.dim};flex-shrink:0;transition:color .2s}
.adm-nav-label{font-size:.85rem;color:rgba(255,255,255,.35);transition:color .2s}
.adm-nav-badge{margin-right:auto;background:${T.red};color:#fff;font-size:.55rem;padding:2px 6px;border-radius:10px;font-weight:700}

.adm-sidebar-bottom{border-top:1px solid rgba(255,255,255,.04);padding:14px 20px;flex-shrink:0}
.adm-user{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.adm-avatar{width:32px;height:32px;background:linear-gradient(135deg,${T.gold},${T.goldDim});display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;color:#04080F;flex-shrink:0}
.adm-user-name{font-size:.75rem;font-weight:700;color:#fff}
.adm-user-email{font-size:.58rem;color:${T.muted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adm-logout{width:100%;padding:8px;background:transparent;border:1px solid rgba(239,68,68,.2);color:rgba(239,68,68,.5);font-family:'Tajawal',sans-serif;font-size:.72rem;cursor:pointer;transition:all .2s}
.adm-logout:hover{border-color:rgba(239,68,68,.5);color:#FCA5A5}

/* ── Main ── */
.adm-main{margin-right:232px;position:relative;z-index:1;min-height:100vh}
.adm-content{padding:36px 40px 60px;max-width:1280px}
@media(max-width:1024px){.adm-sidebar{display:none}.adm-main{margin-right:0}.adm-content{padding:20px 16px 40px}}

/* ── Page Header ── */
.adm-page-hd{margin-bottom:28px}
.adm-eyebrow{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.gold};opacity:.7;margin-bottom:8px;text-transform:uppercase}
.adm-page-title{font-family:'Playfair Display',serif;font-size:clamp(22px,2.5vw,32px);font-weight:700;color:#fff;letter-spacing:-0.5px;line-height:1.1}
.adm-page-title em{font-style:italic;color:${T.gold}}

/* ── KPI Grid ── */
.adm-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${T.border};border:1px solid ${T.border};margin-bottom:24px}
@media(max-width:900px){.adm-kpi-grid{grid-template-columns:repeat(2,1fr)}}
.adm-kpi{background:${T.card};padding:20px 16px;position:relative;overflow:hidden;transition:background .3s;cursor:default}
.adm-kpi:hover{background:${T.cardHov}}
.adm-kpi-accent{position:absolute;top:0;left:0;right:0;height:2px}
.adm-kpi-glow{position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;filter:blur(20px);pointer-events:none}
.adm-kpi-lbl{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;color:${T.muted};text-transform:uppercase;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adm-kpi-val{font-family:'Playfair Display',serif;font-size:clamp(22px,2vw,32px);font-weight:700;color:#fff;line-height:1;margin-bottom:10px}
.adm-kpi-foot{display:flex;align-items:center;justify-content:space-between}
.adm-kpi-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:${T.dim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adm-badge-up{background:rgba(0,214,143,.1);color:${T.green};border:1px solid rgba(0,214,143,.2);font-size:9px;padding:3px 8px;font-family:'JetBrains Mono',monospace}
.adm-badge-dn{background:rgba(255,77,109,.1);color:${T.red};border:1px solid rgba(255,77,109,.2);font-size:9px;padding:3px 8px;font-family:'JetBrains Mono',monospace}

/* ── Card ── */
.adm-card{background:${T.card};border:1px solid ${T.border};position:relative;transition:border-color .3s}
.adm-card:hover{border-color:rgba(212,175,55,.22)}
.adm-card-hd{padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;justify-content:space-between}
.adm-card-title{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.muted};text-transform:uppercase}
.adm-card-ico{width:28px;height:28px;border:1px solid ${T.border};display:flex;align-items:center;justify-content:center;color:${T.gold};font-size:13px}
.adm-card-body{padding:20px 24px}

/* ── Grid layouts ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.g3{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px}
@media(max-width:768px){.g2,.g3{grid-template-columns:1fr !important;gap:12px}}

/* ── Table ── */
.adm-tbl{width:100%;border-collapse:collapse}
.adm-tbl th{font-family:'Tajawal',sans-serif;font-size:.68rem;font-weight:700;color:rgba(212,175,55,.6);padding:12px 16px;text-align:right;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(212,175,55,.03)}
.adm-tbl td{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.025);font-size:13px;color:${T.cream};vertical-align:middle}
.adm-tbl tr:last-child td{border-bottom:none}
.adm-tbl tbody tr{transition:background .2s;cursor:pointer}
.adm-tbl tbody tr:hover{background:${T.goldSoft}}

/* ── Merchant Avatar ── */
.adm-mer-avatar{width:36px;height:36px;border-radius:0;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:900;flex-shrink:0;position:relative}

/* ── Status pill ── */
.adm-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;text-transform:uppercase}
.adm-pill::before{content:'';width:4px;height:4px;border-radius:50%;background:currentColor}

/* ── Plan badge ── */
.adm-plan{display:inline-block;padding:3px 10px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500}

/* ── Search ── */
.adm-search{width:100%;padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);font-family:'Tajawal',sans-serif;font-size:.82rem;color:#fff;outline:none;transition:border-color .2s}
.adm-search:focus{border-color:${T.gold};background:rgba(212,175,55,.04)}

/* ── Filter btn ── */
.adm-filter{padding:9px 16px;background:transparent;border:1px solid rgba(255,255,255,.08);color:${T.muted};font-family:'Tajawal',sans-serif;font-size:.78rem;cursor:pointer;transition:all .2s}
.adm-filter:hover{border-color:${T.border};color:${T.cream}}
.adm-filter.on{background:${T.gold};border-color:${T.gold};color:#04080F;font-weight:700}

/* ── Action btn ── */
.adm-act{padding:5px 12px;background:transparent;font-family:'Tajawal',sans-serif;font-size:.68rem;cursor:pointer;transition:all .2s;border:1px solid}

/* ── Modal ── */
.adm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.adm-modal{position:relative;width:100%;max-width:580px;background:${T.card};border:1px solid ${T.borderHi};max-height:90vh;overflow-y:auto}
.adm-modal-top{height:2px;background:linear-gradient(90deg,transparent,${T.gold},transparent)}

/* ── Activity Feed ── */
.adm-feed-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.adm-feed-item:last-child{border-bottom:none}
.adm-feed-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.adm-feed-pulse{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ── Stat line ── */
.adm-stat-line{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.adm-stat-line:last-child{border-bottom:none}

/* ── Skeleton ── */
.adm-skel{height:40px;background:linear-gradient(90deg,rgba(255,255,255,.02) 0%,rgba(212,175,55,.06) 50%,rgba(255,255,255,.02) 100%);background-size:200% 100%;animation:sk 1.8s ease infinite;margin-bottom:4px}
@keyframes sk{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* ── Animations ── */
html{scroll-behavior:smooth}
.fade{animation:fi .5s ease both}
@keyframes fi{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.fade:nth-child(1){animation-delay:.04s}
.fade:nth-child(2){animation-delay:.08s}
.fade:nth-child(3){animation-delay:.13s}
.fade:nth-child(4){animation-delay:.18s}
.fade:nth-child(5){animation-delay:.23s}

/* Card hover — border glow only, NO transform (keeps chart clickable) */
.adm-card{transition:border-color .25s,box-shadow .25s}
.adm-card:hover{border-color:rgba(212,175,55,.3);box-shadow:0 6px 28px rgba(0,0,0,.2),0 0 0 1px rgba(212,175,55,.06)}

/* KPI hover — background shift only */
.adm-kpi{transition:background .25s,box-shadow .25s}
.adm-kpi:hover{background:${T.cardHov};box-shadow:0 6px 20px rgba(0,0,0,.18)}

/* Table row */
.adm-tbl tbody tr{transition:background .15s;cursor:pointer}
.adm-tbl tbody tr:hover{background:${T.goldSoft}}

/* Scroll-to-top */
.scroll-top{position:fixed;bottom:28px;left:28px;width:40px;height:40px;background:linear-gradient(135deg,${T.gold},${T.goldDim});border:none;color:#0C2540;font-size:1rem;font-weight:900;cursor:pointer;z-index:150;transition:opacity .3s,transform .3s,box-shadow .3s;box-shadow:0 4px 20px rgba(212,175,55,.3);display:flex;align-items:center;justify-content:center}
.scroll-top:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(212,175,55,.5)}
.scroll-top.hidden{opacity:0;pointer-events:none;transform:translateY(10px)}

/* ── Pagination ── */
.adm-pg{display:flex;gap:6px;justify-content:center;margin-top:20px}
.adm-pg-btn{width:34px;height:34px;background:transparent;border:1px solid rgba(255,255,255,.1);color:${T.muted};font-family:'JetBrains Mono',monospace;font-size:.78rem;cursor:pointer;transition:all .2s}
.adm-pg-btn:hover{border-color:${T.border};color:${T.cream};transform:translateY(-1px)}
.adm-pg-btn.on{background:${T.gold};border-color:${T.gold};color:#04080F;font-weight:700}

/* ── Toast ── */
.adm-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);padding:12px 28px;font-family:'Tajawal',sans-serif;font-size:.85rem;font-weight:700;z-index:999;animation:fi .3s ease;white-space:nowrap}

/* ── Mini bar chart ── */
.adm-bar-chart{display:flex;align-items:flex-end;gap:4px;height:80px}
.adm-bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.adm-bar-fill{width:100%;border-radius:1px 1px 0 0;min-height:4px;transition:height .8s cubic-bezier(.4,0,.2,1)}
.adm-bar-lbl{font-family:'JetBrains Mono',monospace;font-size:8px;color:${T.dim};text-align:center}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2);border-radius:2px}
`

/* ═══════════════════════════════════════════════
   MINI LINE CHART (SVG)
═══════════════════════════════════════════════ */
function MiniLineChart({ data, color, height = 60 }) {
  if (!data?.length) return null
  const W = 300, H = height
  const max = Math.max(...data.map(d => d.revenue || d.count || 0), 1)
  const vals = data.map(d => d.revenue || d.count || 0)
  const xs = i => (i / Math.max(vals.length - 1, 1)) * W
  const ys = v => H - (v / max) * H * 0.9 + H * 0.05
  const path = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ')
  const area = `${path} L${xs(vals.length-1)},${H} L0,${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d={area} fill={`url(#lg-${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter="url(#glow2)" />
      {vals.map((v, i) => (
        <circle key={i} cx={xs(i)} cy={ys(v)} r="2.5" fill={color} stroke={T.bg} strokeWidth="1.5" />
      ))}
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════ */
function DonutChart({ starter, tajer, pro, total }) {
  const [hov, setHov] = useState(null)
  if (!total) return <div style={{ color: T.dim, textAlign: 'center', padding: 20, fontSize: '.8rem', fontFamily: 'Tajawal' }}>لا توجد بيانات</div>

  const cx = 100, cy = 100, R = 82, ri = 55
  let ang = -Math.PI / 2
  const slices = [
    { label: 'ستارتر', value: starter, color: '#6B7280' },
    { label: 'تاجر',   value: tajer,   color: T.blue    },
    { label: 'برو',    value: pro,     color: T.gold    },
  ].filter(s => s.value > 0).map(s => {
    const sw = (s.value / total) * Math.PI * 2
    const mid = ang + sw / 2
    const arc = r => ({ x1: cx + r * Math.cos(ang), y1: cy + r * Math.sin(ang), x2: cx + r * Math.cos(ang + sw), y2: cy + r * Math.sin(ang + sw) })
    const o = arc(R), i2 = arc(ri)
    const lg = sw > Math.PI ? 1 : 0
    const path = `M${i2.x1.toFixed(2)},${i2.y1.toFixed(2)} A${ri},${ri} 0 ${lg},1 ${i2.x2.toFixed(2)},${i2.y2.toFixed(2)} L${o.x2.toFixed(2)},${o.y2.toFixed(2)} A${R},${R} 0 ${lg},0 ${o.x1.toFixed(2)},${o.y1.toFixed(2)} Z`
    ang += sw
    return { ...s, path, mid }
  })

  const active = hov !== null ? slices[hov] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Donut SVG */}
      <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 180 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hov === null || hov === i ? 1 : 0.25}
            transform={hov === i ? `translate(${(Math.cos(s.mid)*4).toFixed(2)},${(Math.sin(s.mid)*4).toFixed(2)})` : ''}
            style={{ cursor: 'pointer', transition: 'all .3s', filter: hov === i ? `drop-shadow(0 0 8px ${s.color}80)` : 'none' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            onTouchStart={() => setHov(hov === i ? null : i)} />
        ))}
        <circle cx={cx} cy={cy} r={ri - 4} fill={T.card} />
        <circle cx={cx} cy={cy} r={ri - 2} fill="none" stroke={`${T.gold}15`} strokeWidth="1" />
        <text x={cx} y={cy - 10} textAnchor="middle"
          fill={active ? active.color : T.gold}
          fontSize="24" fontFamily="'Playfair Display',serif" fontWeight="700">
          {active ? active.value : total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
          fill={active ? active.color : 'rgba(255,255,255,.35)'}
          fontSize="11" fontFamily="Tajawal" fontWeight="700">
          {active ? `${((active.value/total)*100).toFixed(0)}%` : 'تاجر'}
        </text>
      </svg>

      {/* Legend — below */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
        {slices.map((s, i) => (
          <div key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '6px 12px', background: hov === i ? `${s.color}12` : 'rgba(255,255,255,.025)', border: `1px solid ${hov === i ? s.color + '40' : 'rgba(255,255,255,.05)'}`, transition: 'all .2s' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            onTouchStart={() => setHov(hov === i ? null : i)}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
            <span style={{ color: '#fff', fontSize: 12, fontFamily: 'Tajawal', fontWeight: 600 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 11, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{s.value}</span>
            <span style={{ color: 'rgba(255,255,255,.25)', fontSize: 10 }}>({((s.value/total)*100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 1024
  const admin = JSON.parse(localStorage.getItem('dayem_admin') || '{}')
  const [time, setTime] = useState(new Date())

  const [tab, setTab]       = useState('overview')
  const [stats, setStats]   = useState(null)
  const [merchants, setMerchants] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [page, setPage]     = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected]   = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast]   = useState(null)
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const logout = () => {
    localStorage.removeItem('dayem_admin_token')
    localStorage.removeItem('dayem_admin')
    nav('/admin/login')
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadStats = useCallback(async () => {
    setLoading(true)
    const [statsRes, merchantsRes, ordersRes] = await Promise.all([
      apiFetch('/stats'),
      apiFetch('/merchants?limit=5&page=1'),
      apiFetch('/orders?limit=5&page=1'),
    ])
    if (statsRes.success)    setStats(statsRes.stats)
    if (merchantsRes.success) setMerchants(merchantsRes.merchants)
    if (ordersRes.success)    setOrders(ordersRes.orders)
    setLoading(false)
  }, [])

  const loadMerchants = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 15, search, plan: planFilter })
    const res = await apiFetch(`/merchants?${params}`)
    if (res.success) { setMerchants(res.merchants); setTotalPages(res.pages) }
    setLoading(false)
  }, [page, search, planFilter])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const res = await apiFetch(`/orders?page=${page}&limit=20`)
    if (res.success) { setOrders(res.orders); setTotalPages(res.pages) }
    setLoading(false)
  }, [page])

  useEffect(() => {
    const token = localStorage.getItem('dayem_admin_token')
    if (!token) { nav('/admin/login'); return }
    if (tab === 'overview')  loadStats()
    if (tab === 'merchants') loadMerchants()
    if (tab === 'orders')    loadOrders()
  }, [tab, loadStats, loadMerchants, loadOrders])

  const updateMerchant = async (id, data) => {
    setActionLoading(true)
    const res = await apiFetch(`/merchants/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res.success) {
      // Update merchants list
      setMerchants(prev => prev.map(m => {
        if (m._id !== id) return m
        const newStore = { ...m.store }
        if (data['store.plan']) newStore.plan = data['store.plan']
        return { ...m, store: newStore, isActive: data.isActive !== undefined ? data.isActive : m.isActive }
      }))
      // Update selected modal with fresh data from server
      if (selected?.merchant?._id === id) {
        setSelected(prev => ({
          ...prev,
          merchant: res.merchant
        }))
      }
      showToast('تم التحديث ✓')
    } else {
      showToast('حدث خطأ', 'error')
    }
    setActionLoading(false)
  }

  const deleteMerchant = async (id) => {
    if (!confirm('حذف التاجر نهائياً؟')) return
    await apiFetch(`/merchants/${id}`, { method: 'DELETE' })
    setMerchants(prev => prev.filter(m => m._id !== id))
    setSelected(null)
    showToast('تم الحذف', 'error')
  }

  const viewMerchant = async (id) => {
    const res = await apiFetch(`/merchants/${id}`)
    if (res.success) setSelected(res)
  }

  // Avatar color based on name
  const avatarColor = (name) => {
    const colors = [T.gold, T.blue, T.purple, T.cyan, T.green, T.amber]
    const i = (name?.charCodeAt(0) || 0) % colors.length
    return colors[i]
  }

  const TABS = [
    { id: 'overview',  label: 'نظرة عامة', icon: '◈' },
    { id: 'merchants', label: 'التجار',     icon: '◆' },
    { id: 'orders',    label: 'الطلبات',    icon: '◉' },
  ]

  const Skel = ({ h = 50 }) => <div className="adm-skel" style={{ height: h }} />

  return (
    <div className="adm-root">
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      {!isMobile && (
        <aside className="adm-sidebar">
          <div className="adm-sidebar-top" />

          <div className="adm-logo-wrap">
            <div className="adm-logo">
              <div className="adm-logo-mark">∞</div>
              <div>
                <div className="adm-logo-name">دايم</div>
              </div>
            </div>
            <div style={{ fontSize: '.42rem', letterSpacing: 3, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', fontWeight: 800, paddingRight: 46, marginTop: 3, marginBottom: 10 }}>Admin Intelligence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: .5 }}>
              <span style={{ color: 'rgba(212,175,55,.6)' }}>◉</span>
              {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              <span style={{ color: 'rgba(255,255,255,.15)' }}>·</span>
              <span style={{ color: 'rgba(212,175,55,.5)' }}>{time.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}</span>
            </div>
          </div>

          <nav className="adm-nav">
            {TABS.map(t => (
              <div key={t.id} className={`adm-nav-item${tab === t.id ? ' active' : ''}`}
                onClick={() => { setTab(t.id); setPage(1) }}>
                <span className="adm-nav-icon">{t.icon}</span>
                <span className="adm-nav-label">{t.label}</span>
              </div>
            ))}
          </nav>

          <div className="adm-sidebar-bottom">
            <div className="adm-user">
              <div className="adm-avatar">{admin.name?.charAt(0) || 'A'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="adm-user-name">{admin.name}</div>
                <div className="adm-user-email">{admin.email}</div>
              </div>
            </div>
            <button className="adm-logout" onClick={logout}>خروج</button>
          </div>
        </aside>
      )}

      {/* ── Mobile Header ── */}
      {isMobile && (
        <div style={{ position: 'sticky', top: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, zIndex: 50 }}>
          <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, border: `1.5px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, fontSize: '.85rem' }}>∞</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '.72rem', color: '#fff', letterSpacing: 1, lineHeight: 1 }}>دايم</div>
                <div style={{ fontSize: '.38rem', letterSpacing: 2, color: `${T.gold}80`, textTransform: 'uppercase' }}>ADMIN</div>
              </div>
            </div>
            {/* Tabs with labels */}
            <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setPage(1) }}
                  style={{ padding: '6px 10px', background: tab === t.id ? T.gold : 'transparent', border: `1px solid ${tab === t.id ? T.gold : 'rgba(255,255,255,.1)'}`, color: tab === t.id ? '#04080F' : T.muted, fontFamily: 'Tajawal', fontSize: '.7rem', cursor: 'pointer', fontWeight: tab === t.id ? 900 : 400, transition: 'all .2s', whiteSpace: 'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={logout} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid rgba(239,68,68,.2)', color: 'rgba(239,68,68,.5)', fontSize: '.68rem', cursor: 'pointer', fontFamily: 'Tajawal', flexShrink: 0 }}>
              خروج
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
         MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="adm-main">
        <div className="adm-content">

          {/* ── Page Header ── */}
          <div className="adm-page-hd fade">
            <div className="adm-eyebrow">
              DAYEM ∞ — {TABS.find(t => t.id === tab)?.label?.toUpperCase()}
            </div>
            <h1 className="adm-page-title">
              {tab === 'overview'  && <>نظرة عامة على <em>المنصة</em></>}
              {tab === 'merchants' && <>إدارة <em>التجار</em></>}
              {tab === 'orders'    && <>كل <em>الطلبات</em></>}
            </h1>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: T.muted, marginTop: 8, letterSpacing: 1 }}>
              {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* ════════════ OVERVIEW ════════════ */}
          {tab === 'overview' && (
            <>
              {/* KPI Strip */}
              <div className="adm-kpi-grid fade">
                {loading ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="adm-kpi"><Skel h={10} /><div style={{marginBottom:8}}/><Skel h={36} /><div style={{marginBottom:8}}/><Skel h={10} /></div>
                )) : [
                  { lbl: 'إجمالي التجار',   val: num(stats?.merchants?.total),  sub: `+${stats?.merchants?.newToday} جديد اليوم`, color: T.gold,   glow: 'rgba(212,175,55,.15)'  },
                  { lbl: 'التجار النشطين',  val: num(stats?.merchants?.active), sub: `من ${stats?.merchants?.total}`,               color: T.green,  glow: 'rgba(0,214,143,.1)'    },
                  { lbl: 'إجمالي الطلبات',  val: num(stats?.orders?.total),     sub: `${stats?.orders?.today} طلب اليوم`,           color: T.blue,   glow: 'rgba(77,159,255,.1)'   },
                  { lbl: 'الإيرادات',       val: cur(stats?.revenue),           sub: 'إجمالي المنصة',                               color: T.purple, glow: 'rgba(167,139,250,.1)'  },
                ].map((k, i) => (
                  <div key={i} className="adm-kpi">
                    <div className="adm-kpi-accent" style={{ background: `linear-gradient(90deg,transparent,${k.color},transparent)` }} />
                    <div className="adm-kpi-glow" style={{ background: k.glow }} />
                    <div className="adm-kpi-lbl" style={{ fontFamily: 'Tajawal', letterSpacing: 1 }}>{k.lbl}</div>
                    <div className="adm-kpi-val" style={{ color: k.color === T.gold ? T.gold : '#fff' }}>{k.val}</div>
                    <div className="adm-kpi-foot">
                      <span className="adm-kpi-sub" style={{ fontFamily: 'Tajawal' }}>{k.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row: Bar Chart + Donut */}
              <div className="g3 fade">
                {/* Bar Chart — ٧ أيام كاملة */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <span className="adm-card-title" style={{ fontFamily: 'Tajawal', letterSpacing: 1 }}>تجار جدد — آخر ٧ أيام</span>
                    <div className="adm-card-ico">📈</div>
                  </div>
                  <div className="adm-card-body">
                    {loading ? <Skel h={100} /> : (() => {
                      const chartData = stats?.charts?.merchants || []
                      const days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date()
                        d.setHours(12, 0, 0, 0)
                        d.setDate(d.getDate() - (6 - i))
                        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
                        const found = chartData.find(x => x._id === key)
                        return { count: found?.count || 0, label: `${d.getDate()}/${d.getMonth()+1}` }
                      })
                      const max = Math.max(...days.map(d => d.count), 1)
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
                          {days.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              {d.count > 0 && <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 11, color: T.gold, fontWeight: 700 }}>{d.count}</span>}
                              <div style={{
                                width: '100%',
                                height: `${Math.max((d.count / max) * 65, d.count > 0 ? 6 : 3)}px`,
                                background: d.count > 0 ? `linear-gradient(to top,rgba(212,175,55,.45),${T.gold})` : 'rgba(255,255,255,.04)',
                                boxShadow: d.count > 0 ? `0 0 10px ${T.gold}35` : 'none',
                                transition: 'height .8s cubic-bezier(.4,0,.2,1)',
                                borderRadius: '2px 2px 0 0'
                              }} />
                              <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{d.label}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Plans Donut */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <span className="adm-card-title" style={{ fontFamily: 'Tajawal', letterSpacing: 1 }}>توزيع الخطط</span>
                    <div className="adm-card-ico">◎</div>
                  </div>
                  <div className="adm-card-body">
                    {loading ? <Skel h={200} /> : (
                      <DonutChart
                        starter={stats?.plans?.starter || 0}
                        tajer={stats?.plans?.tajer || 0}
                        pro={stats?.plans?.pro || 0}
                        total={stats?.merchants?.total || 0}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Row: Top Merchants + Recent Orders */}
              <div className="g2 fade">
                {/* Top Merchants by Revenue */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <span className="adm-card-title">أفضل التجار</span>
                    <div className="adm-card-ico">◆</div>
                  </div>
                  <div className="adm-card-body" style={{ padding: '0 24px' }}>
                    {loading ? Array(5).fill(0).map((_, i) => <div key={i} style={{ padding: '12px 0' }}><Skel h={36} /></div>) : (
                      merchants.length === 0 ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: '.8rem' }}>لا توجد بيانات</div>
                      ) : (
                        merchants.slice(0, 5).map((m, i) => {
                          const ac = avatarColor(m.name)
                          return (
                            <div key={m._id} className="adm-stat-line" onClick={() => viewMerchant(m._id)}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: ac, boxShadow: `0 0 6px ${ac}` }} />
                                <div>
                                  <div style={{ fontSize: 13, color: T.cream, fontWeight: 600 }}>{m.store?.name || m.name}</div>
                                  <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{m.orders} طلب</div>
                                </div>
                              </div>
                              <div style={{ color: T.gold, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 500 }}>
                                {cur(m.revenue)}
                              </div>
                            </div>
                          )
                        })
                      )
                    )}
                  </div>
                </div>

                {/* Orders Feed */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <span className="adm-card-title">آخر الطلبات</span>
                    <div className="adm-card-ico">◉</div>
                  </div>
                  <div className="adm-card-body" style={{ padding: '0 24px' }}>
                    {loading ? Array(5).fill(0).map((_, i) => <div key={i} style={{ padding: '12px 0' }}><Skel h={36} /></div>) : (
                      orders.slice(0, 5).map((o, i) => {
                        const sm = STATUS[o.orderStatus] || { label: o.orderStatus, color: T.muted }
                        return (
                          <div key={o._id} className="adm-feed-item">
                            <div className="adm-feed-dot adm-feed-pulse" style={{ background: sm.color }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ color: T.gold, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{o.orderNumber}</span>
                                <span style={{ color: T.gold, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{cur(o.finalPrice)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: T.muted, fontSize: 11 }}>{o.customer?.name}</span>
                                <span style={{ color: sm.color, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{sm.label}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════ MERCHANTS ════════════ */}
          {tab === 'merchants' && (
            <div className="fade">
              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="adm-search" style={{ flex: 1, minWidth: 200 }}
                  value={search} placeholder="ابحث بالاسم أو الإيميل أو المتجر..."
                  onChange={e => { setSearch(e.target.value); setPage(1) }} />
                {['', 'starter', 'tajer', 'pro'].map(p => (
                  <button key={p} className={`adm-filter${planFilter === p ? ' on' : ''}`}
                    onClick={() => { setPlanFilter(p); setPage(1) }}>
                    {p === '' ? 'الكل' : PLAN[p]?.label}
                  </button>
                ))}
              </div>

              <div className="adm-card">
                {loading ? (
                  <div style={{ padding: 24 }}>{Array(6).fill(0).map((_, i) => <Skel key={i} h={56} />)}</div>
                ) : merchants.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: T.dim }}>لا توجد نتائج</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="adm-tbl" style={{ minWidth: 750 }}>
                      <thead>
                        <tr>
                          {['التاجر', 'المتجر', 'الخطة', 'الطلبات', 'الإيرادات', 'الانضمام', 'الحالة', ''].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {merchants.map(m => {
                          const pm = PLAN[m.store?.plan || 'starter']
                          const ac = avatarColor(m.name)
                          return (
                            <tr key={m._id} onClick={() => viewMerchant(m._id)}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="adm-mer-avatar" style={{ background: `${ac}18`, border: `1px solid ${ac}40`, color: ac }}>
                                    {m.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{m.name}</div>
                                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{m.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ color: T.gold, fontWeight: 600, fontSize: 13 }}>{m.store?.name || '—'}</div>
                                <div style={{ fontSize: 10, color: T.dim, fontFamily: "'JetBrains Mono',monospace" }}>/{m.store?.slug}</div>
                              </td>
                              <td>
                                <span className="adm-plan" style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.color}25` }}>
                                  {pm.icon} {pm.label}
                                </span>
                              </td>
                              <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{num(m.orders)}</td>
                              <td style={{ color: T.gold, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600 }}>{cur(m.revenue)}</td>
                              <td style={{ color: T.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                                {new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.isActive ? T.green : T.red, boxShadow: `0 0 6px ${m.isActive ? T.green : T.red}` }} />
                                  <span style={{ fontSize: 10, color: m.isActive ? T.green : T.red, fontFamily: "'JetBrains Mono',monospace" }}>
                                    {m.isActive ? 'نشط' : 'موقف'}
                                  </span>
                                </div>
                              </td>
                              <td onClick={e => e.stopPropagation()}>
                                <button className="adm-act"
                                  onClick={() => updateMerchant(m._id, { isActive: !m.isActive })}
                                  style={{ borderColor: m.isActive ? 'rgba(239,68,68,.25)' : 'rgba(0,214,143,.25)', color: m.isActive ? T.red : T.green }}>
                                  {m.isActive ? 'إيقاف' : 'تفعيل'}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="adm-pg">
                  {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                    <button key={p} className={`adm-pg-btn${page === p ? ' on' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════ ORDERS ════════════ */}
          {tab === 'orders' && (
            <div className="fade">
              <div className="adm-card">
                {loading ? (
                  <div style={{ padding: 24 }}>{Array(8).fill(0).map((_, i) => <Skel key={i} h={52} />)}</div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: T.dim }}>لا توجد طلبات</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="adm-tbl" style={{ minWidth: 700 }}>
                      <thead>
                        <tr>
                          {['رقم الطلب', 'المتجر', 'العميل', 'المبلغ', 'الدفع', 'الحالة', 'التاريخ'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => {
                          const sm = STATUS[o.orderStatus] || { label: o.orderStatus, color: T.muted }
                          const pmethods = { cash: '💵', vodafone_cash: '📱', instapay: '⚡', fawry: '🏪' }
                          return (
                            <tr key={o._id} style={{ cursor: 'default' }}>
                              <td style={{ color: T.gold, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{o.orderNumber}</td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{o.merchant?.store?.name || o.merchant?.name || '—'}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: 13 }}>{o.customer?.name}</div>
                                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{o.customer?.phone}</div>
                              </td>
                              <td style={{ color: T.gold, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 13 }}>{cur(o.finalPrice)}</td>
                              <td style={{ fontSize: 16 }}>{pmethods[o.paymentMethod] || '?'}</td>
                              <td>
                                <span className="adm-pill" style={{ color: sm.color, background: `${sm.color}12`, border: `1px solid ${sm.color}25` }}>
                                  {sm.label}
                                </span>
                              </td>
                              <td style={{ color: T.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                                {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="adm-pg">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i+1).map(p => (
                    <button key={p} className={`adm-pg-btn${page === p ? ' on' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ══════════════════════════════════════════
         MERCHANT DETAIL MODAL
      ══════════════════════════════════════════ */}
      {selected && (
        <div className="adm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-top" />
            <div style={{ padding: 28 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48,
                    background: `${avatarColor(selected.merchant?.name)}18`,
                    border: `1px solid ${avatarColor(selected.merchant?.name)}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 900,
                    color: avatarColor(selected.merchant?.name)
                  }}>
                    {selected.merchant?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: 3 }}>{selected.merchant?.name}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{selected.merchant?.email}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: T.muted, width: 30, height: 30, cursor: 'pointer', fontSize: '.85rem' }}>✕</button>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'PRODUCTS', value: num(selected.stats?.products), color: T.blue   },
                  { label: 'ORDERS',   value: num(selected.stats?.orders),   color: T.purple },
                  { label: 'REVENUE',  value: cur(selected.stats?.revenue),  color: T.gold   },
                ].map((s, i) => (
                  <div key={i} style={{ background: T.surface, border: '1px solid rgba(255,255,255,.05)', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: 2, color: T.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Plan change */}
              <div style={{ background: T.surface, border: '1px solid rgba(255,255,255,.05)', padding: '16px', marginBottom: 14 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: 2, color: T.muted, textTransform: 'uppercase', marginBottom: 12 }}>تغيير الخطة</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['starter', 'tajer', 'pro'].map(p => {
                    const pm = PLAN[p]
                    const isCurr = selected.merchant?.store?.plan === p
                    return (
                      <button key={p} onClick={() => updateMerchant(selected.merchant._id, { 'store.plan': p })}
                        disabled={isCurr || actionLoading}
                        style={{ flex: 1, padding: '10px', background: isCurr ? pm.bg : 'transparent', border: `1px solid ${isCurr ? pm.color : 'rgba(255,255,255,.08)'}`, color: isCurr ? pm.color : T.muted, fontFamily: 'Tajawal', fontSize: '.78rem', cursor: isCurr ? 'default' : 'pointer', fontWeight: isCurr ? 700 : 400, transition: 'all .2s' }}>
                        {pm.icon} {pm.label} {isCurr && '✓'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button onClick={() => updateMerchant(selected.merchant._id, { isActive: !selected.merchant.isActive })}
                  disabled={actionLoading}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${selected.merchant.isActive ? 'rgba(239,68,68,.3)' : 'rgba(0,214,143,.3)'}`, color: selected.merchant.isActive ? T.red : T.green, fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem' }}>
                  {selected.merchant.isActive ? '⏸ إيقاف الحساب' : '▶ تفعيل الحساب'}
                </button>
                <button onClick={() => window.open(`/store/${selected.merchant.store?.slug}`, '_blank')}
                  style={{ flex: 1, padding: '10px', background: T.goldSoft, border: `1px solid ${T.border}`, color: T.gold, fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem' }}>
                  ◈ عرض المتجر
                </button>
                <button onClick={() => deleteMerchant(selected.merchant._id)} disabled={actionLoading}
                  style={{ padding: '10px 14px', background: 'transparent', border: '1px solid rgba(239,68,68,.2)', color: 'rgba(239,68,68,.4)', fontFamily: 'Tajawal', cursor: 'pointer', fontSize: '.75rem' }}>
                  حذف
                </button>
              </div>

              {/* Recent Orders */}
              {selected.orders?.length > 0 && (
                <>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: 2, color: T.muted, textTransform: 'uppercase', marginBottom: 12 }}>RECENT ORDERS</div>
                  {selected.orders.slice(0, 5).map(o => {
                    const sm = STATUS[o.orderStatus] || { label: o.orderStatus, color: T.muted }
                    return (
                      <div key={o._id} className="adm-stat-line">
                        <div>
                          <div style={{ color: T.gold, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{o.orderNumber}</div>
                          <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{o.customer?.name}</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{cur(o.finalPrice)}</div>
                          <div style={{ color: sm.color, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{sm.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Scroll To Top ── */}
      <button className={`scroll-top${showScroll ? '' : ' hidden'}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="رجوع للأعلى">↑</button>

      {/* ── Toast ── */}
      {toast && (
        <div className="adm-toast" style={{
          background: toast.type === 'success' ? 'rgba(0,214,143,.12)' : 'rgba(255,77,109,.12)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,214,143,.3)' : 'rgba(255,77,109,.3)'}`,
          color: toast.type === 'success' ? T.green : T.red,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
