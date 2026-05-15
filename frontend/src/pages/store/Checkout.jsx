import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { storeAPI, BASE } from '../../services/api'

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const GOVS = ['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']

const PAYMENT = [
  { v: 'cash',          l: 'كاش عند الاستلام', i: '💵', d: 'ادفع لما يوصلك' },
  { v: 'vodafone_cash', l: 'فودافون كاش',       i: '📱', d: 'حول على رقم المتجر' },
  { v: 'instapay',      l: 'انستاباي',          i: '⚡', d: 'تحويل فوري' },
  { v: 'fawry',         l: 'فوري',              i: '🏪', d: 'ادفع في أي فرع' },
]

const inputStyle = val => ({
  width: '100%', padding: '12px 14px',
  background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)',
  border: `1px solid ${val ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}`,
  fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none',
  transition: 'all .2s', boxSizing: 'border-box'
})

function CashPage({ final, onConfirm, loading }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>💵</div>
      <h2 style={{ color: '#fff', fontFamily: 'Tajawal', fontWeight: 900, fontSize: '1.4rem', marginBottom: 8 }}>الدفع عند الاستلام</h2>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem', fontFamily: 'Tajawal', marginBottom: 28, lineHeight: 1.7 }}>هتدفع المبلغ لما يوصلك الطلب<br />جهّز المبلغ المطلوب</p>
      <div style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.2)', padding: '20px', marginBottom: 28, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />
        <div style={{ fontSize: '.65rem', letterSpacing: 3, color: 'rgba(212,175,55,.6)', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Tajawal' }}>المبلغ المطلوب</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</div>
      </div>
      <button onClick={() => onConfirm({})} disabled={loading}
        style={{ width: '100%', padding: '15px', background: loading ? 'rgba(212,175,55,.3)' : '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontSize: '.95rem', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ جاري التأكيد...' : 'تأكيد الطلب ←'}
      </button>
    </div>
  )
}

function VodafonePage({ store, final, onConfirm, loading }) {
  const [ref, setRef] = useState('')
  const num = store?.vodafoneCash || store?.phone || ''
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>📱</div>
        <h2 style={{ color: '#fff', fontFamily: 'Tajawal', fontWeight: 900, fontSize: '1.3rem', marginBottom: 6 }}>فودافون كاش</h2>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem', fontFamily: 'Tajawal' }}>حوّل المبلغ على الرقم التالي</p>
      </div>
      <div style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.2)', padding: '20px', marginBottom: 16, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
        <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Tajawal' }}>رقم فودافون كاش</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: '#fff', fontWeight: 700, letterSpacing: 2, direction: 'ltr' }}>{num || '—'}</div>
          {num && <button onClick={() => navigator.clipboard.writeText(num)} style={{ background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.3)', color: '#D4AF37', fontFamily: 'Tajawal', fontSize: '.72rem', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>نسخ</button>}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'Tajawal', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>
      {['فتح تطبيق فودافون كاش', `تحويل ${final} ج على الرقم أعلاه`, 'انسخ رقم المرجع (Reference)', 'ادخله في الخانة أدناه وأكد'].map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,.04)' : 'none', marginBottom: i === 3 ? 16 : 0 }}>
          <div style={{ width: 24, height: 24, flexShrink: 0, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 900, color: '#D4AF37', fontFamily: 'monospace' }}>{i+1}</div>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem', fontFamily: 'Tajawal', paddingTop: 3 }}>{s}</span>
        </div>
      ))}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>رقم المرجع (Reference Number)</label>
        <input value={ref} onChange={e => setRef(e.target.value)} placeholder="مثال: 1234567890"
          style={{ ...inputStyle(ref), direction: 'ltr' }}
          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
          onBlur={e => { e.target.style.borderColor = ref ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = ref ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
      </div>
      <button onClick={() => onConfirm({ paymentRef: ref })} disabled={loading || !ref.trim()}
        style={{ width: '100%', padding: '15px', background: loading || !ref.trim() ? 'rgba(212,175,55,.25)' : '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontSize: '.95rem', fontWeight: 900, cursor: loading || !ref.trim() ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ جاري التأكيد...' : 'تأكيد التحويل ←'}
      </button>
    </div>
  )
}

function InstapayPage({ store, final, onConfirm, loading }) {
  const [ref, setRef] = useState('')
  const num = store?.instapay || store?.phone || ''
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>⚡</div>
        <h2 style={{ color: '#fff', fontFamily: 'Tajawal', fontWeight: 900, fontSize: '1.3rem', marginBottom: 6 }}>انستاباي</h2>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem', fontFamily: 'Tajawal' }}>تحويل فوري وآمن</p>
      </div>
      <div style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.2)', padding: '20px', marginBottom: 16, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
        <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Tajawal' }}>رقم / IPA الخاص بالمتجر</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#fff', fontWeight: 700, direction: 'ltr' }}>{num || '—'}</div>
          {num && <button onClick={() => navigator.clipboard.writeText(num)} style={{ background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.3)', color: '#D4AF37', fontFamily: 'Tajawal', fontSize: '.72rem', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>نسخ</button>}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'Tajawal', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>رقم العملية</label>
        <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Transaction ID"
          style={{ ...inputStyle(ref), direction: 'ltr' }}
          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
          onBlur={e => { e.target.style.borderColor = ref ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = ref ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
      </div>
      <button onClick={() => onConfirm({ paymentRef: ref })} disabled={loading || !ref.trim()}
        style={{ width: '100%', padding: '15px', background: loading || !ref.trim() ? 'rgba(212,175,55,.25)' : '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontSize: '.95rem', fontWeight: 900, cursor: loading || !ref.trim() ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ جاري التأكيد...' : 'تأكيد التحويل ←'}
      </button>
    </div>
  )
}

function FawryPage({ store, final, onConfirm, loading }) {
  const phone = store?.fawryCode || ''
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🏪</div>
        <h2 style={{ color: '#fff', fontFamily: 'Tajawal', fontWeight: 900, fontSize: '1.3rem', marginBottom: 6 }}>الدفع بفوري</h2>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem', fontFamily: 'Tajawal' }}>ادفع من My Fawry أو أي فرع فوري</p>
      </div>
      {phone && (
        <div style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.2)', padding: '20px', marginBottom: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
          <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Tajawal' }}>رقم موبايل فوري</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', color: '#D4AF37', fontWeight: 700, letterSpacing: 3 }}>{phone}</div>
            <button onClick={() => navigator.clipboard.writeText(phone)} style={{ background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.3)', color: '#D4AF37', fontFamily: 'Tajawal', fontSize: '.72rem', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>نسخ</button>
          </div>
        </div>
      )}
      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'Tajawal', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>
      {['افتح تطبيق My Fawry', 'اختر "ادفع لشخص" أو "Send Money"', phone ? `ادخل الرقم ${phone} وادفع ${final} ج` : `ادفع مبلغ ${final} ج`, 'أو روح أي فرع فوري واطلب دفع للرقم', 'احتفظ بالإيصال'].map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
          <div style={{ width: 24, height: 24, flexShrink: 0, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 900, color: '#D4AF37', fontFamily: 'monospace' }}>{i+1}</div>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem', fontFamily: 'Tajawal', paddingTop: 3 }}>{s}</span>
        </div>
      ))}
      <button onClick={() => onConfirm({})} disabled={loading} style={{ marginTop: 20, width: '100%', padding: '15px', background: loading ? 'rgba(212,175,55,.3)' : '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontSize: '.95rem', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ جاري التأكيد...' : 'تأكيد الطلب ←'}
      </button>
    </div>
  )
}

export default function Checkout() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const w = useW()
  const mob = w < 768

  const cart  = state?.cart  || []
  const store = state?.store

  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({ name: '', phone: '', address: '', governorate: '', paymentMethod: 'cash', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [couponData, setCouponData]   = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError]   = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('dayem_customer')
    if (saved) {
      const c = JSON.parse(saved)
      setForm(f => ({ ...f, name: c.name || f.name, phone: c.phone || f.phone, address: c.address || f.address, governorate: c.governorate || f.governorate }))
    }
  }, [])

  const totalPrice    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingPrice = totalPrice >= 500 ? 0 : 60
  const discount      = couponData?.discount || 0
  const finalPrice    = Math.max(0, totalPrice - discount + shippingPrice)

  const validateCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true); setCouponError('')
    try {
      const res = await fetch(`${BASE}/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput.trim(), merchantId: store?.merchantId, orderTotal: totalPrice }) }).then(r => r.json())
      if (res.success) { setCouponData(res.coupon); setCouponError('') }
      else { setCouponData(null); setCouponError(res.message || 'كوبون غير صحيح') }
    } catch { setCouponError('حدث خطأ، حاول تاني') }
    setCouponLoading(false)
  }

  const removeCoupon = () => { setCouponData(null); setCouponInput(''); setCouponError('') }

  const placeOrder = async (extra = {}) => {
    setLoading(true); setError('')
    try {
      const body = {
        customer: { name: form.name, phone: form.phone, address: form.address, governorate: form.governorate },
        items: cart.map(i => ({ product: i._id, nameAr: i.nameAr || i.name, price: i.price, quantity: i.qty, image: i.images?.[0]?.url })),
        paymentMethod: form.paymentMethod, notes: form.notes,
        couponCode: couponData?.code || undefined, ...extra
      }
      const res = await fetch(`${BASE}/store/${slug}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())
      if (res.success) nav(`/store/${slug}/success`, { state: { order: res.order, store } })
      else setError(res.message || 'حدث خطأ')
    } catch { setError('حدث خطأ في الاتصال بالسيرفر') }
    setLoading(false)
  }

  const goToPayment = e => {
    e.preventDefault()
    if (!form.governorate) { setError('اختر المحافظة'); return }
    setError(''); setStep(2)
  }

  const Summary = () => (
    <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.12)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -1, right: -1, width: 18, height: 18, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 18, height: 18, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 2, fontFamily: 'Tajawal' }}>ملخص الطلب</div>
        <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>{cart.length} منتج</div>
      </div>
      <div style={{ padding: '10px 16px', maxHeight: 220, overflowY: 'auto' }}>
        {cart.map(i => (
          <div key={i._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.05)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i.images?.[0]?.url ? <img src={i.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'rgba(212,175,55,.2)' }}>◆</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.76rem', color: '#fff', fontWeight: 600, marginBottom: 2, fontFamily: 'Tajawal' }}>{i.nameAr || i.name}</div>
              <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>× {i.qty}</div>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '.82rem', flexShrink: 0 }}>{i.price * i.qty} ج</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        {[['المنتجات', `${totalPrice} ج`], ['الشحن', shippingPrice === 0 ? 'مجاني ✓' : `${shippingPrice} ج`]].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.74rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>
            <span>{l}</span><span style={{ color: l === 'الشحن' && shippingPrice === 0 ? '#86EFAC' : 'rgba(255,255,255,.3)' }}>{v}</span>
          </div>
        ))}
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.74rem', color: '#86EFAC', fontFamily: 'Tajawal' }}>
            <span>خصم الكوبون</span><span>- {discount} ج</span>
          </div>
        )}
        {shippingPrice > 0 && (
          <div style={{ background: 'rgba(212,175,55,.05)', border: '1px solid rgba(212,175,55,.1)', padding: '6px 10px', marginBottom: 8, fontSize: '.63rem', color: '#D4AF37', fontFamily: 'Tajawal' }}>
            أضف {500 - totalPrice} ج للشحن المجاني
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(212,175,55,.12)' }}>
          <span style={{ fontWeight: 900, color: '#fff', fontFamily: 'Tajawal' }}>الإجمالي</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '1.1rem' }}>{finalPrice} ج</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', fontSize: mob ? '80vw' : '45vw', color: 'rgba(212,175,55,.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(212,175,55,.1)', position: 'relative', zIndex: 10, background: 'rgba(6,15,30,.95)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)' }} />
        <div style={{ padding: mob ? '0 14px' : '0 5%', height: mob ? 54 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => step === 2 ? setStep(1) : nav(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'Tajawal' }}>
            → {step === 2 ? 'رجوع للبيانات' : 'رجوع للمتجر'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {store?.logo && <div style={{ width: 28, height: 28, background: '#fff', overflow: 'hidden', padding: 2 }}><img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>}
            <div style={{ fontWeight: 900, color: '#fff', fontSize: mob ? '.85rem' : '.95rem' }}>{store?.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {[1, 2].map(s => <div key={s} style={{ width: s === step ? 24 : 8, height: 8, background: s === step ? '#D4AF37' : s < step ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.1)', transition: 'all .3s', borderRadius: 4 }} />)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: mob ? '20px 14px' : '36px 5%', position: 'relative', zIndex: 2 }}>

        {/* Mobile summary toggle */}
        {mob && (
          <div onClick={() => setShowSummary(!showSummary)} style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.15)', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '.8rem', color: '#D4AF37', fontWeight: 700 }}>ملخص الطلب ({cart.length} منتج)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37' }}>{finalPrice} ج</span>
              <span style={{ color: '#D4AF37', fontSize: '.8rem' }}>{showSummary ? '▲' : '▼'}</span>
            </div>
          </div>
        )}
        {mob && showSummary && <div style={{ marginBottom: 20 }}><Summary /></div>}

        <div style={{ display: mob ? 'block' : 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              {error && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', fontWeight: 600 }}>⚠️ {error}</div>}
              <form onSubmit={goToPayment}>
                {/* Delivery */}
                <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: mob ? '18px 16px' : '24px', marginBottom: 14, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                  <div style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 18, fontFamily: 'Tajawal' }}>بيانات التوصيل</div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    {[{ name: 'name', label: 'الاسم الكامل', ph: 'محمد أحمد' }, { name: 'phone', label: 'رقم الموبايل', ph: '01xxxxxxxxx' }].map(f => (
                      <div key={f.name}>
                        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>{f.label}</label>
                        <input name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required placeholder={f.ph} style={inputStyle(form[f.name])}
                          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                          onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>المحافظة</label>
                    <select value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} style={{ ...inputStyle(form.governorate), color: form.governorate ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر المحافظة</option>
                      {GOVS.map(g => <option key={g} value={g} style={{ background: '#0C2540' }}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>العنوان</label>
                    <input name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required placeholder="الشارع، رقم المبنى..." style={inputStyle(form.address)}
                      onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                      onBlur={e => { e.target.style.borderColor = form.address ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.address ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Tajawal' }}>ملاحظات (اختياري)</label>
                    <textarea name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي تعليمات خاصة..." rows={2} style={{ ...inputStyle(form.notes), resize: 'none' }} />
                  </div>
                </div>

                {/* Payment */}
                <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: mob ? '18px 16px' : '24px', marginBottom: 14, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                  <div style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16, fontFamily: 'Tajawal' }}>طريقة الدفع</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PAYMENT.map(p => (
                      <div key={p.v} onClick={() => setForm({ ...form, paymentMethod: p.v })}
                        style={{ padding: mob ? '10px' : '14px 16px', border: `1px solid ${form.paymentMethod === p.v ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.07)'}`, cursor: 'pointer', background: form.paymentMethod === p.v ? 'rgba(212,175,55,.06)' : 'rgba(255,255,255,.02)', transition: 'all .2s', position: 'relative' }}>
                        {form.paymentMethod === p.v && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#D4AF37' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: '.9rem' }}>{p.i}</span>
                          <span style={{ fontSize: mob ? '.72rem' : '.82rem', fontWeight: form.paymentMethod === p.v ? 800 : 400, color: form.paymentMethod === p.v ? '#fff' : 'rgba(255,255,255,.45)', fontFamily: 'Tajawal' }}>{p.l}</span>
                        </div>
                        {!mob && <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', marginRight: 22, fontFamily: 'Tajawal' }}>{p.d}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: mob ? '18px 16px' : '24px', marginBottom: 20, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                  <div style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 14, fontFamily: 'Tajawal' }}>كوبون الخصم</div>
                  {couponData ? (
                    <div style={{ background: 'rgba(134,239,172,.06)', border: '1px solid rgba(134,239,172,.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#86EFAC', fontWeight: 700, fontSize: '.85rem', fontFamily: 'Tajawal', marginBottom: 2 }}>✓ تم تطبيق الكوبون</div>
                        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.75rem', fontFamily: 'Tajawal' }}>{couponData.code} · وفّرت <span style={{ color: '#86EFAC', fontWeight: 700 }}>{couponData.discount} ج</span></div>
                      </div>
                      <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,.5)', cursor: 'pointer', fontSize: '.75rem', fontFamily: 'Tajawal' }}>إزالة</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="أدخل كود الخصم"
                          style={{ ...inputStyle(couponInput), flex: 1, direction: 'ltr', letterSpacing: 2 }}
                          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                          onBlur={e => { e.target.style.borderColor = couponInput ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = couponInput ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), validateCoupon())} />
                        <button type="button" onClick={validateCoupon} disabled={couponLoading || !couponInput.trim()}
                          style={{ padding: '0 20px', background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.25)', color: '#D4AF37', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem', flexShrink: 0 }}>
                          {couponLoading ? '...' : 'تطبيق'}
                        </button>
                      </div>
                      {couponError && <div style={{ color: '#FCA5A5', fontSize: '.75rem', marginTop: 8, fontFamily: 'Tajawal' }}>⚠️ {couponError}</div>}
                    </div>
                  )}
                </div>

                <button type="submit" style={{ width: '100%', padding: mob ? '14px' : '15px', background: '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontSize: mob ? '.9rem' : '.95rem', fontWeight: 900, cursor: 'pointer', letterSpacing: 1 }}>
                  متابعة للدفع · {finalPrice} ج ←
                </button>
              </form>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: mob ? '18px 16px' : '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
              {form.paymentMethod === 'cash'          && <CashPage     final={finalPrice} onConfirm={placeOrder} loading={loading} />}
              {form.paymentMethod === 'vodafone_cash' && <VodafonePage  final={finalPrice} store={store} onConfirm={extra => placeOrder(extra)} loading={loading} />}
              {form.paymentMethod === 'instapay'      && <InstapayPage  final={finalPrice} store={store} onConfirm={extra => placeOrder(extra)} loading={loading} />}
              {form.paymentMethod === 'fawry'         && <FawryPage     final={finalPrice} store={store} onConfirm={placeOrder} loading={loading} />}
              {error && <div style={{ color: '#FCA5A5', fontSize: '.8rem', marginTop: 12, fontFamily: 'Tajawal', textAlign: 'center' }}>⚠️ {error}</div>}
            </div>
          )}

          {!mob && <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}><Summary /></div>}
        </div>
      </div>
    </div>
  )
}
