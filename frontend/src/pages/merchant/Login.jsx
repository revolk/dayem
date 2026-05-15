import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantAPI } from '../../services/api'

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function Login() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 768
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await merchantAPI.login(form)
    if (res.success) {
      localStorage.setItem('dayem_token', res.token)
      localStorage.setItem('dayem_merchant', JSON.stringify(res.merchant))
      nav('/dashboard')
    } else {
      setError(res.message || 'بيانات غير صحيحة')
    }
    setLoading(false)
  }

  const inp = val => ({
    width: '100%', padding: '13px 16px',
    background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)',
    border: `1px solid ${val ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'}`,
    fontFamily: 'Tajawal', fontSize: '.9rem', color: '#fff', outline: 'none',
    transition: 'all .2s', boxSizing: 'border-box'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'Tajawal', direction: 'rtl' }}>
      {/* BG */}
      <div style={{ position: 'absolute', fontSize: mob ? '80vw' : '45vw', color: 'rgba(212,175,55,.025)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>∞</div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,.06), transparent 70%)', pointerEvents: 'none' }} />

      {/* Desktop branding */}
      {!mob && (
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
            <span style={{ fontSize: '.58rem', letterSpacing: 5, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>أهلاً بعودتك</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            متجرك<br />
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#D4AF37' }}>بينتظرك</span>
          </h1>
          <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.9, fontWeight: 300, marginBottom: 44, maxWidth: 300 }}>
            سجّل دخول وتابع مبيعاتك وطلباتك في لحظة
          </p>
          <div style={{ border: '1px solid rgba(212,175,55,.1)', padding: '22px', background: 'rgba(212,175,55,.03)' }}>
            {['داشبورد مبيعاتك Real-time', 'إدارة المنتجات بالذكاء الاصطناعي', 'تتبع الطلبات والتوصيل', 'رابط متجرك المخصص'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 3 ? 10 : 0, fontSize: '.78rem', color: 'rgba(255,255,255,.45)', fontWeight: 300 }}>
                <span style={{ color: '#D4AF37', fontSize: '.7rem' }}>◆</span>{t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: mob ? '30px 20px' : '60px 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: mob ? '100%' : 440 }}>

          {mob && (
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div onClick={() => nav('/')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#D4AF37' }}>∞</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: 2 }}>دايم</div>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>أهلاً بعودتك</h1>
              <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.35)' }}>سجّل دخول للداشبورد</p>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,175,55,.12)', padding: mob ? '28px 20px' : '40px 36px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 24, height: 24, borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 24, height: 24, borderBottom: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }} />
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.3), transparent)', position: 'absolute', top: 0, left: 0, right: 0 }} />

            {!mob && (
              <>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>تسجيل الدخول</h2>
                <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 28, fontWeight: 300 }}>أدخل بياناتك للوصول للداشبورد</p>
              </>
            )}

            {/* Google */}
            <button onClick={() => alert('قريباً')}
              style={{ width: '100%', padding: '12px', marginBottom: 18, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              متابعة بـ Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', letterSpacing: 2 }}>أو بالبريد</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '11px 14px', marginBottom: 16, fontSize: '.8rem', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>البريد الإلكتروني</label>
                <input name="email" type="email" placeholder="example@email.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inp(form.email)}
                  onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                  onBlur={e => { e.target.style.borderColor = form.email ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.email ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ ...inp(form.password), paddingLeft: 44 }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.06)' }}
                    onBlur={e => { e.target.style.borderColor = form.password ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.08)'; e.target.style.background = form.password ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.04)' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.75rem', padding: 0 }}>
                    {showPass ? '◉' : '◎'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <span style={{ fontSize: '.72rem', color: 'rgba(212,175,55,.5)', cursor: 'pointer' }}>نسيت كلمة المرور؟</span>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? 'rgba(212,175,55,.3)' : '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontSize: '.9rem', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1, transition: 'all .2s' }}>
                {loading ? '⏳ جاري الدخول...' : 'دخول للداشبورد ←'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.78rem', color: 'rgba(255,255,255,.25)' }}>
              مش عندك حساب؟{' '}
              <span onClick={() => nav('/register')} style={{ color: '#D4AF37', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                إنشاء متجرك ←
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
