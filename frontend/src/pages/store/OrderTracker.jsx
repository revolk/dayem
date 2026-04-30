// frontend/src/pages/store/OrderTracker.jsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`
const G = '#D4AF37'

const STATUS_STEPS = [
  { key: 'new',        label: 'تم الاستلام',    icon: '📋' },
  { key: 'confirmed',  label: 'تم التأكيد',     icon: '✅' },
  { key: 'processing', label: 'جاري التجهيز',   icon: '📦' },
  { key: 'shipped',    label: 'في الطريق',      icon: '🚚' },
  { key: 'delivered',  label: 'تم التوصيل',     icon: '🎉' },
]

const STATUS_INDEX = { new: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 }

const METHOD_LABELS = {
  cash: 'كاش عند الاستلام 💵',
  vodafone_cash: 'فودافون كاش 📱',
  instapay: 'انستاباي ⚡',
  fawry: 'فوري 🏪',
}

export default function OrderTracker() {
  const [params] = useSearchParams()
  const [orderNum, setOrderNum] = useState(params.get('order') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  const track = async e => {
    e?.preventDefault()
    if (!orderNum.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res = await fetch(`${BASE}/customer/track/${orderNum.trim().toUpperCase()}`).then(r => r.json())
      if (res.success) setOrder(res.order)
      else setError('الطلب مش موجود — تأكد من الرقم')
    } catch { setError('خطأ في الاتصال') }
    setLoading(false)
  }

  // Auto-track if order number in URL
  useState(() => { if (params.get('order')) track() }, [])

  const stepIdx = order ? (STATUS_INDEX[order.orderStatus] ?? -1) : -1

  return (
    <div style={{
      minHeight: '100vh', background: '#060F1E',
      fontFamily: 'Tajawal', direction: 'rtl', color: '#EAE0C8',
      padding: '0 0 60px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,175,55,.05),transparent 65%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.02)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px 0 0', lineHeight: 1 }}>←</button>
        <div style={{ width: 36, height: 36, border: `1.5px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: G }}>∞</div>
        <div>
          <div style={{ fontWeight: 900, color: '#fff', fontSize: '.9rem', letterSpacing: 1 }}>دايم ∞</div>
          <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase' }}>تتبع طلبك</div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
        {/* Search */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            تتبع <em style={{ color: G, fontStyle: 'italic' }}>طلبك</em>
          </h1>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.3)' }}>
            ادخل رقم الطلب اللي جالك في رسالة التأكيد
          </p>
        </div>

        <form onSubmit={track}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="text" value={orderNum}
              onChange={e => setOrderNum(e.target.value.toUpperCase())}
              placeholder="DAY-00001"
              style={{
                flex: 1, padding: '13px 16px',
                background: focused ? 'rgba(212,175,55,.05)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${focused ? G : 'rgba(255,255,255,.1)'}`,
                fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem',
                color: '#fff', outline: 'none', letterSpacing: 2,
                direction: 'ltr', textAlign: 'center', transition: 'all .2s'
              }}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            />
            <button type="submit" disabled={loading || !orderNum}
              style={{
                padding: '13px 24px', background: orderNum ? G : 'rgba(212,175,55,.3)',
                border: 'none', color: '#0C2540', fontFamily: 'Tajawal',
                fontWeight: 900, fontSize: '.88rem', cursor: orderNum ? 'pointer' : 'not-allowed',
                transition: 'all .25s', whiteSpace: 'nowrap'
              }}>
              {loading ? '⏳' : 'تتبع ←'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '12px 16px', textAlign: 'center', fontSize: '.82rem', marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            {/* Order header */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.85rem', color: G, fontWeight: 700, marginBottom: 4 }}>{order.orderNumber}</div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)' }}>
                    {new Date(order.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                  {order.finalPrice} <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>ج</span>
                </div>
              </div>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>
                {METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </div>
            </div>

            {/* Store info */}
            {order.store && (
              <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                {order.store.logo && <img src={order.store.logo} alt="" style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid rgba(212,175,55,.2)' }} />}
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '.88rem' }}>{order.store.name}</div>
                  {order.store.phone && <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', marginTop: 2 }}>للتواصل: {order.store.phone}</div>}
                </div>
              </div>
            )}

            {/* Progress Steps */}
            {order.orderStatus !== 'cancelled' ? (
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '24px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: '.58rem', letterSpacing: 3, color: 'rgba(212,175,55,.6)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 24 }}>حالة الطلب</div>
                <div style={{ position: 'relative' }}>
                  {/* Progress line */}
                  <div style={{ position: 'absolute', top: 20, right: 20, left: 20, height: 2, background: 'rgba(255,255,255,.06)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 20, right: 20, height: 2, width: `${Math.max((stepIdx / (STATUS_STEPS.length - 1)) * 100, 0)}%`, background: `linear-gradient(90deg,${G},rgba(212,175,55,.4))`, zIndex: 1, transition: 'width 1s ease' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    {STATUS_STEPS.map((s, i) => {
                      const done = i <= stepIdx
                      const current = i === stepIdx
                      return (
                        <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                          <div style={{
                            width: 40, height: 40,
                            background: done ? G : 'rgba(255,255,255,.05)',
                            border: `2px solid ${done ? G : 'rgba(255,255,255,.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', transition: 'all .4s',
                            boxShadow: current ? `0 0 16px ${G}60` : 'none',
                            transform: current ? 'scale(1.1)' : 'scale(1)',
                          }}>
                            {s.icon}
                          </div>
                          <div style={{ fontSize: '.58rem', color: done ? G : 'rgba(255,255,255,.25)', fontWeight: done ? 700 : 400, textAlign: 'center', transition: 'color .3s' }}>
                            {s.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', padding: '16px', marginBottom: 16, textAlign: 'center', color: '#FCA5A5', fontSize: '.85rem', fontWeight: 700 }}>
                ❌ تم إلغاء الطلب
              </div>
            )}

            {/* Items */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '16px 20px' }}>
              <div style={{ fontSize: '.58rem', letterSpacing: 3, color: 'rgba(212,175,55,.6)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 14 }}>المنتجات</div>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                  {item.image && <img src={item.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid rgba(255,255,255,.08)' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '.85rem' }}>{item.nameAr}</div>
                    <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', marginTop: 2 }}>الكمية: {item.quantity}</div>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: G, fontSize: '.9rem' }}>
                    {item.price * item.quantity} ج
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login link */}
        <div style={{ textAlign: 'center', marginTop: 32, padding: '20px', border: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.02)' }}>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 12 }}>عايز تشوف كل طلباتك في مكان واحد؟</p>
          <a href="/customer/login" style={{ color: G, fontSize: '.8rem', fontWeight: 700, textDecoration: 'none' }}>
            سجل دخولك برقم موبايلك ←
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}
