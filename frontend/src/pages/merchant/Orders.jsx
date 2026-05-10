// frontend/src/pages/merchant/Orders.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const BASE = window.location.protocol === 'https:'
  ? `${window.location.origin}/api`
  : `http://${window.location.hostname}:5000/api`

const token = () => localStorage.getItem('dayem_token')
const G = '#D4AF37'
const BG = '#060F1E'
const SURF = '#0D1B2E'
const CARD = '#0C1E35'

const STATUS = {
  new:        { label: 'جديد',       color: '#D4AF37', bg: 'rgba(212,175,55,.1)',  border: 'rgba(212,175,55,.25)', icon: '🔔' },
  confirmed:  { label: 'مؤكد',       color: '#60A5FA', bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.2)',  icon: '✓' },
  processing: { label: 'جاري التجهيز',color: '#A78BFA', bg: 'rgba(167,139,250,.08)',border: 'rgba(167,139,250,.2)', icon: '⚙' },
  shipped:    { label: 'تم الشحن',   color: '#F59E0B', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)',  icon: '🚚' },
  delivered:  { label: 'تم التسليم', color: '#22C55E', bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.2)',   icon: '✅' },
  cancelled:  { label: 'ملغي',       color: '#EF4444', bg: 'rgba(239,68,68,.08)',  border: 'rgba(239,68,68,.2)',   icon: '✕' },
}

const PAYMENT = {
  cash:         { label: 'كاش', icon: '💵' },
  vodafone_cash:{ label: 'فودافون كاش', icon: '📱' },
  instapay:     { label: 'انستاباي', icon: '🏦' },
  fawry:        { label: 'فوري', icon: '🟠' },
}

const STATUS_FLOW = ['new','confirmed','processing','shipped','delivered']

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function Orders() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 1024

  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [filterStatus, setFilter]   = useState('all')
  const [search, setSearch]         = useState('')
  const [updating, setUpdating]     = useState(null)
  const [toast, setToast]           = useState(null)
  const searchTimer = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/merchant/orders`, {
        headers: { Authorization: `Bearer ${token()}` }
      }).then(r => r.json())
      if (res.success) setOrders(res.orders)
    } catch { showToast('خطأ في تحميل الطلبات', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`${BASE}/merchant/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ orderStatus: newStatus })
      }).then(r => r.json())
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        if (selected?._id === orderId) setSelected(prev => ({ ...prev, orderStatus: newStatus }))
        showToast(`تم تحديث حالة الطلب إلى "${STATUS[newStatus]?.label}"`)
      }
    } catch { showToast('خطأ في التحديث', 'error') }
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.includes(search) ||
      o.customer?.phone?.includes(search)
    return matchStatus && matchSearch
  })

  const stats = {
    all: orders.length,
    new: orders.filter(o => o.orderStatus === 'new').length,
    confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    revenue: orders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + (o.finalPrice || 0), 0),
  }

  const inp = {
    width: '100%', padding: '9px 12px',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    fontFamily: 'Tajawal', fontSize: '.82rem', color: '#fff',
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Tajawal', direction: 'rtl' }}>
      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes ts{from{opacity:0;transform:translateY(12px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
        .fade{animation:fi .3s ease both}
        .ord-row:hover{background:rgba(255,255,255,.025)!important;cursor:pointer}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2)}
        input::placeholder{color:rgba(255,255,255,.2)!important}
        select option{background:#0C2540}
      `}</style>

      <Sidebar active="orders" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#070D1A', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(212,175,55,.3)'}`,
          padding: '12px 20px', zIndex: 9999, animation: 'ts .3s ease both',
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,.5)'
        }}>
          <span style={{ fontSize: '.9rem' }}>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{toast.msg}</span>
        </div>
      )}

      {/* Main */}
      <div style={{ marginRight: mob ? 0 : 240, paddingTop: mob ? 52 : 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: mob ? '16px 14px' : '28px 32px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '.48rem', letterSpacing: 4, color: `${G}66`, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>إدارة</div>
              <h1 style={{ fontSize: mob ? '1.3rem' : '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>الطلبات</h1>
            </div>
            <button onClick={load}
              style={{ padding: '8px 16px', background: 'rgba(212,175,55,.08)', border: `1px solid ${G}30`, color: G, fontFamily: 'Tajawal', fontSize: '.76rem', fontWeight: 700, cursor: 'pointer' }}>
              ↻ تحديث
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 8, marginBottom: 24 }}>
            {[
              { label: 'إجمالي', val: stats.all, color: 'rgba(255,255,255,.4)' },
              { label: 'جديد', val: stats.new, color: STATUS.new.color },
              { label: 'مؤكد', val: stats.confirmed, color: STATUS.confirmed.color },
              { label: 'شحن', val: stats.shipped, color: STATUS.shipped.color },
              { label: 'مسلّم', val: stats.delivered, color: STATUS.delivered.color },
              { label: 'الإيراد', val: `${stats.revenue.toLocaleString('ar-EG')} ج`, color: G },
            ].map((s, i) => (
              <div key={i} style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: mob ? '.95rem' : '1.2rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: '.54rem', color: 'rgba(255,255,255,.2)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: `${G}40`, fontSize: '.76rem', pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value) }}
                placeholder="بحث برقم الطلب أو الاسم أو الموبايل..."
                style={{ ...inp, paddingRight: 32 }}
                onFocus={e => e.target.style.borderColor = G}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
            </div>
            <select value={filterStatus} onChange={e => setFilter(e.target.value)}
              style={{ ...inp, width: 'auto', cursor: 'pointer', color: filterStatus === 'all' ? 'rgba(255,255,255,.4)' : '#fff' }}>
              <option value="all">كل الطلبات</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ height: 64, background: CARD, border: '1px solid rgba(255,255,255,.04)', opacity: 1 - i * 0.12 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: 'rgba(255,255,255,.18)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: 'Tajawal', fontSize: '.9rem' }}>مفيش طلبات</p>
            </div>
          ) : mob ? (
            // Mobile cards
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((o, i) => {
                const s = STATUS[o.orderStatus] || STATUS.new
                return (
                  <div key={o._id} className="fade" style={{ animationDelay: `${i * 0.03}s`, background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '14px', cursor: 'pointer' }}
                    onClick={() => setSelected(o)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: '.65rem', color: G, fontWeight: 700, marginBottom: 2 }}>{o.orderNumber}</div>
                        <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff' }}>{o.customer?.name}</div>
                        <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>{o.customer?.governorate}</div>
                      </div>
                      <div>
                        <div style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '.6rem', fontWeight: 700, padding: '3px 8px', textAlign: 'center', marginBottom: 4 }}>
                          {s.icon} {s.label}
                        </div>
                        <div style={{ fontSize: '.78rem', fontWeight: 900, color: G, textAlign: 'left' }}>{o.finalPrice?.toLocaleString('ar-EG')} ج</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                      {STATUS_FLOW.filter(st => st !== o.orderStatus && st !== 'cancelled').slice(0, 3).map(st => (
                        <button key={st} onClick={e => { e.stopPropagation(); updateStatus(o._id, st) }}
                          disabled={updating === o._id}
                          style={{ padding: '4px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', fontFamily: 'Tajawal', fontSize: '.58rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {STATUS[st]?.icon} {STATUS[st]?.label}
                        </button>
                      ))}
                      {o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered' && (
                        <button onClick={e => { e.stopPropagation(); updateStatus(o._id, 'cancelled') }}
                          disabled={updating === o._id}
                          style={{ padding: '4px 10px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', color: '#FCA5A5', fontFamily: 'Tajawal', fontSize: '.58rem', cursor: 'pointer', flexShrink: 0 }}>
                          ✕ إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Desktop table
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr .8fr 1.5fr', gap: 0, background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '10px 16px' }}>
                {['رقم الطلب', 'العميل', 'المبلغ', 'الدفع', 'الحالة', 'تحديث الحالة'].map(h => (
                  <div key={h} style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {/* Rows */}
              {filtered.map((o, i) => {
                const s = STATUS[o.orderStatus] || STATUS.new
                const pay = PAYMENT[o.paymentMethod] || PAYMENT.cash
                const isUpdating = updating === o._id
                return (
                  <div key={o._id} className={`fade ord-row`}
                    style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr .8fr 1.5fr', gap: 0, padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,.03)', background: 'transparent', transition: 'background .2s', animationDelay: `${i * 0.025}s` }}
                    onClick={() => setSelected(o)}>
                    {/* Order # */}
                    <div>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: G }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.2)', marginTop: 2 }}>
                        {new Date(o.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    {/* Customer */}
                    <div>
                      <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff' }}>{o.customer?.name}</div>
                      <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)' }}>{o.customer?.phone} · {o.customer?.governorate}</div>
                    </div>
                    {/* Amount */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 900, color: G }}>{o.finalPrice?.toLocaleString('ar-EG')} ج</span>
                    </div>
                    {/* Payment */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: '.75rem' }}>{pay.icon}</span>
                      <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)' }}>{pay.label}</span>
                    </div>
                    {/* Status */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '.58rem', fontWeight: 800, padding: '3px 8px' }}>
                        {s.icon} {s.label}
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      {isUpdating ? (
                        <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>جاري...</span>
                      ) : (
                        <>
                          {/* Next logical status */}
                          {STATUS_FLOW.indexOf(o.orderStatus) < STATUS_FLOW.length - 1 && (
                            <button onClick={() => updateStatus(o._id, STATUS_FLOW[STATUS_FLOW.indexOf(o.orderStatus) + 1])}
                              style={{ padding: '4px 10px', background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color, fontFamily: 'Tajawal', fontSize: '.6rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = `${s.color}22`}
                              onMouseLeave={e => e.currentTarget.style.background = `${s.color}12`}>
                              {STATUS[STATUS_FLOW[STATUS_FLOW.indexOf(o.orderStatus) + 1]]?.icon} {STATUS[STATUS_FLOW[STATUS_FLOW.indexOf(o.orderStatus) + 1]]?.label}
                            </button>
                          )}
                          {/* Cancel */}
                          {o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered' && (
                            <button onClick={() => updateStatus(o._id, 'cancelled')}
                              style={{ padding: '4px 8px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', color: '#FCA5A5', fontFamily: 'Tajawal', fontSize: '.58rem', cursor: 'pointer' }}>
                              ✕
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
          <div onClick={() => setSelected(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: mob ? '100%' : 420,
            background: '#070D1A', borderRight: '1px solid rgba(212,175,55,.12)',
            overflowY: 'auto', animation: 'fi .25s ease both'
          }}>
            {/* Drawer Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#070D1A', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '.58rem', color: G, fontWeight: 700, letterSpacing: 2, marginBottom: 3 }}>{selected.orderNumber}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 900, color: '#fff' }}>تفاصيل الطلب</div>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', width: 32, height: 32, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Status */}
              <div>
                <div style={{ fontSize: '.52rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>الحالة الحالية</div>
                {/* Current status badge */}
                <div style={{
                  background: STATUS[selected.orderStatus]?.bg,
                  border: `1px solid ${STATUS[selected.orderStatus]?.border}`,
                  color: STATUS[selected.orderStatus]?.color,
                  padding: '8px 14px', fontWeight: 700, fontSize: '.8rem',
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12
                }}>
                  {STATUS[selected.orderStatus]?.icon} {STATUS[selected.orderStatus]?.label}
                </div>
                {/* Only show next logical step + cancel */}
                {selected.orderStatus !== 'delivered' && selected.orderStatus !== 'cancelled' && (
                  <div>
                    <div style={{ fontSize: '.52rem', letterSpacing: 2, color: 'rgba(255,255,255,.15)', textTransform: 'uppercase', marginBottom: 8 }}>تحديث إلى</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* Next step */}
                      {STATUS_FLOW.indexOf(selected.orderStatus) < STATUS_FLOW.length - 1 && (() => {
                        const nextKey = STATUS_FLOW[STATUS_FLOW.indexOf(selected.orderStatus) + 1]
                        const next = STATUS[nextKey]
                        return (
                          <button onClick={() => updateStatus(selected._id, nextKey)}
                            disabled={updating === selected._id}
                            style={{ padding: '8px 16px', background: next.bg, border: `1px solid ${next.border}`, color: next.color, fontFamily: 'Tajawal', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
                            {next.icon} {next.label}
                          </button>
                        )
                      })()}
                      {/* Cancel */}
                      <button onClick={() => updateStatus(selected._id, 'cancelled')}
                        disabled={updating === selected._id}
                        style={{ padding: '8px 14px', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.18)', color: '#FCA5A5', fontFamily: 'Tajawal', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        ✕ إلغاء الطلب
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer */}
              <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.52rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>بيانات العميل</div>
                {[
                  ['الاسم', selected.customer?.name],
                  ['الموبايل', selected.customer?.phone],
                  ['المحافظة', selected.customer?.governorate],
                  ['العنوان', selected.customer?.address],
                  ['البريد', selected.customer?.email || '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                    <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>{l}</span>
                    <span style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.75)', textAlign: 'left', wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.52rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>المنتجات</div>
                {selected.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < selected.items.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    {item.image && (
                      <img src={item.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,.07)' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.nameAr}</div>
                      <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>
                        {item.quantity} × {item.price?.toLocaleString('ar-EG')} ج = <span style={{ color: G, fontWeight: 700 }}>{(item.quantity * item.price)?.toLocaleString('ar-EG')} ج</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.52rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>الفاتورة</div>
                {[
                  ['المجموع', `${selected.totalPrice?.toLocaleString('ar-EG')} ج`],
                  ['الشحن', `${selected.shippingPrice?.toLocaleString('ar-EG')} ج`],
                  selected.discount > 0 && ['خصم', `-${selected.discount?.toLocaleString('ar-EG')} ج`],
                  selected.couponCode && ['كوبون', selected.couponCode],
                ].filter(Boolean).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>{l}</span>
                    <span style={{ fontSize: '.72rem', color: l === 'خصم' ? '#86EFAC' : 'rgba(255,255,255,.6)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(212,175,55,.1)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.78rem', fontWeight: 900, color: '#fff' }}>الإجمالي</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: G }}>{selected.finalPrice?.toLocaleString('ar-EG')} ج</span>
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.05)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>طريقة الدفع</span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff' }}>
                  {PAYMENT[selected.paymentMethod]?.icon} {PAYMENT[selected.paymentMethod]?.label}
                </span>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)', padding: '12px 16px' }}>
                  <div style={{ fontSize: '.52rem', letterSpacing: 2, color: `${G}66`, textTransform: 'uppercase', marginBottom: 6 }}>ملاحظات</div>
                  <p style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>{selected.notes}</p>
                </div>
              )}

              {/* Date */}
              <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.18)', textAlign: 'center' }}>
                تاريخ الطلب: {new Date(selected.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
