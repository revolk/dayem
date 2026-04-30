// frontend/src/pages/admin/AdminLogin.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`
const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

const G = '#D4AF37'

export default function AdminLogin() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 768
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState(new Date())
  const [focused, setFocused] = useState('')

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])

  const login = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      }).then(r => r.json())
      if (res.success) {
        localStorage.setItem('dayem_admin_token', res.token)
        localStorage.setItem('dayem_admin', JSON.stringify(res.admin))
        nav('/admin/dashboard')
      } else setError(res.message || 'بيانات غير صحيحة')
    } catch { setError('خطأ في الاتصال') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2E', display: 'flex', flexDirection: mob ? 'column' : 'row', fontFamily: 'Tajawal', direction: 'rtl', overflow: 'hidden', position: 'relative' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,175,55,.07),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.05),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(212,175,55,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.025) 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* ── Visual Panel ── */}
      <div style={{
        ...(mob ? { padding: '32px 24px 24px' } : { flex: 1, padding: '60px 48px' }),
        position: 'relative', zIndex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: mob ? 'linear-gradient(180deg,#162340,#0D1B2E)' : 'linear-gradient(160deg,#162340,#0D1B2E)',
        borderBottom: mob ? '1px solid rgba(212,175,55,.1)' : 'none',
        borderLeft: mob ? 'none' : '1px solid rgba(212,175,55,.08)',
      }}>
        <div style={{ position: 'absolute', fontSize: mob ? '60vw' : '28vw', color: 'rgba(212,175,55,.035)', lineHeight: 1, fontWeight: 900, userSelect: 'none', pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>∞</div>
        {!mob && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, background: `linear-gradient(to bottom,transparent,${G},transparent)` }} />}
        {mob && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />}

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: mob ? 300 : 360 }}>
          {/* Logo */}
          <div style={{ position: 'relative', width: mob ? 56 : 76, height: mob ? 56 : 76, margin: `0 auto ${mob ? 12 : 22}px` }}>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 13, height: 13, borderTop: `1.5px solid ${G}`, borderRight: `1.5px solid ${G}` }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 13, height: 13, borderBottom: `1.5px solid ${G}`, borderLeft: `1.5px solid ${G}` }} />
            <div style={{ width: '100%', height: '100%', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mob ? '1.6rem' : '2.2rem', color: G }}>∞</div>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: mob ? '1.7rem' : 'clamp(2rem,3vw,2.8rem)', fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 4, lineHeight: 1 }}>
            دايم <em style={{ color: G, fontStyle: 'italic' }}>∞</em>
          </h1>
          <div style={{ fontSize: '.42rem', letterSpacing: 4, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', fontWeight: 800, marginBottom: mob ? 16 : 24 }}>ADMIN INTELLIGENCE SYSTEM</div>

          {!mob && <div style={{ width: 36, height: 1, background: `linear-gradient(90deg,transparent,${G},transparent)`, margin: '0 auto 18px' }} />}
          {!mob && <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.2)', lineHeight: 1.8, borderRight: '2px solid rgba(212,175,55,.2)', paddingRight: 12, textAlign: 'right', marginBottom: 32 }}>
            منصة التجارة الإلكترونية المصرية<br/>تمكين كل تاجر — بلا قيود
          </p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: mob ? 7 : 10 }}>
            {[['27','محافظة','#60A5FA'],['∞','إمكانيات',G],['5د','للإنشاء','#A78BFA']].map(([v,l,c]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', padding: mob ? '9px 5px' : '13px 9px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c}55,transparent)` }} />
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: mob ? '1.1rem' : '1.4rem', fontWeight: 700, color: c, lineHeight: 1, marginBottom: 3 }}>{v}</div>
                <div style={{ fontSize: '.48rem', letterSpacing: 1.5, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {!mob && (
          <div style={{ position: 'absolute', bottom: 20, fontFamily: 'monospace', fontSize: 9, color: 'rgba(212,175,55,.3)', letterSpacing: 1.5 }}>
            {time.toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' })} · {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>

      {/* ── Form Panel ── */}
      <div style={{ width: mob ? '100%' : '420px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: mob ? '28px 24px 44px' : '60px 44px', position: 'relative', zIndex: 1, background: 'rgba(8,14,24,.65)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />

        <div style={{ width: '100%', maxWidth: 330 }}>
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 1, background: G }} />
              <span style={{ fontSize: '.5rem', letterSpacing: 4, color: `${G}cc`, textTransform: 'uppercase', fontWeight: 800 }}>SECURE ACCESS</span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: -.5, marginBottom: 4 }}>تسجيل الدخول</h2>
            <p style={{ fontSize: '.73rem', color: 'rgba(255,255,255,.28)' }}>لوحة تحكم دايم ∞ — للإدارة فقط</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRight: '3px solid #FF4D6D', color: '#FCA5A5', padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', fontWeight: 600 }}>⚠️ {error}</div>
          )}

          <form onSubmit={login}>
            {[
              { name: 'email',    label: 'البريد الإلكتروني', type: 'email',    ph: 'admin@dayem.shop', ltr: true  },
              { name: 'password', label: 'كلمة المرور',       type: 'password', ph: '••••••••••••',     ltr: false },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '.56rem', fontWeight: 700, color: focused === f.name ? 'rgba(212,175,55,.85)' : 'rgba(255,255,255,.28)', marginBottom: 6, letterSpacing: 2, textTransform: 'uppercase', transition: 'color .2s' }}>{f.label}</label>
                <input type={f.type} name={f.name} placeholder={f.ph} value={form[f.name]}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required
                  style={{ width: '100%', padding: '12px 14px', background: focused === f.name ? 'rgba(212,175,55,.06)' : 'rgba(255,255,255,.04)', border: `1px solid ${focused === f.name ? G : 'rgba(255,255,255,.09)'}`, fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'all .2s', direction: f.ltr ? 'ltr' : 'rtl' }}
                  onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} />
              </div>
            ))}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: loading ? 'rgba(212,175,55,.3)' : G, border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontWeight: 900, fontSize: '.92rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .25s', marginTop: 6 }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}>
              {loading ? '⏳ جاري التحقق...' : 'دخول ←'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
            <span style={{ fontSize: '.46rem', letterSpacing: 2, color: 'rgba(255,255,255,.13)', textTransform: 'uppercase' }}>AUTHORIZED ONLY</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '.46rem', letterSpacing: 3, color: 'rgba(255,255,255,.1)', textTransform: 'uppercase' }}>DAYEM ∞ — ADMIN INTELLIGENCE · v1.0</div>
        </div>
      </div>
    </div>
  )
}
