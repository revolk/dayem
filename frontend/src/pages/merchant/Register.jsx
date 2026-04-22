import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function Register() {
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 768
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', storeName: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const passStrength = getPasswordStrength(form.password)

  const nextStep = e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('اكمل البيانات'); return }
    if (form.password.length < 6) { setError('كلمة المرور أقل من 6 أحرف'); return }
    setError('')
    setStep(2)
  }

  const submit = async e => {
    e.preventDefault()
    if (!agreed) { setError('لازم توافق على الشروط'); return }
    setLoading(true)
    setError('')
    const res = await merchantAPI.register(form)
    if (res.success) {
      localStorage.setItem('dayem_token', res.token)
      localStorage.setItem('dayem_merchant', JSON.stringify(res.merchant))
      nav('/dashboard')
    } else {
      setError(res.message || 'حدث خطأ')
    }
    setLoading(false)
  }

  const inputStyle = (val) => ({
    width: '100%', padding: '13px 16px',
    background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)',
    border: `1px solid ${val ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}`,
    fontFamily: 'Tajawal', fontSize: '.9rem', color: '#fff', outline: 'none',
    transition: 'all .2s', boxSizing: 'border-box'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <div style={{ position: 'absolute', fontSize: isMobile ? '80vw' : '45vw', color: 'rgba(212,175,55,.025)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,.06), transparent 70%)', pointerEvents: 'none' }} />

      {/* Desktop Left */}
      {!isMobile && (
        <div style={{ width: '42%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 5%', position: 'relative', zIndex: 2 }}>
          <div onClick={() => nav('/')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#D4AF37' }}>∞</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: 3 }}>دايم</div>
              <div style={{ fontSize: '.42rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase' }}>DAYEM ∞</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 1, background: '#D4AF37' }} />
            <span style={{ fontSize: '.58rem', letterSpacing: 5, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>ابدأ مجاناً</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            متجرك أونلاين<br />
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#D4AF37' }}>في ٥ دقايق</span>
          </h1>
          <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.9, fontWeight: 300, marginBottom: 44, maxWidth: 300 }}>
            انضم لآلاف التجار المصريين — بدون خبرة تقنية
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: '01', t: 'بياناتك الشخصية', d: 'الاسم والبريد وكلمة المرور', done: step > 1, active: step === 1 },
              { n: '02', t: 'بيانات متجرك', d: 'اسم المتجر وتخصصه', done: false, active: step === 2 },
              { n: '03', t: 'ابدأ البيع', d: 'رابطك جاهز فوراً', done: false, active: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: s.active ? 1 : s.done ? .8 : .4 }}>
                <div style={{ width: 32, height: 32, border: `1px solid ${s.done ? '#86EFAC' : s.active ? '#D4AF37' : 'rgba(212,175,55,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.done ? 'rgba(34,197,94,.1)' : 'transparent' }}>
                  {s.done ? <span style={{ color: '#86EFAC', fontSize: '.8rem' }}>✓</span> : <span style={{ fontSize: '.58rem', color: s.active ? '#D4AF37' : 'rgba(212,175,55,.4)', fontWeight: 800 }}>{s.n}</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: s.active ? '#fff' : 'rgba(255,255,255,.6)', fontSize: '.88rem', marginBottom: 3 }}>{s.t}</div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', fontWeight: 300 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px' : '60px 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 460 }}>

          {/* Mobile header */}
          {isMobile && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div onClick={() => nav('/')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#D4AF37' }}>∞</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: 2 }}>دايم</div>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>إنشاء متجر مجاناً</h1>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>خطوة {step} من 2</p>
              {/* Mobile steps */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ width: 32, height: 3, background: i <= step ? '#D4AF37' : 'rgba(255,255,255,.1)', borderRadius: 2, transition: 'background .3s' }} />
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,175,55,.12)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 22, height: 22, borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 22, height: 22, borderBottom: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }} />
            {/* Progress */}
            <div style={{ height: 2, background: 'rgba(255,255,255,.05)' }}>
              <div style={{ height: '100%', background: '#D4AF37', width: step === 1 ? '50%' : '100%', transition: 'width .5s ease' }} />
            </div>

            <div style={{ padding: isMobile ? '24px 20px' : '36px 36px 32px' }}>
              {!isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                  <div>
                    <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>خطوة {step} من 2</div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                      {step === 1 ? 'بياناتك الشخصية' : 'بيانات متجرك'}
                    </h2>
                  </div>
                  {step === 2 && (
                    <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'Tajawal' }}>→ رجوع</button>
                  )}
                </div>
              )}

              {isMobile && step === 2 && (
                <div style={{ marginBottom: 16 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.78rem', fontFamily: 'Tajawal', padding: 0 }}>→ رجوع للخطوة الأولى</button>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <button onClick={() => alert('قريباً')} style={{ width: '100%', padding: '12px', marginBottom: 16, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    متابعة بـ Google
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                    <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', letterSpacing: 2 }}>أو بالبريد</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                  </div>

                  <form onSubmit={nextStep}>
                    {[
                      { name: 'name', label: 'الاسم الكامل', placeholder: 'محمد أحمد' },
                      { name: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com', type: 'email' },
                    ].map(f => (
                      <div key={f.name} style={{ marginBottom: 13 }}>
                        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                        <input value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} required type={f.type || 'text'} placeholder={f.placeholder}
                          style={inputStyle(form[f.name])}
                          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                          onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                      </div>
                    ))}

                    <div style={{ marginBottom: 6 }}>
                      <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>كلمة المرور</label>
                      <div style={{ position: 'relative' }}>
                        <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required type={showPass ? 'text' : 'password'} placeholder="٦ أحرف على الأقل"
                          style={{ ...inputStyle(form.password), paddingLeft: 44 }}
                          onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                          onBlur={e => { e.target.style.borderColor = form.password ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.password ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.75rem', padding: 0 }}>
                          {showPass ? '◉' : '◎'}
                        </button>
                      </div>
                    </div>

                    {form.password && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, background: i <= passStrength.score ? passStrength.color : 'rgba(255,255,255,.08)', transition: 'background .3s' }} />
                          ))}
                        </div>
                        <div style={{ fontSize: '.62rem', color: passStrength.color, fontWeight: 600 }}>كلمة المرور {passStrength.label}</div>
                      </div>
                    )}

                    <button type="submit" style={{ width: '100%', padding: '13px', background: '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem', letterSpacing: .5 }}>
                      التالي ← بيانات متجرك
                    </button>
                  </form>
                </>
              )}

              {step === 2 && (
                <form onSubmit={submit}>
                  <div style={{ marginBottom: 13 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>اسم المتجر</label>
                    <input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} required placeholder="متجر محمد للأزياء"
                      style={inputStyle(form.storeName)}
                      onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                      onBlur={e => { e.target.style.borderColor = form.storeName ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.storeName ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                    {form.storeName && (
                      <div style={{ marginTop: 5, fontSize: '.62rem', color: 'rgba(212,175,55,.5)' }}>
                        رابطك: dayem.shop/{form.storeName.trim().replace(/\s+/g, '-')}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 13 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>رقم الواتساب</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="201xxxxxxxxx"
                      style={inputStyle(form.phone)}
                      onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                      onBlur={e => { e.target.style.borderColor = form.phone ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.phone ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>تخصص المتجر</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{ ...inputStyle(form.category), color: form.category ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر التخصص</option>
                      {['ملابس وأزياء', 'إلكترونيات', 'أغذية ومشروبات', 'مستلزمات منزلية', 'مستحضرات تجميل', 'رياضة ولياقة', 'كتب وتعليم', 'هدايا وتذكارات', 'أخرى'].map(c => (
                        <option key={c} value={c} style={{ background: '#0C2540' }}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
                    <div onClick={() => setAgreed(!agreed)}
                      style={{ width: 18, height: 18, border: `1.5px solid ${agreed ? '#D4AF37' : 'rgba(255,255,255,.2)'}`, background: agreed ? 'rgba(212,175,55,.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                      {agreed && <span style={{ color: '#D4AF37', fontSize: '.7rem' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
                      أوافق على <span style={{ color: '#D4AF37', textDecoration: 'underline' }}>شروط الاستخدام</span> و<span style={{ color: '#D4AF37', textDecoration: 'underline' }}>سياسة الخصوصية</span>
                    </span>
                  </div>

                  <button type="submit" disabled={loading || !agreed} style={{ width: '100%', padding: '14px', background: loading || !agreed ? 'rgba(212,175,55,.3)' : '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontSize: '.88rem', fontWeight: 900, cursor: loading || !agreed ? 'not-allowed' : 'pointer', letterSpacing: .5 }}>
                    {loading ? '⏳ جاري الإنشاء...' : 'إنشاء متجري مجاناً ✦'}
                  </button>
                </form>
              )}

              <p style={{ textAlign: 'center', marginTop: 18, fontSize: '.76rem', color: 'rgba(255,255,255,.25)' }}>
                عندك حساب؟{' '}
                <span onClick={() => nav('/login')} style={{ color: '#D4AF37', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>سجّل دخول</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
