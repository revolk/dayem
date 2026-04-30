import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { merchantAPI } from '../../services/api'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' }
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  if (pass.length >= 12) score++
  if (score <= 1) return { score, label: 'ضعيفة', color: '#EF4444' }
  if (score <= 2) return { score, label: 'متوسطة', color: '#F59E0B' }
  if (score <= 3) return { score, label: 'جيدة', color: '#3B82F6' }
  return { score, label: 'قوية', color: '#10B981' }
}

const PLANS = [
  { id: 'starter', name: 'ستارتر', price: 100, color: '#60A5FA', bg: 'rgba(59,130,246,.06)', border: 'rgba(59,130,246,.2)', features: ['5 منتجات فقط', 'متجر كامل', 'رابط مخصص', 'كل طرق الدفع'], limit: '5 منتجات' },
  { id: 'merchant', name: 'تاجر', price: 199, color: '#D4AF37', bg: 'rgba(212,175,55,.06)', border: 'rgba(212,175,55,.25)', hot: true, features: ['20 منتج', 'تقارير مبيعات', 'كوبونات وخصومات', 'دعم أولوية'], limit: '20 منتج' },
  { id: 'pro', name: 'برو', price: 349, color: '#A78BFA', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)', features: ['منتجات غير محدودة', 'متاجر متعددة', 'API Integration', 'مدير حساب مخصص'], limit: 'غير محدود' }
]

export default function Register() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const w = useWindowWidth()
  const isMobile = w < 768
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'merchant')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', storeName: '', category: '', governorate: '' })
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const passStrength = getPasswordStrength(form.password)
  const plan = PLANS.find(p => p.id === selectedPlan)
  const STEPS = ['الخطة', 'بياناتك', 'متجرك', 'الدفع']

  const inputStyle = (val) => ({ width: '100%', padding: '13px 16px', background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)', border: `1px solid ${val ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}`, fontFamily: 'Tajawal', fontSize: '.9rem', color: '#fff', outline: 'none', transition: 'all .2s', boxSizing: 'border-box' })

  const goNext = e => { e.preventDefault(); setError(''); if (step === 2) { if (!form.name || !form.email || !form.password) { setError('اكمل البيانات'); return } if (form.password.length < 6) { setError('كلمة المرور أقل من 6 أحرف'); return } } setStep(step + 1) }

  const submit = async e => {
    e.preventDefault()
    if (!agreed) { setError('لازم توافق على الشروط'); return }
    setLoading(true); setError('')
    const res = await merchantAPI.register({ ...form, plan: selectedPlan })
    if (res.success) { localStorage.setItem('dayem_token', res.token); localStorage.setItem('dayem_merchant', JSON.stringify(res.merchant)); setStep(4) }
    else setError(res.message || 'حدث خطأ')
    setLoading(false)
  }

  const initiatePayment = async () => {
    setPaymentLoading(true)
    try {
      const BASE = `http://${window.location.hostname}:5000/api`
      const res = await fetch(`${BASE}/payment/initiate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dayem_token')}` }, body: JSON.stringify({ planId: selectedPlan }) }).then(r => r.json())
      if (res.success) window.location.href = res.paymentUrl
      else setError(res.message || 'خطأ في الدفع')
    } catch { setError('خطأ في الاتصال') }
    setPaymentLoading(false)
  }

  const activateTest = async () => {
    setPaymentLoading(true)
    try {
      const BASE = `http://${window.location.hostname}:5000/api`
      const res = await fetch(`${BASE}/payment/activate-test`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dayem_token')}` }, body: JSON.stringify({ planId: selectedPlan }) }).then(r => r.json())
      if (res.success) nav('/dashboard')
    } catch { setError('خطأ') }
    setPaymentLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', fontSize: isMobile ? '80vw' : '45vw', color: 'rgba(212,175,55,.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>

      {/* Header */}
      <div style={{ padding: isMobile ? '14px 16px' : '18px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,.08)', position: 'relative', zIndex: 2 }}>
        <div onClick={() => nav('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>∞</div>
          <div style={{ fontWeight: 900, color: '#fff', letterSpacing: 2 }}>دايم</div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: i + 1 < step ? '#D4AF37' : i + 1 === step ? 'rgba(212,175,55,.12)' : 'rgba(255,255,255,.05)', border: i + 1 === step ? '1.5px solid #D4AF37' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', fontWeight: 700, color: i + 1 < step ? '#0C2540' : i + 1 === step ? '#D4AF37' : 'rgba(255,255,255,.2)', transition: 'all .3s' }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                {!isMobile && <span style={{ fontSize: '.6rem', color: i + 1 === step ? '#D4AF37' : 'rgba(255,255,255,.2)', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: isMobile ? 10 : 18, height: 1, background: i + 1 < step ? '#D4AF37' : 'rgba(255,255,255,.08)', transition: 'background .3s' }} />}
            </div>
          ))}
        </div>

        <span onClick={() => nav('/login')} style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>دخول</span>
      </div>

      <div style={{ maxWidth: step === 1 ? 880 : 480, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 20px', position: 'relative', zIndex: 2 }}>

        {/* STEP 1 — Plan */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 24, height: 1, background: '#D4AF37' }} />
                <span style={{ fontSize: '.55rem', letterSpacing: 5, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>ابدأ مجاناً</span>
                <div style={{ width: 24, height: 1, background: '#D4AF37' }} />
              </div>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.9rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>اختار الخطة المناسبة</h1>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.8rem' }}>كل الخطط تشمل متجر كامل — اختار حسب حجم مشروعك</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                  style={{ background: selectedPlan === p.id ? p.bg : 'rgba(255,255,255,.02)', border: `1.5px solid ${selectedPlan === p.id ? p.border : 'rgba(255,255,255,.07)'}`, padding: '22px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all .25s' }}>
                  {p.hot && <div style={{ position: 'absolute', top: 0, right: '50%', transform: 'translateX(50%)', background: '#D4AF37', color: '#0C2540', fontSize: '.52rem', fontWeight: 800, padding: '3px 14px', letterSpacing: 2 }}>الأشهر ✦</div>}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: selectedPlan === p.id ? `linear-gradient(90deg,transparent,${p.color},transparent)` : 'transparent', transition: 'all .3s' }} />
                  <div style={{ position: 'absolute', top: 10, left: 12, width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${selectedPlan === p.id ? p.color : 'rgba(255,255,255,.2)'}`, background: selectedPlan === p.id ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedPlan === p.id && <span style={{ fontSize: '.5rem', color: '#0C2540', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ marginTop: p.hot ? 16 : 0 }}>
                    <div style={{ fontSize: '.55rem', letterSpacing: 3, color: p.color, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{p.price}</span>
                      <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>ج/شهر</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 14 }} />
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: '.76rem', color: 'rgba(255,255,255,.45)' }}>
                        <span style={{ color: p.color, fontSize: '.6rem' }}>◆</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setStep(2)} style={{ background: '#D4AF37', color: '#0C2540', border: 'none', padding: '13px 44px', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem', letterSpacing: 1 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0D060'}
                onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}>
                التالي ← خطة {plan?.name} بـ {plan?.price} ج/شهر
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 & 3 */}
        {(step === 2 || step === 3) && (
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,175,55,.12)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottom: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }} />
            <div style={{ height: 2, background: 'rgba(255,255,255,.05)' }}>
              <div style={{ height: '100%', background: '#D4AF37', width: step === 2 ? '50%' : '100%', transition: 'width .5s ease' }} />
            </div>
            <div style={{ padding: isMobile ? '20px 18px' : '30px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>خطة {plan?.name} · {plan?.price} ج/شهر</div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>{step === 2 ? 'بياناتك الشخصية' : 'بيانات متجرك'}</h2>
                </div>
                <button onClick={() => setStep(step - 1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'Tajawal' }}>→ رجوع</button>
              </div>

              {error && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 14, fontSize: '.8rem', fontWeight: 600 }}>⚠️ {error}</div>}

              {step === 2 && (
                <form onSubmit={goNext}>
                  {[{ name: 'name', label: 'الاسم الكامل', placeholder: 'محمد أحمد' }, { name: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com', type: 'email' }].map(f => (
                    <div key={f.name} style={{ marginBottom: 13 }}>
                      <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                      <input value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} required type={f.type || 'text'} placeholder={f.placeholder} style={inputStyle(form[f.name])} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }} onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 6 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>كلمة المرور</label>
                    <div style={{ position: 'relative' }}>
                      <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required type={showPass ? 'text' : 'password'} placeholder="٦ أحرف على الأقل" style={{ ...inputStyle(form.password), paddingLeft: 44 }} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }} onBlur={e => { e.target.style.borderColor = form.password ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.password ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.75rem', padding: 0 }}>{showPass ? '◉' : '◎'}</button>
                    </div>
                  </div>
                  {form.password && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, background: i <= passStrength.score ? passStrength.color : 'rgba(255,255,255,.08)', transition: 'background .3s' }} />)}
                      </div>
                      <div style={{ fontSize: '.62rem', color: passStrength.color, fontWeight: 600 }}>كلمة المرور {passStrength.label}</div>
                    </div>
                  )}
                  <button type="submit" style={{ width: '100%', padding: '13px', background: '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem' }}>التالي ← بيانات المتجر</button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={submit}>
                  <div style={{ marginBottom: 13 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>اسم المتجر</label>
                    <input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} required placeholder="متجر محمد للأزياء" style={inputStyle(form.storeName)} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }} onBlur={e => { e.target.style.borderColor = form.storeName ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.storeName ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                    {form.storeName && <div style={{ marginTop: 5, fontSize: '.62rem', color: 'rgba(212,175,55,.5)' }}>رابطك: dayem.shop/{form.storeName.trim().replace(/\s+/g, '-')}</div>}
                  </div>
                  <div style={{ marginBottom: 13 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>رقم الواتساب</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="201xxxxxxxxx" style={inputStyle(form.phone)} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }} onBlur={e => { e.target.style.borderColor = form.phone ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.phone ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                  </div>
                  <div style={{ marginBottom: 13 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>المحافظة</label>
                    <select value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} required style={{ ...inputStyle(form.governorate), color: form.governorate ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر المحافظة</option>
                      {['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية'].map(g => <option key={g} value={g} style={{ background: '#0C2540' }}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>تخصص المتجر</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle(form.category), color: form.category ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر التخصص</option>
                      {['ملابس وأزياء', 'إلكترونيات', 'أغذية ومشروبات', 'مستلزمات منزلية', 'مستحضرات تجميل', 'رياضة ولياقة', 'كتب وتعليم', 'هدايا وتذكارات', 'أخرى'].map(c => <option key={c} value={c} style={{ background: '#0C2540' }}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
                    <div onClick={() => setAgreed(!agreed)} style={{ width: 18, height: 18, border: `1.5px solid ${agreed ? '#D4AF37' : 'rgba(255,255,255,.2)'}`, background: agreed ? 'rgba(212,175,55,.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                      {agreed && <span style={{ color: '#D4AF37', fontSize: '.7rem' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>أوافق على <span style={{ color: '#D4AF37', textDecoration: 'underline' }}>شروط الاستخدام</span> و<span style={{ color: '#D4AF37', textDecoration: 'underline' }}>سياسة الخصوصية</span></span>
                  </div>
                  <button type="submit" disabled={loading || !agreed} style={{ width: '100%', padding: '14px', background: loading || !agreed ? 'rgba(212,175,55,.3)' : '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontSize: '.88rem', fontWeight: 900, cursor: loading || !agreed ? 'not-allowed' : 'pointer' }}>
                    {loading ? '⏳ جاري الإنشاء...' : 'التالي ← الدفع'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 — Payment */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', border: '1px solid rgba(212,175,55,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#D4AF37', background: 'rgba(212,175,55,.05)' }}>◆</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>خطوة أخيرة!</h2>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.82rem', marginBottom: 28, lineHeight: 1.8 }}>تم إنشاء حسابك ✓<br />ادفع دلوقتي عشان تفعّل متجرك</p>

            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.12)', padding: '18px 20px', marginBottom: 20, position: 'relative', textAlign: 'right' }}>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />
              <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>ملخص الاشتراك</div>
              {[['الخطة', plan?.name], ['المنتجات', plan?.limit], ['المبلغ', `${plan?.price} ج / شهر`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: '.82rem' }}>
                  <span style={{ color: 'rgba(255,255,255,.3)' }}>{l}</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(212,175,55,.1)', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 900, color: '#fff' }}>الإجمالي</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', fontWeight: 700, color: '#D4AF37' }}>{plan?.price} ج</span>
              </div>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 14, fontSize: '.8rem', fontWeight: 600 }}>⚠️ {error}</div>}

            <button onClick={initiatePayment} disabled={paymentLoading} style={{ width: '100%', padding: '14px', background: paymentLoading ? 'rgba(212,175,55,.3)' : '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontWeight: 900, cursor: paymentLoading ? 'not-allowed' : 'pointer', fontSize: '.9rem', letterSpacing: 1, marginBottom: 10 }}>
              {paymentLoading ? '⏳ جاري التوجيه...' : `ادفع ${plan?.price} ج ←`}
            </button>

            <button onClick={activateTest} disabled={paymentLoading} style={{ width: '100%', padding: '10px', background: 'transparent', color: 'rgba(255,255,255,.25)', border: '1px solid rgba(255,255,255,.07)', fontFamily: 'Tajawal', fontWeight: 600, cursor: 'pointer', fontSize: '.75rem' }}>
              تخطي (وضع التجربة فقط)
            </button>

            <p style={{ marginTop: 12, fontSize: '.65rem', color: 'rgba(255,255,255,.15)', lineHeight: 1.6 }}>الدفع آمن عبر Paymob · فيزا / ماستركارد / فودافون كاش / انستاباي</p>
          </div>
        )}
      </div>
    </div>
  )
}
