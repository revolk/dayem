// frontend/src/pages/store/ForgotPassword.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

  .fp-root {
    min-height: 100vh;
    background: #060F1E;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Tajawal', sans-serif;
    direction: rtl; padding: 20px;
    position: relative; overflow: hidden;
  }
  .fp-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(212,175,55,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,175,55,.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .fp-glow {
    position: fixed; top: -20%; right: -10%;
    width: 55vw; height: 55vw; border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,.07), transparent 65%);
    pointer-events: none;
  }
  .fp-glow2 {
    position: fixed; bottom: -20%; left: -10%;
    width: 40vw; height: 40vw; border-radius: 50%;
    background: radial-gradient(circle, rgba(10,55,120,.25), transparent 65%);
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
  @keyframes successPop {
    0%   { transform: scale(.6); opacity: 0 }
    70%  { transform: scale(1.1) }
    100% { transform: scale(1); opacity: 1 }
  }
  .fp-card {
    width: 100%; max-width: 400px;
    position: relative; z-index: 1;
    animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both;
  }
  .fp-logo-box {
    position: relative; width: 68px; height: 68px; margin: 0 auto 18px;
  }
  .fp-logo-box::before {
    content: ''; position: absolute; top: -2px; right: -2px;
    width: 14px; height: 14px;
    border-top: 1.5px solid #D4AF37; border-right: 1.5px solid #D4AF37;
  }
  .fp-logo-box::after {
    content: ''; position: absolute; bottom: -2px; left: -2px;
    width: 14px; height: 14px;
    border-bottom: 1.5px solid #D4AF37; border-left: 1.5px solid #D4AF37;
  }
  .fp-logo-inner {
    width: 100%; height: 100%;
    border: 1px solid rgba(212,175,55,.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; color: #D4AF37;
    background: rgba(212,175,55,.03);
  }
  .fp-panel {
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.07);
    padding: 30px 26px;
    position: relative; overflow: hidden;
  }
  .fp-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    overflow: hidden;
  }
  .fp-top-line::after {
    content: ''; position: absolute; top: 0; left: 0;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
    animation: shimmerLine 2.5s ease-in-out infinite;
  }
  .fp-input {
    width: 100%; padding: 13px 46px 13px 16px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.1);
    font-family: 'Tajawal', sans-serif;
    font-size: .92rem; color: #fff;
    outline: none; box-sizing: border-box;
    transition: all .25s; direction: ltr;
  }
  .fp-input:focus {
    background: rgba(212,175,55,.05);
    border-color: rgba(212,175,55,.5);
    box-shadow: 0 0 0 3px rgba(212,175,55,.06);
  }
  .fp-input::placeholder { color: rgba(255,255,255,.2); }
  .fp-label {
    display: block; font-size: .58rem; font-weight: 700;
    color: rgba(255,255,255,.3); margin-bottom: 8px;
    letter-spacing: 2px; text-transform: uppercase; transition: color .2s;
  }
  .fp-label.focused { color: rgba(212,175,55,.8); }
  .fp-btn {
    width: 100%; padding: 14px; background: #D4AF37; border: none;
    color: #0C2540; font-family: 'Tajawal', sans-serif;
    font-weight: 900; font-size: .92rem; cursor: pointer;
    transition: all .25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn:hover:not(:disabled) {
    filter: brightness(1.08); transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212,175,55,.3);
  }
  .fp-btn:active:not(:disabled) { transform: translateY(0); }
  .fp-btn:disabled { background: rgba(212,175,55,.25); color: rgba(12,37,64,.5); cursor: not-allowed; }
  .fp-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(12,37,64,.3); border-top-color: #0C2540;
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  .fp-error {
    background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.2);
    border-right: 3px solid #F87171; color: #FCA5A5;
    padding: 10px 14px; margin-bottom: 18px;
    font-size: .8rem; line-height: 1.5; animation: fadeUp .3s ease;
  }
  .fp-success-icon {
    width: 70px; height: 70px; border-radius: 50%;
    background: rgba(74,222,128,.08);
    border: 1px solid rgba(74,222,128,.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin: 0 auto 20px;
    animation: successPop .5s cubic-bezier(.4,0,.2,1) both;
  }
  .fp-back-btn {
    background: none; border: none; color: rgba(255,255,255,.25);
    font-family: 'Tajawal', sans-serif; font-size: .78rem;
    cursor: pointer; transition: color .2s; padding: 4px 8px;
  }
  .fp-back-btn:hover { color: rgba(255,255,255,.6); }
`

function injectCSS() {
  if (document.getElementById('fp-styles')) return
  const el = document.createElement('style')
  el.id = 'fp-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}

export default function ForgotPassword() {
  const nav = useNavigate()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => { injectCSS() }, [])

  const submit = async e => {
    e.preventDefault()
    if (!email.includes('@')) return setError('البريد الإلكتروني غير صحيح')
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/merchant/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      }).then(r => r.json())

      if (res.success) {
        setSent(true)
      } else {
        setError(res.message || 'حدث خطأ، حاول تاني')
      }
    } catch {
      setError('مفيش اتصال بالسيرفر')
    }
    setLoading(false)
  }

  return (
    <div className="fp-root">
      <div className="fp-glow" />
      <div className="fp-glow2" />

      <div className="fp-card">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="fp-logo-box">
            <div className="fp-logo-inner">∞</div>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.55rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
            دايم ∞
          </h1>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)', letterSpacing: 1 }}>
            {sent ? 'تم الإرسال' : 'استعادة كلمة المرور'}
          </p>
        </div>

        {/* Panel */}
        <div className="fp-panel">
          <div className="fp-top-line" />

          {sent ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
              <div className="fp-success-icon">✉️</div>
              <h3 style={{ fontWeight: 900, color: '#fff', fontSize: '1.05rem', marginBottom: 10 }}>
                تم الإرسال!
              </h3>
              <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginBottom: 24 }}>
                لو البريد <span style={{ color: 'rgba(212,175,55,.7)', fontWeight: 700 }}>{email}</span> مسجل عندنا،
                هيوصلك إيميل فيه رابط تغيير كلمة المرور.<br />
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)' }}>
                  الرابط صالح لمدة 30 دقيقة فقط
                </span>
              </p>

              {/* Steps hint */}
              <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)', padding: '14px 16px', marginBottom: 24, textAlign: 'right' }}>
                <div style={{ fontSize: '.68rem', color: 'rgba(212,175,55,.6)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>الخطوات</div>
                {[
                  'افتح الإيميل اللي وصلك',
                  'اضغط على رابط "تغيير كلمة المرور"',
                  'اكتب كلمة المرور الجديدة',
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: '#D4AF37', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>{s}</span>
                  </div>
                ))}
              </div>

              <button className="fp-btn" onClick={() => nav('/merchant/login')}>
                العودة لتسجيل الدخول
              </button>

              <button
                style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,.4)', fontFamily: 'Tajawal', fontSize: '.75rem', cursor: 'pointer', marginTop: 14, transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,.4)'}
                onClick={() => { setSent(false); setEmail('') }}>
                إعادة الإرسال
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              {error && <div className="fp-error">⚠️ {error}</div>}

              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.6, marginBottom: 22 }}>
                  اكتب البريد الإلكتروني المسجل في حسابك وهنبعتلك رابط تغيير كلمة المرور.
                </p>
              </div>

              <form onSubmit={submit}>
                <div style={{ marginBottom: 22 }}>
                  <label className={`fp-label${focused ? ' focused' : ''}`}>
                    البريد الإلكتروني
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focused ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.2)',
                      fontSize: '.85rem', pointerEvents: 'none', transition: 'color .2s'
                    }}>✉</span>
                    <input
                      className="fp-input"
                      type="email"
                      value={email}
                      placeholder="example@email.com"
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      required
                      autoFocus
                      style={{ paddingRight: 44 }}
                    />
                  </div>
                </div>

                <button type="submit" className="fp-btn" disabled={loading || !email.includes('@')}>
                  {loading
                    ? <><div className="fp-spinner" /> جاري الإرسال...</>
                    : <><span>إرسال رابط الاستعادة</span><span style={{ opacity: .6 }}>←</span></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="fp-back-btn" onClick={() => nav(-1)}>
            ← رجوع لتسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  )
}
