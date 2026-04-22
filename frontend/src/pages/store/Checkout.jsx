import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { storeAPI } from '../../services/api'

const useWindowWidth = () => {
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
  { v: 'cash', l: 'كاش عند الاستلام', i: '◆', d: 'ادفع لما يوصلك' },
  { v: 'vodafone_cash', l: 'فودافون كاش', i: '◈', d: 'حول على رقم المتجر' },
  { v: 'instapay', l: 'انستاباي', i: '◉', d: 'تحويل فوري' },
  { v: 'fawry', l: 'فوري', i: '◎', d: 'ادفع في أي فرع' },
]

export default function Checkout() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const w = useWindowWidth()
  const isMobile = w < 768

  const cart = state?.cart || []
  const store = state?.store
  const [form, setForm] = useState({ name: '', phone: '', address: '', governorate: '', paymentMethod: 'cash', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = total >= 500 ? 0 : 60
  const final = total + shipping

  const submit = async e => {
    e.preventDefault()
    if (!form.governorate) { setError('اختر المحافظة'); return }
    setLoading(true)
    setError('')
    const res = await storeAPI.placeOrder(slug, {
      customer: { name: form.name, phone: form.phone, address: form.address, governorate: form.governorate },
      items: cart.map(i => ({ product: i._id, nameAr: i.nameAr || i.name, price: i.price, quantity: i.qty, image: i.images?.[0]?.url })),
      paymentMethod: form.paymentMethod,
      notes: form.notes
    })
    if (res.success) nav(`/store/${slug}/success`, { state: { order: res.order, store } })
    else setError(res.message || 'حدث خطأ')
    setLoading(false)
  }

  const inputStyle = (val) => ({
    width: '100%', padding: '12px 14px',
    background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)',
    border: `1px solid ${val ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}`,
    fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none',
    transition: 'all .2s', boxSizing: 'border-box'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', fontSize: isMobile ? '80vw' : '45vw', color: 'rgba(212,175,55,.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(212,175,55,.1)', position: 'relative', zIndex: 10 }}>
        <div style={{ padding: isMobile ? '0 14px' : '0 5%', height: isMobile ? 54 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'Tajawal' }}>→ رجوع</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {store?.logo && (
              <div style={{ width: 28, height: 28, background: '#fff', overflow: 'hidden', padding: 2 }}>
                <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ fontWeight: 900, color: '#fff', fontSize: isMobile ? '.85rem' : '.95rem' }}>{store?.name}</div>
          </div>
          <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase' }}>إتمام الطلب</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '20px 14px' : '36px 5%', position: 'relative', zIndex: 2 }}>

        {/* Mobile order summary toggle */}
        {isMobile && (
          <div onClick={() => setShowSummary(!showSummary)}
            style={{ background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.15)', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '.8rem', color: '#D4AF37', fontWeight: 700 }}>ملخص الطلب ({cart.length} منتج)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
              <span style={{ color: '#D4AF37', fontSize: '.8rem' }}>{showSummary ? '▲' : '▼'}</span>
            </div>
          </div>
        )}

        {/* Mobile summary expanded */}
        {isMobile && showSummary && (
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.12)', padding: '16px', marginBottom: 20 }}>
            {cart.map(i => (
              <div key={i._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,.05)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i.images?.[0]?.url ? <img src={i.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'rgba(212,175,55,.2)', fontSize: '.8rem' }}>◆</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.78rem', color: '#fff', fontWeight: 600 }}>{i.nameAr || i.name}</div>
                  <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>× {i.qty}</div>
                </div>
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '.85rem' }}>{i.price * i.qty} ج</span>
              </div>
            ))}
            <div style={{ paddingTop: 10, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>
                <span>الشحن</span><span style={{ color: shipping === 0 ? '#86EFAC' : 'rgba(255,255,255,.3)' }}>{shipping === 0 ? 'مجاني ✓' : `${shipping} ج`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
                <span style={{ color: '#fff' }}>الإجمالي</span>
                <span style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>{final} ج</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

          {/* Form */}
          <div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit}>
              {/* Delivery */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '18px 16px' : '24px', marginBottom: 14, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                <div style={{ fontSize: '.58rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>بيانات التوصيل</div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {[
                    { name: 'name', label: 'الاسم الكامل', placeholder: 'محمد أحمد' },
                    { name: 'phone', label: 'رقم الموبايل', placeholder: '01xxxxxxxxx' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                      <input name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required placeholder={f.placeholder}
                        style={inputStyle(form[f.name])}
                        onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                        onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>المحافظة</label>
                  <select value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })}
                    style={{ ...inputStyle(form.governorate), color: form.governorate ? '#fff' : 'rgba(255,255,255,.3)' }}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'}
                    onBlur={e => e.target.style.borderColor = form.governorate ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}>
                    <option value="" style={{ background: '#0C2540' }}>اختر المحافظة</option>
                    {GOVS.map(g => <option key={g} value={g} style={{ background: '#0C2540' }}>{g}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>العنوان</label>
                  <input name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required placeholder="الشارع، رقم المبنى..."
                    style={inputStyle(form.address)}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                    onBlur={e => { e.target.style.borderColor = form.address ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.address ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>ملاحظات (اختياري)</label>
                  <textarea name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي تعليمات خاصة..." rows={2}
                    style={{ ...inputStyle(form.notes), resize: 'none' }} />
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '18px 16px' : '24px', marginBottom: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                <div style={{ fontSize: '.58rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>طريقة الدفع</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: 8 }}>
                  {PAYMENT.map(p => (
                    <div key={p.v} onClick={() => setForm({ ...form, paymentMethod: p.v })}
                      style={{ padding: isMobile ? '10px 10px' : '14px 16px', border: `1px solid ${form.paymentMethod === p.v ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.07)'}`, cursor: 'pointer', background: form.paymentMethod === p.v ? 'rgba(212,175,55,.06)' : 'rgba(255,255,255,.02)', transition: 'all .2s', position: 'relative' }}>
                      {form.paymentMethod === p.v && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#D4AF37' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: '.85rem', color: form.paymentMethod === p.v ? '#D4AF37' : 'rgba(255,255,255,.3)' }}>{p.i}</span>
                        <span style={{ fontSize: isMobile ? '.72rem' : '.82rem', fontWeight: form.paymentMethod === p.v ? 800 : 400, color: form.paymentMethod === p.v ? '#fff' : 'rgba(255,255,255,.45)' }}>{p.l}</span>
                      </div>
                      {!isMobile && <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', marginRight: 22 }}>{p.d}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: isMobile ? '14px' : '15px',
                background: loading ? 'rgba(212,175,55,.3)' : '#D4AF37',
                color: '#0C2540', border: 'none', fontFamily: 'Tajawal',
                fontSize: isMobile ? '.9rem' : '.95rem', fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1
              }}>
                {loading ? '⏳ جاري التأكيد...' : `تأكيد الطلب · ${final} ج ←`}
              </button>
            </form>
          </div>

          {/* Desktop Order Summary */}
          {!isMobile && (
            <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.12)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -1, right: -1, width: 18, height: 18, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
                <div style={{ position: 'absolute', bottom: -1, left: -1, width: 18, height: 18, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />

                <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ fontSize: '.58rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 3 }}>ملخص الطلب</div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)' }}>{cart.length} منتج</div>
                </div>

                <div style={{ padding: '12px 18px', maxHeight: 260, overflowY: 'auto' }}>
                  {cart.map(i => (
                    <div key={i._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,.05)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i.images?.[0]?.url ? <img src={i.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'rgba(212,175,55,.2)' }}>◆</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.78rem', color: '#fff', fontWeight: 600, marginBottom: 2 }}>{i.nameAr || i.name}</div>
                        <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)' }}>× {i.qty}</div>
                      </div>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '.85rem', flexShrink: 0 }}>{i.price * i.qty} ج</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.76rem', color: 'rgba(255,255,255,.3)' }}>
                    <span>الشحن</span>
                    <span style={{ color: shipping === 0 ? '#86EFAC' : 'rgba(255,255,255,.3)', fontWeight: shipping === 0 ? 700 : 400 }}>{shipping === 0 ? 'مجاني ✓' : `${shipping} ج`}</span>
                  </div>
                  {shipping > 0 && (
                    <div style={{ background: 'rgba(212,175,55,.05)', border: '1px solid rgba(212,175,55,.1)', padding: '7px 10px', marginBottom: 10, fontSize: '.65rem', color: '#D4AF37' }}>
                      أضف {500 - total} ج للشحن المجاني
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(212,175,55,.12)' }}>
                    <span style={{ fontWeight: 900, color: '#fff' }}>الإجمالي</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '1.1rem' }}>{final} ج</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
