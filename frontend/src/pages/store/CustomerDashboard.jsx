// frontend/src/pages/store/CustomerDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`
const G = '#D4AF37'

const STATUS_LABELS = {
  new: 'جديد', confirmed: 'مؤكد', processing: 'جاري',
  shipped: 'شحن', delivered: 'تسليم', cancelled: 'ملغي'
}
const STATUS_COLORS = {
  new: '#F59E0B', confirmed: '#60A5FA', processing: '#A78BFA',
  shipped: '#22D3EE', delivered: '#00D68F', cancelled: '#FF4D6D'
}

const cHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dayem_customer_token')}`
})

export default function CustomerDashboard() {
  const nav = useNavigate()
  const customer = JSON.parse(localStorage.getItem('dayem_customer') || '{}')

  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [reviewModal, setReviewModal] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('dayem_customer_token')) { nav('/customer/login'); return }
    loadOrders()
  }, [page])

  const loadOrders = async () => {
    setLoading(true)
    const res = await fetch(`${BASE}/customer/orders?page=${page}&limit=10`, { headers: cHeaders() }).then(r => r.json())
    if (res.success) { setOrders(res.orders); setTotalPages(res.pages) }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('dayem_customer_token')
    localStorage.removeItem('dayem_customer')
    nav('/')
  }

  const submitReview = async () => {
    if (!reviewModal) return
    try {
      const res = await fetch(`${BASE}/customer/reviews`, {
        method: 'POST',
        headers: cHeaders(),
        body: JSON.stringify({ merchantId: reviewModal.merchantId, orderId: reviewModal.orderId, rating, comment })
      }).then(r => r.json())
      if (res.success) {
        setToast('تم إرسال تقييمك ✓')
        setReviewModal(null)
        setTimeout(() => setToast(null), 3000)
      }
    } catch { setToast('حدث خطأ') }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl', color: '#EAE0C8' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.02)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, border: `1.5px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: G }}>∞</div>
          <div>
            <div style={{ fontWeight: 900, color: '#fff', fontSize: '.85rem', letterSpacing: 1 }}>دايم ∞</div>
            <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase' }}>حسابك</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff' }}>{customer.name}</div>
            <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>{customer.phone}</div>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,.2)', color: 'rgba(239,68,68,.5)', fontFamily: 'Tajawal', fontSize: '.7rem', padding: '5px 10px', cursor: 'pointer' }}>خروج</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        {[['orders', '📦 طلباتي'], ['track', '🔍 تتبع طلب']].map(([id, label]) => (
          <button key={id} onClick={() => { if (id === 'track') nav('/track'); else setTab(id) }}
            style={{ flex: 1, padding: '13px', background: tab === id ? 'rgba(212,175,55,.07)' : 'transparent', border: 'none', borderBottom: tab === id ? `2px solid ${G}` : '2px solid transparent', color: tab === id ? G : 'rgba(255,255,255,.4)', fontFamily: 'Tajawal', fontSize: '.82rem', cursor: 'pointer', fontWeight: tab === id ? 700 : 400, transition: 'all .2s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <div style={{ fontSize: '.6rem', letterSpacing: 3, color: 'rgba(212,175,55,.6)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>سجل الطلبات</div>

            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ height: 80, background: 'rgba(255,255,255,.025)', marginBottom: 10, animation: 'sk 1.8s ease infinite', backgroundSize: '200% 100%' }} />
              ))
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,.2)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
                <p>مفيش طلبات لسه</p>
              </div>
            ) : orders.map(o => (
              <div key={o._id} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '16px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${STATUS_COLORS[o.orderStatus] || G}55,transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8rem', color: G, fontWeight: 700 }}>{o.orderNumber}</div>
                    <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', marginTop: 3 }}>
                      {o.merchant?.store?.name} · {new Date(o.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#fff', fontSize: '.95rem' }}>{o.finalPrice} ج</div>
                    <span style={{ background: `${STATUS_COLORS[o.orderStatus]}15`, color: STATUS_COLORS[o.orderStatus], padding: '2px 8px', fontSize: '.62rem', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                      {STATUS_LABELS[o.orderStatus]}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => nav(`/track?order=${o.orderNumber}`)}
                    style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', fontFamily: 'Tajawal', fontSize: '.72rem', cursor: 'pointer' }}>
                    🔍 تتبع الطلب
                  </button>
                  {o.orderStatus === 'delivered' && (
                    <button onClick={() => { setReviewModal({ merchantId: o.merchant?._id, orderId: o._id, storeName: o.merchant?.store?.name }); setRating(5); setComment('') }}
                      style={{ flex: 1, padding: '7px', background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.2)', color: G, fontFamily: 'Tajawal', fontSize: '.72rem', cursor: 'pointer', fontWeight: 700 }}>
                      ⭐ قيّم المتجر
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 34, height: 34, background: page === p ? G : 'transparent', border: `1px solid ${page === p ? G : 'rgba(255,255,255,.1)'}`, color: page === p ? '#0C2540' : 'rgba(255,255,255,.4)', fontFamily: 'Tajawal', cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setReviewModal(null)}>
          <div style={{ background: '#0A1628', border: '1px solid rgba(212,175,55,.2)', width: '100%', maxWidth: 440, padding: 24, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '.58rem', letterSpacing: 3, color: 'rgba(212,175,55,.6)', textTransform: 'uppercase', marginBottom: 8 }}>تقييم المتجر</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{reviewModal.storeName}</div>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform .15s', transform: s <= rating ? 'scale(1.15)' : 'scale(1)', filter: s <= rating ? 'none' : 'grayscale(1) opacity(.3)' }}>
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              placeholder="شاركنا رأيك (اختياري)"
              value={comment} onChange={e => setComment(e.target.value)}
              style={{ width: '100%', height: 90, padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', fontFamily: 'Tajawal', fontSize: '.85rem', resize: 'none', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReviewModal(null)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)', fontFamily: 'Tajawal', cursor: 'pointer' }}>
                إلغاء
              </button>
              <button onClick={submitReview}
                style={{ flex: 1, padding: '10px', background: G, border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer' }}>
                إرسال التقييم ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.3)', color: '#00D68F', padding: '12px 24px', fontFamily: 'Tajawal', fontWeight: 700, zIndex: 999, animation: 'fadeIn .3s ease' }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes sk{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}
