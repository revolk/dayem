import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function OrderSuccess() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const w = useWindowWidth()
  const isMobile = w < 768

  const order = state?.order
  const store = state?.store
  const [showCancel, setShowCancel] = useState(false)
  const [cancelSent, setCancelSent] = useState(false)
  const [editSent, setEditSent] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleCancel = () => {
    if (store?.phone) {
      const msg = `مرحباً، أريد إلغاء طلبي رقم ${order?.orderNumber}`
      window.open(`https://wa.me/${store.phone}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setCancelSent(true)
    setShowCancel(false)
  }

  const handleEdit = () => {
    if (store?.phone) {
      const msg = `مرحباً، أريد تعديل طلبي رقم ${order?.orderNumber}`
      window.open(`https://wa.me/${store.phone}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setEditSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px' : '40px 20px', fontFamily: 'Tajawal', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>

      {/* BG */}
      <div style={{ position: 'absolute', fontSize: isMobile ? '80vw' : '45vw', color: 'rgba(212,175,55,.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(34,197,94,.04), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all .6s cubic-bezier(.4,0,.2,1)' }}>

        {/* Success Icon */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: isMobile ? 70 : 82, height: isMobile ? 70 : 82, margin: '0 auto 14px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(34,197,94,.2)', borderRadius: '50%', animation: 'pulse-ring 2s ease infinite' }} />
            <div style={{ position: 'absolute', inset: 8, background: 'rgba(34,197,94,.06)', borderRadius: '50%' }} />
            <span style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: '#86EFAC', position: 'relative', zIndex: 1 }}>✓</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 1, background: 'rgba(134,239,172,.2)' }} />
            <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#86EFAC', textTransform: 'uppercase', fontWeight: 800 }}>تم التأكيد</span>
            <div style={{ width: 32, height: 1, background: 'rgba(134,239,172,.2)' }} />
          </div>
        </div>

        <h1 style={{ fontSize: isMobile ? '1.6rem' : '1.9rem', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
          تم استلام طلبك
        </h1>
        <p style={{ color: 'rgba(255,255,255,.3)', marginBottom: 28, lineHeight: 1.9, fontSize: isMobile ? '.82rem' : '.88rem', fontWeight: 300 }}>
          شكراً لطلبك من <span style={{ color: '#D4AF37', fontWeight: 700 }}>{store?.name}</span><br />
          هيتواصل معاك قريباً لتأكيد التوصيل
        </p>

        {/* Order Details */}
        {order && (
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.12)', padding: isMobile ? '16px' : '22px', marginBottom: 20, position: 'relative', textAlign: 'right', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all .6s .2s cubic-bezier(.4,0,.2,1)' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 16, height: 16, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 16, height: 16, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />

            {[
              { l: 'رقم الطلب', v: order.orderNumber, c: '#D4AF37' },
              { l: 'المبلغ الإجمالي', v: `${order.finalPrice} ج`, c: '#fff' },
              { l: 'الحالة', v: 'قيد المعالجة', c: '#93C5FD' },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: isMobile ? '.8rem' : '.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 300 }}>{l}</span>
                <span style={{ fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap', opacity: visible ? 1 : 0, transition: 'all .6s .35s cubic-bezier(.4,0,.2,1)' }}>
          <button onClick={() => nav(`/store/${slug}`)} style={{
            background: '#D4AF37', color: '#0C2540', border: 'none',
            padding: isMobile ? '11px 20px' : '12px 28px',
            fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer',
            fontSize: isMobile ? '.8rem' : '.85rem', letterSpacing: 1,
            transition: 'all .25s', flex: isMobile ? 1 : 'none'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0D060'}
            onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}>
            متابعة التسوق
          </button>

          {store?.phone && (
            <a href={`https://wa.me/${store.phone}`} target="_blank" rel="noopener" style={{
              background: 'transparent', color: '#86EFAC',
              border: '1px solid rgba(34,197,94,.25)',
              padding: isMobile ? '11px 20px' : '12px 28px',
              fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer',
              fontSize: isMobile ? '.8rem' : '.85rem', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all .25s', flex: isMobile ? 1 : 'none',
              justifyContent: 'center'
            }}>
              💬 تواصل
            </a>
          )}
        </div>

        {/* Edit / Cancel */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '14px 16px' : '18px 20px', marginBottom: 24, opacity: visible ? 1 : 0, transition: 'all .6s .45s cubic-bezier(.4,0,.2,1)' }}>
          <div style={{ fontSize: '.55rem', letterSpacing: 3, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>تعديل أو إلغاء الطلب</div>

          {cancelSent || editSent ? (
            <div style={{ fontSize: '.82rem', color: '#86EFAC', fontWeight: 600 }}>
              ✓ تم إرسال طلبك — هيتواصل معاك المتجر قريباً
            </div>
          ) : (
            <>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 14, lineHeight: 1.7, fontWeight: 300 }}>
                لو عايز تعدّل أو تلغي طلبك، تواصل مع المتجر عبر واتساب
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleEdit} style={{
                  background: 'transparent', color: 'rgba(212,175,55,.7)',
                  border: '1px solid rgba(212,175,55,.2)',
                  padding: '9px 18px', fontFamily: 'Tajawal', fontWeight: 700,
                  cursor: 'pointer', fontSize: '.76rem', letterSpacing: 1,
                  transition: 'all .25s', flex: isMobile ? 1 : 'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.color = '#D4AF37' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,.2)'; e.currentTarget.style.color = 'rgba(212,175,55,.7)' }}>
                  ✏️ تعديل
                </button>
                <button onClick={() => setShowCancel(true)} style={{
                  background: 'transparent', color: 'rgba(239,68,68,.6)',
                  border: '1px solid rgba(239,68,68,.15)',
                  padding: '9px 18px', fontFamily: 'Tajawal', fontWeight: 700,
                  cursor: 'pointer', fontSize: '.76rem', letterSpacing: 1,
                  transition: 'all .25s', flex: isMobile ? 1 : 'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)'; e.currentTarget.style.color = '#FCA5A5' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = 'rgba(239,68,68,.6)' }}>
                  ✕ إلغاء
                </button>
              </div>
            </>
          )}
        </div>

        {/* Powered by */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: visible ? 1 : 0, transition: 'all .6s .55s' }}>
          <div style={{ width: 16, height: 1, background: 'rgba(212,175,55,.15)' }} />
          <span style={{ fontSize: '.5rem', letterSpacing: 4, color: 'rgba(255,255,255,.15)', textTransform: 'uppercase' }}>مدعوم بـ</span>
          <span style={{ color: '#D4AF37', fontWeight: 900, fontSize: '.7rem', letterSpacing: 3, opacity: .7 }}>DAYEM ∞</span>
          <div style={{ width: 16, height: 1, background: 'rgba(212,175,55,.15)' }} />
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0A1628', border: '1px solid rgba(239,68,68,.2)', padding: isMobile ? '24px 20px' : '28px', maxWidth: 360, width: '100%', position: 'relative', textAlign: 'center', animation: 'fadeIn .25s ease' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid rgba(239,68,68,.5)', borderRight: '1.5px solid rgba(239,68,68,.5)' }} />
            <div style={{ fontSize: '1.5rem', color: '#FCA5A5', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 800, color: '#fff', marginBottom: 8, fontSize: '.95rem' }}>تأكيد إلغاء الطلب</h3>
            <p style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.4)', marginBottom: 20, lineHeight: 1.7 }}>
              هيتم إرسال طلب الإلغاء للمتجر عبر واتساب<br />
              رقم الطلب: <span style={{ color: '#D4AF37', fontWeight: 700 }}>{order?.orderNumber}</span>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleCancel} style={{ background: 'rgba(239,68,68,.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,.3)', padding: '10px 22px', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem', transition: 'all .2s', flex: 1 }}>
                تأكيد الإلغاء
              </button>
              <button onClick={() => setShowCancel(false)} style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)', padding: '10px 22px', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem', transition: 'all .2s', flex: 1 }}>
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          50%  { transform: scale(1.08); opacity: .2; }
          100% { transform: scale(1);   opacity: .6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
