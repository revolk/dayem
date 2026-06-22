// frontend/src/pages/store/CustomerLogin.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

  .cl-root {
    min-height: 100vh;
    background: #060F1E;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  /* grid pattern */
  .cl-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(212,175,55,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,175,55,.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* ambient glow */
  .cl-glow {
    position: fixed; top: -20%; right: -10%;
    width: 55vw; height: 55vw; border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,.08), transparent 65%);
    pointer-events: none;
  }
  .cl-glow2 {
    position: fixed; bottom: -20%; left: -10%;
    width: 40vw; height: 40vw; border-radius: 50%;
    background: radial-gradient(circle, rgba(10,55,120,.3), transparent 65%);
    pointer-events: none;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes shimmerLine {
    0%   { transform: translateX(-100%) }
    100% { transform: translateX(100%) }
  }
  @keyframes spin {
    to { transform: rotate(360deg) }
  }
  @keyframes pulse {
    0%,100% { opacity: .4 }
    50%      { opacity: 1 }
  }

  .cl-card {
    width: 100%; max-width: 400px;
    position: relative; z-index: 1;
    animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both;
  }

  /* Logo box */
  .cl-logo-box {
    position: relative;
    width: 68px; height: 68px;
    margin: 0 auto 18px;
  }
  .cl-logo-box::before,
  .cl-logo-box::after {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
  }
  .cl-logo-box::before {
    top: -2px; right: -2px;
    border-top: 1.5px solid #D4AF37;
    border-right: 1.5px solid #D4AF37;
  }
  .cl-logo-box::after {
    bottom: -2px; left: -2px;
    border-bottom: 1.5px solid #D4AF37;
    border-left: 1.5px solid #D4AF37;
  }
  .cl-logo-inner {
    width: 100%; height: 100%;
    border: 1px solid rgba(212,175,55,.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; color: #D4AF37;
    background: rgba(212,175,55,.03);
    transition: background .3s;
  }
  .cl-logo-inner:hover { background: rgba(212,175,55,.07); }

  /* Panel */
  .cl-panel {
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.07);
    padding: 30px 26px;
    position: relative; overflow: hidden;
  }
  .cl-panel-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    overflow: hidden;
  }
  .cl-panel-top-line::after {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
    animation: shimmerLine 2.5s ease-in-out infinite;
  }

  /* Input */
  .cl-input {
    width: 100%; padding: 13px 46px 13px 16px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.1);
    font-family: 'Tajawal', sans-serif;
    font-size: .92rem; color: #fff;
    outline: none; box-sizing: border-box;
    transition: all .25s;
    direction: ltr;
  }
  .cl-input:focus {
    background: rgba(212,175,55,.05);
    border-color: rgba(212,175,55,.5);
    box-shadow: 0 0 0 3px rgba(212,175,55,.06);
  }
  .cl-input::placeholder { color: rgba(255,255,255,.2); }
  .cl-input.rtl-input { direction: rtl; }

  .cl-label {
    display: block;
    font-size: .58rem; font-weight: 700;
    color: rgba(255,255,255,.3);
    margin-bottom: 8px;
    letter-spacing: 2px; text-transform: uppercase;
    transition: color .2s;
  }
  .cl-label.focused { color: rgba(212,175,55,.8); }

  /* Submit btn */
  .cl-btn {
    width: 100%; padding: 14px;
    background: #D4AF37; border: none;
    color: #0C2540;
    font-family: 'Tajawal', sans-serif;
    font-weight: 900; font-size: .92rem;
    cursor: pointer; transition: all .25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cl-btn:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212,175,55,.3);
  }
  .cl-btn:active:not(:disabled) { transform: translateY(0); }
  .cl-btn:disabled {
    background: rgba(212,175,55,.25);
    color: rgba(12,37,64,.5);
    cursor: not-allowed;
  }

  /* Spinner */
  .cl-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(12,37,64,.3);
    border-top-color: #0C2540;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /* Error */
  .cl-error {
    background: rgba(239,68,68,.07);
    border: 1px solid rgba(239,68,68,.2);
    border-right: 3px solid #F87171;
    color: #FCA5A5;
    padding: 10px 14px; margin-bottom: 18px;
    font-size: .8rem; line-height: 1.5;
    animation: fadeUp .3s ease;
  }

  /* Step indicator */
  .cl-steps {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; margin-bottom: 24px;
  }
  .cl-step-dot {
    width: 6px; height: 6px; border-radius: 50%;
    transition: all .3s;
  }
  .cl-step-dot.active {
    background: #D4AF37; width: 20px; border-radius: 3px;
  }
  .cl-step-dot.done { background: rgba(212,175,55,.5); }
  .cl-step-dot.pending { background: rgba(255,255,255,.1); }

  /* Welcome avatar */
  .cl-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(212,175,55,.15), rgba(212,175,55,.05));
    border: 1px solid rgba(212,175,55,.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; margin: 0 auto 12px;
    animation: fadeUp .4s ease;
  }

  .cl-link {
    color: rgba(212,175,55,.55);
    text-decoration: none;
    transition: color .2s;
    font-size: .75rem;
  }
  .cl-link:hover { color: #D4AF37; }

  .cl-back-btn {
    background: none; border: none;
    color: rgba(255,255,255,.25);
    font-family: 'Tajawal', sans-serif;
    font-size: .78rem; cursor: pointer;
    transition: color .2s; padding: 4px 8px;
  }
  .cl-back-btn:hover { color: rgba(255,255,255,.6); }
`

function injectCSS() {
  if (document.getElementById('cl-styles')) return
  const el = document.createElement('style')
  el.id = 'cl-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}

export default function CustomerLogin() {
  const nav = useNavigate()
  const loc = useLocation()
  const redirect = loc.state?.redirect || '/customer/dashboard'

  const [step, setStep]       = useState('phone')   // 'phone' | 'name'
  const [phone, setPhone]     = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState('')

  useEffect(() => { injectCSS() }, [])

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('dayem_customer_token')
    if (token) nav(redirect, { replace: true })
  }, [])

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
        nav(redirect, { replace: true })
      } else {
        setError(res.message || 'حدث خطأ، حاول تاني')
      }
    } catch {
      setError('مفيش اتصال بالسيرفر، تأكد من الإنترنت')
    }
    setLoading(false)
  }

  const submit = async e => {
    e.preventDefault()
    if (step === 'phone') {
      if (phone.length < 10) return setError('رقم الموبايل غير صحيح')
      await doLogin(phone, null)
    } else {
      if (!name.trim()) return setError('اكتب اسمك الأول على الأقل')
      await doLogin(phone, name.trim())
    }
  }

  const isPhoneValid = phone.length >= 10
  const isNameValid  = name.trim().length >= 2
  const canSubmit    = !loading && (step === 'phone' ? isPhoneValid : isNameValid)

  return (
    <div className="cl-root">
      <div className="cl-glow" />
      <div className="cl-glow2" />

      <div className="cl-card">

        {/* ── Logo / Brand ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="cl-logo-box">
            <div className="cl-logo-inner">∞</div>
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.55rem', fontWeight: 900,
            color: '#fff', marginBottom: 6, letterSpacing: 1
          }}>دايم ∞</h1>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)', letterSpacing: 1 }}>
            {step === 'phone' ? 'سجل دخولك لمتابعة طلباتك' : 'إنشاء حساب جديد'}
          </p>
        </div>

        {/* ── Step dots ── */}
        <div className="cl-steps">
          <div className={`cl-step-dot ${step === 'phone' ? 'active' : 'done'}`} />
          <div className={`cl-step-dot ${step === 'name' ? 'active' : 'pending'}`} />
        </div>

        {/* ── Panel ── */}
        <div className="cl-panel">
          <div className="cl-panel-top-line" />

          {/* Error */}
          {error && (
            <div className="cl-error">⚠️ {error}</div>
          )}

          <form onSubmit={submit}>

            {/* ── Step 1: Phone ── */}
            {step === 'phone' && (
              <div style={{ marginBottom: 22 }}>
                <label className={`cl-label${focused === 'phone' ? ' focused' : ''}`}>
                  رقم الموبايل
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    color: focused === 'phone' ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.2)',
                    fontSize: '.85rem', pointerEvents: 'none', transition: 'color .2s'
                  }}>📱</span>
                  <input
                    className="cl-input"
                    type="tel"
                    value={phone}
                    placeholder="01xxxxxxxxx"
                    onChange={e => { setPhone(e.target.value); setError('') }}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused('')}
                    required
                    autoFocus
                    maxLength={11}
                    style={{ paddingRight: 44 }}
                  />
                </div>
                <p style={{ fontSize: '.67rem', color: 'rgba(255,255,255,.2)', marginTop: 8 }}>
                  رقمك هو هويتك — مفيش باسورد محتاج تتذكره ✦
                </p>
              </div>
            )}

            {/* ── Step 2: Name (new user) ── */}
            {step === 'name' && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div className="cl-avatar">👋</div>
                  <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
                    أهلاً بيك! دي أول مرة بتتسوق معانا<br />
                    <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>إيه اسمك؟</span>
                  </p>
                </div>

                <label className={`cl-label${focused === 'name' ? ' focused' : ''}`}>
                  الاسم
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    color: focused === 'name' ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.2)',
                    fontSize: '.85rem', pointerEvents: 'none', transition: 'color .2s'
                  }}>✦</span>
                  <input
                    className="cl-input rtl-input"
                    type="text"
                    value={name}
                    placeholder="اسمك الكامل"
                    onChange={e => { setName(e.target.value); setError('') }}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    required
                    autoFocus
                    style={{ paddingRight: 44 }}
                  />
                </div>

                {/* back to phone */}
                <button type="button" className="cl-back-btn"
                  style={{ marginTop: 10, fontSize: '.7rem' }}
                  onClick={() => { setStep('phone'); setError('') }}>
                  ← تغيير الرقم ({phone})
                </button>
              </div>
            )}

            {/* ── Submit ── */}
            <button type="submit" className="cl-btn" disabled={!canSubmit}>
              {loading
                ? <><div className="cl-spinner" /> جاري...</>
                : step === 'phone'
                  ? <><span>متابعة</span><span style={{ opacity: .6 }}>←</span></>
                  : <><span>ابدأ التسوق</span><span style={{ opacity: .6 }}>←</span></>
              }
            </button>
          </form>

          {/* ── Track order ── */}
          <div style={{
            textAlign: 'center', marginTop: 20, paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,.05)'
          }}>
            <a href="/track" className="cl-link">
              🔍 تتبع طلبك بدون تسجيل دخول
            </a>
          </div>
        </div>

        {/* ── Back button ── */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="cl-back-btn" onClick={() => nav(-1)}>
            ← رجوع
          </button>
        </div>

      </div>
    </div>
  )
}
