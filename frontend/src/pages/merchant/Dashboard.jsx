import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantAPI } from '../../services/api'
import Sidebar from '../../components/Sidebar'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} د`
  if (hrs < 24) return `منذ ${hrs} س`
  return `منذ ${days} يوم`
}

export default function Dashboard() {
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, newOrders: 0 })
  const [orders, setOrders] = useState([])
  const [merchant, setMerchant] = useState(null)
  const [copied, setCopied] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const m = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')
    setMerchant(m)
    load()
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const load = async () => {
    const [s, o] = await Promise.all([merchantAPI.stats(), merchantAPI.getOrders()])
    if (s.success) setStats(s.stats)
    if (o.success) setOrders(o.orders.slice(0, 5))
  }

  const copyLink = () => {
    const link = `${window.location.origin}/store/${merchant?.store?.slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getGreeting = () => {
    const h = time.getHours()
    if (h >= 5 && h < 12) return 'صباح الخير'
    if (h >= 12 && h < 17) return 'مساء النور'
    if (h >= 17 && h < 21) return 'مساء الخير'
    return 'تصبح على خير'
  }

  const SL = { new: 'جديد', confirmed: 'مؤكد', processing: 'جاري', shipped: 'شحن', delivered: 'تسليم', cancelled: 'ملغي' }
  const SC = { new: '#93C5FD', confirmed: '#86EFAC', processing: '#FDE047', shipped: '#FDE047', delivered: '#86EFAC', cancelled: '#FCA5A5' }
  const SBG = { new: 'rgba(59,130,246,.1)', confirmed: 'rgba(34,197,94,.1)', processing: 'rgba(234,179,8,.1)', shipped: 'rgba(234,179,8,.1)', delivered: 'rgba(34,197,94,.1)', cancelled: 'rgba(239,68,68,.1)' }

  const marginRight = isMobile ? 0 : 240
  const padding = isMobile ? '68px 16px 24px' : '36px 40px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="dashboard" />
      <div style={{ flex: 1, marginRight, padding, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 24 : 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
              <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>{getGreeting()}</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {merchant?.name?.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.25)', fontWeight: 300 }}>
              {time.toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
              <span style={{ margin: '0 6px', opacity: .4 }}>·</span>
              <span style={{ fontFamily: 'monospace', color: 'rgba(212,175,55,.5)' }}>
                {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>

          {/* Store Link */}
          <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.12)', padding: '14px 18px', position: 'relative', width: isMobile ? '100%' : 'auto', minWidth: isMobile ? 'auto' : 260, boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 16, height: 16, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 16, height: 16, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />
            <div style={{ fontSize: '.52rem', letterSpacing: 3, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', marginBottom: 6 }}>رابط متجرك</div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#D4AF37', marginBottom: 10, direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              /store/{merchant?.store?.slug}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={copyLink} style={{ flex: 1, padding: '7px 0', background: copied ? 'rgba(34,197,94,.08)' : 'transparent', border: `1px solid ${copied ? 'rgba(34,197,94,.3)' : 'rgba(212,175,55,.2)'}`, color: copied ? '#86EFAC' : 'rgba(212,175,55,.7)', fontFamily: 'Tajawal', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✓ تم' : 'نسخ'}
              </button>
              <button onClick={() => window.open(`/store/${merchant?.store?.slug}`, '_blank')} style={{ flex: 1, padding: '7px 0', background: '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontSize: '.68rem', fontWeight: 800, cursor: 'pointer' }}>
                عرض ←
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 24 }}>
          {[
            { label: 'المنتجات', value: stats.products, sub: 'في متجرك', color: '#60A5FA', symbol: '◈' },
            { label: 'الطلبات', value: stats.orders, sub: 'إجمالي', color: '#A78BFA', symbol: '◉' },
            { label: 'الإيرادات', value: stats.revenue?.toLocaleString(), sub: 'جنيه', color: '#D4AF37', symbol: '◆', suffix: ' ج' },
            { label: 'جديد', value: stats.newOrders, sub: 'طلب جديد', color: stats.newOrders > 0 ? '#F87171' : '#6B7280', symbol: '◎' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.055)', padding: isMobile ? '16px 14px' : '22px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}55, transparent)` }} />
              <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: s.color, marginBottom: isMobile ? 8 : 14, opacity: .6 }}>{s.symbol}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? '1.6rem' : '2.1rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.value}</span>
                {s.suffix && <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>{s.suffix}</span>}
              </div>
              <div style={{ fontSize: isMobile ? '.62rem' : '.68rem', fontWeight: 700, color: s.color, letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.2)', fontWeight: 300 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 8 : 14, marginBottom: isMobile ? 16 : 28 }}>
          {[
            { label: 'إضافة منتج', sub: 'الذكاء الاصطناعي يكتب البيانات', color: '#D4AF37', bg: 'rgba(212,175,55,.05)', border: 'rgba(212,175,55,.14)', symbol: '✦', path: '/dashboard/products' },
            { label: 'الطلبات', sub: stats.newOrders > 0 ? `${stats.newOrders} طلب ينتظر` : 'لا توجد طلبات جديدة', color: '#A78BFA', bg: 'rgba(167,139,250,.05)', border: 'rgba(167,139,250,.14)', symbol: '◉', path: '/dashboard/orders' },
            { label: 'متجرك الآن', sub: 'شوف متجرك كما يراه الزبون', color: '#86EFAC', bg: 'rgba(134,239,172,.05)', border: 'rgba(134,239,172,.14)', symbol: '◈', path: null, action: () => window.open(`/store/${merchant?.store?.slug}`, '_blank') },
          ].map((a, i) => (
            <div key={i} onClick={a.action || (() => nav(a.path))}
              style={{ background: a.bg, border: `1px solid ${a.border}`, padding: isMobile ? '14px 16px' : '20px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .25s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.background = a.bg.replace('.05)', '.1)'); e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${a.color}44, transparent)` }} />
              <div style={{ fontSize: '1.3rem', color: a.color, opacity: .7, flexShrink: 0 }}>{a.symbol}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '.88rem', marginBottom: 3 }}>{a.label}</div>
                <div style={{ color: 'rgba(255,255,255,.28)', fontSize: '.7rem', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</div>
              </div>
              <div style={{ color: a.color, opacity: .5, flexShrink: 0 }}>←</div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.055)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.25), transparent)' }} />
          <div style={{ padding: isMobile ? '14px 16px' : '18px 24px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: isMobile ? '.88rem' : '.95rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>آخر الطلبات</div>
              <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.22)' }}>أحدث الطلبات الواردة</div>
            </div>
            <span onClick={() => nav('/dashboard/orders')} style={{ fontSize: '.68rem', color: 'rgba(212,175,55,.6)', cursor: 'pointer', fontWeight: 700 }}>عرض الكل ←</span>
          </div>

          {orders.length === 0 ? (
            <div style={{ padding: isMobile ? '40px 16px' : '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: 'rgba(212,175,55,.15)', marginBottom: 12 }}>◉</div>
              <div style={{ color: 'rgba(255,255,255,.25)', marginBottom: 6, fontSize: '.85rem' }}>لا توجد طلبات بعد</div>
              <button onClick={copyLink} style={{ background: 'transparent', color: 'rgba(212,175,55,.7)', border: '1px solid rgba(212,175,55,.2)', padding: '8px 20px', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.75rem', marginTop: 12 }}>
                نسخ رابط المتجر
              </button>
            </div>
          ) : isMobile ? (
            /* Mobile orders list */
            <div>
              {orders.map(o => (
                <div key={o._id} onClick={() => nav('/dashboard/orders')}
                  style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#D4AF37', marginBottom: 2 }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{o.customer.name}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#fff', fontSize: '.88rem', marginBottom: 4 }}>{o.finalPrice} ج</div>
                      <span style={{ background: SBG[o.orderStatus], color: SC[o.orderStatus], padding: '2px 8px', fontSize: '.6rem', fontWeight: 700 }}>{SL[o.orderStatus]}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'rgba(212,175,55,.45)' }}>{timeAgo(o.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop table */
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  {['رقم الطلب', 'الزبون', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'right', fontSize: '.58rem', fontWeight: 700, color: 'rgba(255,255,255,.2)', letterSpacing: 2, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => nav('/dashboard/orders')}>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#D4AF37', fontSize: '.76rem', letterSpacing: 1 }}>{o.orderNumber}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '.82rem' }}>{o.customer.name}</div>
                      <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.22)' }}>{o.customer.phone}</div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#fff', fontSize: '.88rem' }}>{o.finalPrice}</span>
                      <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.22)', marginRight: 3 }}>ج</span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: '.68rem', color: 'rgba(212,175,55,.55)' }}>{timeAgo(o.createdAt)}</div>
                      <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.2)' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: SBG[o.orderStatus], color: SC[o.orderStatus], padding: '3px 10px', fontSize: '.6rem', fontWeight: 700 }}>
                        {SL[o.orderStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ fontSize: '.5rem', letterSpacing: 4, color: 'rgba(255,255,255,.1)', textTransform: 'uppercase' }}>DAYEM ∞ — Trade Without Restrictions</span>
        </div>
      </div>
    </div>
  )
}
