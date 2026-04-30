// frontend/src/pages/store/CustomerLogin.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`

const G = '#D4AF37'
const inp = (focused) => ({
  width: '100%', padding: '13px 16px',
  background: focused ? 'rgba(212,175,55,.05)' : 'rgba(255,255,255,.04)',
  border: `1px solid ${focused ? G : 'rgba(255,255,255,.1)'}`,
  fontFamily: 'Tajawal', fontSize: '.92rem', color: '#fff',
  outline: 'none', boxSizing: 'border-box', transition: 'all .2s',
  direction: 'ltr'
})

export default function CustomerLogin() {
  const nav = useNavigate()
  const loc = useLocation()
  const redirect = loc.state?.redirect || '/customer/dashboard'

  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [name, setName]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const doLogin = async (phoneVal, nameVal) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneVal, name: nameVal || undefined })
      }).then(r => r.json())

      if (res.newUser) {
        setStep('name')
      } else if (res.success) {
        localStorage.setItem('dayem_customer_token', res.token)
        localStorage.setItem('dayem_customer', JSON.stringify(res.customer))
        nav(redirect)
      } else {
        setError(res.message || 'حدث خطأ')
      }
    } catch { setError('خطأ في الاتصال') }
    setLoading(false)
  }

  const submit = async e => {
    e.preventDefault()
    if (step === 'phone') await doLogin(phone, null)
    else await doLogin(phone, name)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060F1E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Tajawal', direction: 'rtl', padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,175,55,.07),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(212,175,55,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.02) 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 16px' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 13, height: 13, borderTop: `1.5px solid ${G}`, borderRight: `1.5px solid ${G}` }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 13, height: 13, borderBottom: `1.5px solid ${G}`, borderLeft: `1.5px solid ${G}` }} />
            <div style={{ width: '100%', height: '100%', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: G }}>∞</div>
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>دايم ∞</h2>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>سجل دخولك لمتابعة طلباتك</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />

          {error && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRight: '3px solid #FF4D6D', color: '#FCA5A5', padding: '10px 14px', marginBottom: 18, fontSize: '.8rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit}>
            {step === 'phone' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '.58rem', fontWeight: 700, color: focused === 'phone' ? 'rgba(212,175,55,.8)' : 'rgba(255,255,255,.3)', marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase', transition: 'color .2s' }}>
                  رقم الموبايل
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '.85rem', color: 'rgba(255,255,255,.3)' }}>📱</div>
                  <input
                    type="tel" value={phone} placeholder="01xxxxxxxxx"
                    onChange={e => setPhone(e.target.value)} required
                    style={{ ...inp(focused === 'phone'), paddingRight: 44 }}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  />
                </div>
                <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.2)', marginTop: 8 }}>
                  رقمك هو هويتك — مفيش password محتاج تتذكره
                </p>
              </div>
            )}

            {step === 'name' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>👋</div>
                  <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.6)' }}>
                    أهلاً بيك! إيه اسمك؟
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '.58rem', fontWeight: 700, color: focused === 'name' ? 'rgba(212,175,55,.8)' : 'rgba(255,255,255,.3)', marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase', transition: 'color .2s' }}>
                    الاسم
                  </label>
                  <input
                    type="text" value={name} placeholder="اسمك الكامل"
                    onChange={e => setName(e.target.value)} required
                    style={{ ...inp(focused === 'name'), direction: 'rtl' }}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    autoFocus
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || (step === 'phone' && !phone) || (step === 'name' && !name)}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(212,175,55,.3)' : G,
                border: 'none', color: '#0C2540',
                fontFamily: 'Tajawal', fontWeight: 900, fontSize: '.92rem',
                cursor: loading || !phone ? 'not-allowed' : 'pointer',
                transition: 'all .25s',
                opacity: (!phone && step === 'phone') || (!name && step === 'name') ? .5 : 1
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
              {loading ? '⏳ جاري...' : step === 'phone' ? 'متابعة ←' : 'ابدأ التسوق ←'}
            </button>
          </form>

          {/* Track order link */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <a href="/track" style={{ fontSize: '.75rem', color: 'rgba(212,175,55,.6)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = G}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,.6)'}>
              🔍 تتبع طلبك بدون تسجيل دخول
            </a>
          </div>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal', fontSize: '.78rem', cursor: 'pointer' }}>
            ← رجوع
          </button>
        </div>
      </div>
    </div>
  )
}
