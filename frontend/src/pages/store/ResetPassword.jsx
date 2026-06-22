// frontend/src/pages/store/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

  .rp-root {
    min-height: 100vh; background: #060F1E;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Tajawal', sans-serif; direction: rtl;
    padding: 20px; position: relative; overflow: hidden;
  }
  .rp-root::before {
    content: ''; position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(212,175,55,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,175,55,.025) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none;
  }
  .rp-glow  { position: fixed; top: -20%; right: -10%; width: 55vw; height: 55vw; border-radius: 50%; background: radial-gradient(circle, rgba(212,175,55,.07), transparent 65%); pointer-events: none; }
  .rp-glow2 { position: fixed; bottom: -20%; left: -10%; width: 40vw; height: 40vw; border-radius: 50%; background: radial-gradient(circle, rgba(10,55,120,.25), transparent 65%); pointer-events: none; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
  @keyframes shimmerLine { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes successPop { 0% { transform:scale(.6); opacity:0 } 70% { transform:scale(1.1) } 100% { transform:scale(1); opacity:1 } }

  .rp-card  { width:100%; max-width:400px; position:relative; z-index:1; animation:fadeUp .5s cubic-bezier(.4,0,.2,1) both; }

  .rp-logo-box { position:relative; width:68px; height:68px; margin:0 auto 18px; }
  .rp-logo-box::before { content:''; position:absolute; top:-2px; right:-2px; width:14px; height:14px; border-top:1.5px solid #D4AF37; border-right:1.5px solid #D4AF37; }
  .rp-logo-box::after  { content:''; position:absolute; bottom:-2px; left:-2px; width:14px; height:14px; border-bottom:1.5px solid #D4AF37; border-left:1.5px solid #D4AF37; }
  .rp-logo-inner { width:100%; height:100%; border:1px solid rgba(212,175,55,.2); display:flex; align-items:center; justify-content:center; font-size:2.2rem; color:#D4AF37; background:rgba(212,175,55,.03); }

  .rp-panel { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); padding:30px 26px; position:relative; overflow:hidden; }
  .rp-top-line { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#D4AF37,transparent); overflow:hidden; }
  .rp-top-line::after { content:''; position:absolute; top:0; left:0; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent); animation:shimmerLine 2.5s ease-in-out infinite; }

  .rp-input {
    width:100%; padding:13px 46px 13px 46px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.1);
    font-family:'Tajawal',sans-serif; font-size:.92rem; color:#fff;
    outline:none; box-sizing:border-box; transition:all .25s; direction:ltr;
  }
  .rp-input:focus { background:rgba(212,175,55,.05); border-color:rgba(212,175,55,.5); box-shadow:0 0 0 3px rgba(212,175,55,.06); }
  .rp-input::placeholder { color:rgba(255,255,255,.2); }

  .rp-label { display:block; font-size:.58rem; font-weight:700; color:rgba(255,255,255,.3); margin-bottom:8px; letter-spacing:2px; text-transform:uppercase; transition:color .2s; }
  .rp-label.focused { color:rgba(212,175,55,.8); }

  .rp-btn { width:100%; padding:14px; background:#D4AF37; border:none; color:#0C2540; font-family:'Tajawal',sans-serif; font-weight:900; font-size:.92rem; cursor:pointer; transition:all .25s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .rp-btn:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 6px 20px rgba(212,175,55,.3); }
  .rp-btn:active:not(:disabled) { transform:translateY(0); }
  .rp-btn:disabled { background:rgba(212,175,55,.25); color:rgba(12,37,64,.5); cursor:not-allowed; }

  .rp-spinner { width:16px; height:16px; border:2px solid rgba(12,37,64,.3); border-top-color:#0C2540; border-radius:50%; animation:spin .7s linear infinite; }

  .rp-error { background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2); border-right:3px solid #F87171; color:#FCA5A5; padding:10px 14px; margin-bottom:18px; font-size:.8rem; line-height:1.5; animation:fadeUp .3s ease; }

  .rp-strength { height:3px; border-radius:2px; transition:all .3s; margin-top:8px; }

  .rp-success-icon { width:70px; height:70px; border-radius:50%; background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.2); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 20px; animation:successPop .5s cubic-bezier(.4,0,.2,1) both; }

  .rp-back-btn { background:none; border:none; color:rgba(255,255,255,.25); font-family:'Tajawal',sans-serif; font-size:.78rem; cursor:pointer; transition:color .2s; padding:4px 8px; }
  .rp-back-btn:hover { color:rgba(255,255,255,.6); }

  .rp-eye { position:absolute; left:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,.2); cursor:pointer; font-size:.85rem; padding:0; transition:color .2s; }
  .rp-eye:hover { color:rgba(212,175,55,.6); }
`

function injectCSS() {
  if (document.getElementById('rp-styles')) return
  const el = document.createElement('style')
  el.id = 'rp-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}

function getStrength(p) {
  if (!p) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (p.length >= 6)  score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'ضعيفة',    color: '#F87171', width: '20%' }
  if (score <= 2) return { score, label: 'متوسطة',   color: '#FBBF24', width: '50%' }
  if (score <= 3) return { score, label: 'جيدة',     color: '#60A5FA', width: '75%' }
  return              { score, label: 'قوية جداً', color: '#4ADE80', width: '100%' }
}

export default function ResetPassword() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [focused, setFocused]     = useState('')

  useEffect(() => { injectCSS() }, [])

  // No token → redirect
  useEffect(() => {
    if (!token) {
      setError('رابط غير صالح — اطلب رابطاً جديداً')
    }
  }, [token])

  const strength = getStrength(password)
  const mismatch = confirm && password !== confirm

  const submit = async e => {
    e.preventDefault()
    if (password.length < 6)     return setError('كلمة المرور 6 أحرف على الأقل')
    if (password !== confirm)    return setError('كلمتا المرور غير متطابقتين')
    if (!token)                  return setError('رابط غير صالح')

    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/merchant/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      }).then(r => r.json())

      if (res.success) {
        setDone(true)
      } else {
        setError(res.message || 'حدث خطأ، حاول تاني')
      }
    } catch {
      setError('مفيش اتصال بالسيرفر')
    }
    setLoading(false)
  }

  const canSubmit = !loading && password.length >= 6 && password === confirm && token

  return (
    <div className="rp-root">
      <div className="rp-glow" />
      <div className="rp-glow2" />

      <div className="rp-card">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="rp-logo-box">
            <div className="rp-logo-inner">∞</div>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.55rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
            دايم ∞
          </h1>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)', letterSpacing: 1 }}>
            {done ? 'تم التغيير بنجاح' : 'تغيير كلمة المرور'}
          </p>
        </div>

        {/* Panel */}
        <div className="rp-panel">
          <div className="rp-top-line" />

          {done ? (
            /* ── Success ── */
            <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
              <div className="rp-success-icon">🔐</div>
              <h3 style={{ fontWeight: 900, color: '#fff', fontSize: '1.05rem', marginBottom: 10 }}>
                تم التغيير بنجاح!
              </h3>
              <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginBottom: 28 }}>
                كلمة مرورك الجديدة شغالة دلوقتي.<br />
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)' }}>سجل دخولك من جديد</span>
              </p>
              <button className="rp-btn" onClick={() => nav('/merchant/login')}>
                تسجيل الدخول ←
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              {!token && (
                <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRight: '3px solid #F87171', color: '#FCA5A5', padding: '12px 14px', marginBottom: 18, fontSize: '.82rem', lineHeight: 1.6 }}>
                  ⚠️ رابط التغيير غير صالح أو منتهي الصلاحية.<br />
                  <button
                    onClick={() => nav('/merchant/forgot-password')}
                    style={{ background: 'none', border: 'none', color: '#D4AF37', fontFamily: 'Tajawal', fontSize: '.78rem', cursor: 'pointer', padding: 0, marginTop: 6 }}>
                    اطلب رابط جديد ←
                  </button>
                </div>
              )}

              {error && token && <div className="rp-error">⚠️ {error}</div>}

              <form onSubmit={submit}>

                {/* Password field */}
                <div style={{ marginBottom: 20 }}>
                  <label className={`rp-label${focused === 'pass' ? ' focused' : ''}`}>
                    كلمة المرور الجديدة
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'pass' ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.2)', fontSize: '.85rem', pointerEvents: 'none', transition: 'color .2s' }}>🔑</span>
                    <input
                      className="rp-input"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      placeholder="••••••••"
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      onFocus={() => setFocused('pass')}
                      onBlur={() => setFocused('')}
                      required
                      autoFocus
                      disabled={!token}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowPass(v => !v)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div className="rp-strength" style={{ width: strength.width, background: strength.color, height: '100%' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                        <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)' }}>قوة كلمة المرور</span>
                        <span style={{ fontSize: '.62rem', color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm field */}
                <div style={{ marginBottom: 24 }}>
                  <label className={`rp-label${focused === 'conf' ? ' focused' : ''}`}>
                    تأكيد كلمة المرور
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: mismatch ? 'rgba(248,113,113,.6)' : focused === 'conf' ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.2)', fontSize: '.85rem', pointerEvents: 'none', transition: 'color .2s' }}>
                      {mismatch ? '✗' : confirm && !mismatch ? '✓' : '🔑'}
                    </span>
                    <input
                      className="rp-input"
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      placeholder="••••••••"
                      onChange={e => { setConfirm(e.target.value); setError('') }}
                      onFocus={() => setFocused('conf')}
                      onBlur={() => setFocused('')}
                      required
                      disabled={!token}
                      style={{
                        borderColor: mismatch
                          ? 'rgba(248,113,113,.5)'
                          : confirm && !mismatch
                            ? 'rgba(74,222,128,.4)'
                            : undefined
                      }}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowConf(v => !v)}>
                      {showConf ? '🙈' : '👁'}
                    </button>
                  </div>
                  {mismatch && (
                    <p style={{ fontSize: '.68rem', color: '#F87171', marginTop: 6 }}>
                      ✗ كلمتا المرور غير متطابقتين
                    </p>
                  )}
                  {confirm && !mismatch && (
                    <p style={{ fontSize: '.68rem', color: '#4ADE80', marginTop: 6 }}>
                      ✓ متطابقتين
                    </p>
                  )}
                </div>

                <button type="submit" className="rp-btn" disabled={!canSubmit}>
                  {loading
                    ? <><div className="rp-spinner" /> جاري التغيير...</>
                    : <><span>تغيير كلمة المرور</span><span style={{ opacity: .6 }}>←</span></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="rp-back-btn" onClick={() => nav('/merchant/login')}>
            ← رجوع لتسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  )
}
