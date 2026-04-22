import { useState, useEffect } from 'react'
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

const STATUSES = [
  { id: 'all', label: 'الكل' },
  { id: 'new', label: 'جديد', color: '#93C5FD', bg: 'rgba(59,130,246,.1)' },
  { id: 'confirmed', label: 'مؤكد', color: '#86EFAC', bg: 'rgba(34,197,94,.1)' },
  { id: 'processing', label: 'جاري', color: '#FDE047', bg: 'rgba(234,179,8,.1)' },
  { id: 'shipped', label: 'شحن', color: '#FDE047', bg: 'rgba(234,179,8,.1)' },
  { id: 'delivered', label: 'تسليم', color: '#86EFAC', bg: 'rgba(34,197,94,.1)' },
  { id: 'cancelled', label: 'ملغي', color: '#FCA5A5', bg: 'rgba(239,68,68,.1)' },
]

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
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

export default function Orders() {
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const res = await merchantAPI.getOrders()
    if (res.success) setOrders(res.orders)
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await merchantAPI.updateOrder(id, status)
    load()
    if (selected?._id === id) setSelected({ ...selected, orderStatus: status })
  }

  const getStatus = id => STATUSES.find(s => s.id === id) || STATUSES[1]

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.orderStatus === filter
    const matchSearch = !search || o.orderNumber?.includes(search) || o.customer?.name?.includes(search) || o.customer?.phone?.includes(search)
    return matchFilter && matchSearch
  })

  const openDetail = (o) => {
    setSelected(o)
    if (isMobile) setShowDetail(true)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="orders" />
      <div style={{ flex: 1, marginRight: isMobile ? 0 : 240, padding: isMobile ? '68px 16px 24px' : '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 16 : 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
            <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>إدارة الطلبات</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>الطلبات</h1>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>{orders.length} طلب</p>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'جديد', count: orders.filter(o => o.orderStatus === 'new').length, color: '#93C5FD' },
                  { label: 'تسليم', count: orders.filter(o => o.orderStatus === 'delivered').length, color: '#86EFAC' },
                  { label: 'محصل', count: `${orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.finalPrice, 0).toLocaleString()} ج`, color: '#D4AF37' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '7px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '.95rem', fontWeight: 700, color: p.color }}>{p.count}</span>
                    <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)' }}>{p.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.25)', fontSize: '.78rem', pointerEvents: 'none' }}>◈</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث برقم الطلب أو الاسم..."
              style={{ width: '100%', padding: '10px 36px 10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', fontFamily: 'Tajawal', fontSize: '.82rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: 2 }}>
            {STATUSES.map(s => (
              <button key={s.id} onClick={() => setFilter(s.id)} style={{
                padding: isMobile ? '6px 12px' : '7px 14px', border: `1px solid ${filter === s.id ? (s.color || '#D4AF37') + '44' : 'rgba(255,255,255,.07)'}`,
                cursor: 'pointer', fontFamily: 'Tajawal', fontSize: '.7rem',
                fontWeight: filter === s.id ? 700 : 400, whiteSpace: 'nowrap',
                background: filter === s.id ? (s.bg || 'rgba(212,175,55,.08)') : 'transparent',
                color: filter === s.id ? (s.color || '#D4AF37') : 'rgba(255,255,255,.3)',
                flexShrink: 0, transition: 'all .2s'
              }}>
                {s.label}
                {s.id !== 'all' && orders.filter(o => o.orderStatus === s.id).length > 0 && (
                  <span style={{ marginRight: 4, fontSize: '.62rem', opacity: .7 }}>{orders.filter(o => o.orderStatus === s.id).length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '1.8rem', color: 'rgba(212,175,55,.15)', marginBottom: 12 }}>◉</div>
            <div style={{ color: 'rgba(255,255,255,.2)', fontSize: '.82rem' }}>جاري التحميل...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.02)' }}>
            <div style={{ fontSize: '2rem', color: 'rgba(212,175,55,.1)', marginBottom: 12 }}>◉</div>
            <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '.85rem' }}>لا توجد طلبات</div>
          </div>
        ) : (
          <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(o => {
                const st = getStatus(o.orderStatus)
                const isSelected = selected?._id === o._id
                return (
                  <div key={o._id} onClick={() => openDetail(o)}
                    style={{ background: isSelected ? 'rgba(212,175,55,.05)' : 'rgba(255,255,255,.025)', border: `1px solid ${isSelected ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.055)'}`, padding: isMobile ? '12px 14px' : '14px 18px', cursor: 'pointer', transition: 'all .2s', position: 'relative' }}>
                    {isSelected && <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 2, background: '#D4AF37' }} />}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#D4AF37', letterSpacing: 1 }}>{o.orderNumber}</span>
                          <span style={{ background: st.bg, color: st.color, padding: '2px 8px', fontSize: '.58rem', fontWeight: 700 }}>{st.label}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: isMobile ? '.82rem' : '.88rem', marginBottom: 3 }}>{o.customer?.name}</div>
                        <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.28)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span>{o.customer?.phone}</span>
                          <span>·</span>
                          <span style={{ color: 'rgba(212,175,55,.45)' }}>{timeAgo(o.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'left', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? '.95rem' : '1.05rem', fontWeight: 700, color: '#fff' }}>
                          {o.finalPrice} <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>ج</span>
                        </div>
                        <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.25)', marginTop: 3 }}>
                          {o.paymentMethod === 'cash' ? 'كاش' : o.paymentMethod === 'vodafone_cash' ? 'فودافون' : o.paymentMethod === 'instapay' ? 'انستاباي' : o.paymentMethod}
                        </div>
                      </div>
                    </div>

                    {o.items?.length > 0 && (
                      <div style={{ marginTop: 8, paddingTop: 7, borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.items.slice(0, isMobile ? 2 : 3).map((item, idx) => (
                          <span key={idx} style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.28)', background: 'rgba(255,255,255,.03)', padding: '2px 8px', border: '1px solid rgba(255,255,255,.05)' }}>
                            {item.nameAr || item.name} × {item.quantity}
                          </span>
                        ))}
                        {o.items.length > (isMobile ? 2 : 3) && <span style={{ fontSize: '.6rem', color: 'rgba(212,175,55,.5)', padding: '2px 6px' }}>+{o.items.length - (isMobile ? 2 : 3)}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop Detail Panel */}
            {!isMobile && selected && (
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(212,175,55,.15)', position: 'sticky', top: 20, overflow: 'hidden' }}>
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '.52rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 3 }}>تفاصيل الطلب</div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '.88rem' }}>{selected.orderNumber}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.35)', width: 28, height: 28, cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <DetailContent selected={selected} updateStatus={updateStatus} formatDate={formatDate} STATUSES={STATUSES} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Detail Drawer */}
      {isMobile && showDetail && selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div onClick={() => setShowDetail(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0A1628', borderRadius: '16px 16px 0 0', border: '1px solid rgba(212,175,55,.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '10px auto 0' }} />
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginTop: 10 }} />
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.52rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 3 }}>تفاصيل الطلب</div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '.88rem' }}>{selected.orderNumber}</div>
              </div>
              <button onClick={() => setShowDetail(false)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.35)', width: 30, height: 30, cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <DetailContent selected={selected} updateStatus={updateStatus} formatDate={formatDate} STATUSES={STATUSES} />
          </div>
        </div>
      )}
    </div>
  )
}

function DetailContent({ selected, updateStatus, formatDate, STATUSES }) {
  return (
    <div style={{ padding: '16px 18px', maxHeight: '70vh', overflowY: 'auto' }}>
      <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)', padding: '10px 12px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)' }}>تاريخ الطلب</span>
        <span style={{ fontSize: '.68rem', fontWeight: 600, color: 'rgba(212,175,55,.8)' }}>{formatDate(selected.createdAt)}</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>بيانات الزبون</div>
        {[['الاسم', selected.customer?.name], ['الموبايل', selected.customer?.phone], ['المحافظة', selected.customer?.governorate], ['العنوان', selected.customer?.address]].filter(([, v]) => v).map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: '.76rem' }}>
            <span style={{ color: 'rgba(255,255,255,.28)' }}>{l}</span>
            <span style={{ color: '#fff', fontWeight: 600, maxWidth: '65%', textAlign: 'left', wordBreak: 'break-word' }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>المنتجات</div>
        {selected.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div>
              <div style={{ fontSize: '.78rem', color: '#fff', fontWeight: 600 }}>{item.nameAr || item.name}</div>
              <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.25)' }}>× {item.quantity} · {item.price} ج</div>
            </div>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#D4AF37' }}>{item.price * item.quantity} ج</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '10px 12px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.74rem', color: 'rgba(255,255,255,.3)' }}>
          <span>الدفع</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{selected.paymentMethod === 'cash' ? 'كاش' : selected.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : selected.paymentMethod === 'instapay' ? 'انستاباي' : selected.paymentMethod}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 7, borderTop: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '.82rem' }}>الإجمالي</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', fontWeight: 700, color: '#D4AF37' }}>{selected.finalPrice} ج</span>
        </div>
      </div>

      {selected.notes && (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '10px 12px', marginBottom: 16 }}>
          <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 6 }}>ملاحظات</div>
          <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{selected.notes}</div>
        </div>
      )}

      <div>
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 10 }}>تحديث الحالة</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {STATUSES.filter(s => s.id !== 'all').map(s => (
            <button key={s.id} onClick={() => updateStatus(selected._id, s.id)} style={{
              padding: '8px', background: selected.orderStatus === s.id ? s.bg : 'rgba(255,255,255,.03)',
              border: `1px solid ${selected.orderStatus === s.id ? s.color + '55' : 'rgba(255,255,255,.07)'}`,
              color: selected.orderStatus === s.id ? s.color : 'rgba(255,255,255,.35)',
              fontFamily: 'Tajawal', fontSize: '.7rem', fontWeight: selected.orderStatus === s.id ? 700 : 400, cursor: 'pointer', transition: 'all .2s'
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
