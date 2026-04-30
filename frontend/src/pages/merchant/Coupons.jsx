// frontend/src/pages/merchant/Coupons.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const BASE = `http://${window.location.hostname}:5000/api`
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dayem_token')}`
})

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const inputStyle = (val) => ({
  width: '100%', padding: '11px 14px',
  background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)',
  border: `1px solid ${val ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'}`,
  fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none',
  transition: 'all .2s', boxSizing: 'border-box', borderRadius: 0
})

const EMPTY_FORM = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '' }

export default function Coupons() {
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/coupons`, { headers: authHeaders() }).then(r => r.json())
      if (res.success) setCoupons(res.coupons)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async e => {
    e.preventDefault()
    if (!form.code || !form.value) { setError('الكود والقيمة مطلوبان'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/coupons`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 0 })
      }).then(r => r.json())
      if (res.success) { setShowForm(false); setForm(EMPTY_FORM); load() }
      else setError(res.message || 'حدث خطأ')
    } catch { setError('حدث خطأ') }
    setSaving(false)
  }

  const toggle = async (id, isActive) => {
    await fetch(`${BASE}/coupons/${id}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ isActive: !isActive })
    })
    load()
  }

  const del = async (id) => {
    if (!confirm('حذف الكوبون؟')) return
    await fetch(`${BASE}/coupons/${id}`, { method: 'DELETE', headers: authHeaders() })
    load()
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const isExpired = (d) => d && new Date(d) < new Date()

  const statusInfo = (c) => {
    if (!c.isActive) return { label: 'متوقف', color: '#6B7280', bg: 'rgba(107,114,128,.1)' }
    if (isExpired(c.expiresAt)) return { label: 'منتهي', color: '#FCA5A5', bg: 'rgba(239,68,68,.1)' }
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { label: 'مكتمل', color: '#FDE047', bg: 'rgba(234,179,8,.1)' }
    return { label: 'نشط', color: '#86EFAC', bg: 'rgba(34,197,94,.1)' }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="coupons" />
      <div style={{ flex: 1, marginRight: isMobile ? 0 : 240, padding: isMobile ? '68px 16px 40px' : '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 20 : 32, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
              <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>إدارة العروض</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>كوبونات الخصم</h1>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>أنشئ كوبونات لزبائنك وزد مبيعاتك</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError('') }} style={{
            padding: '11px 24px', background: showForm ? 'rgba(212,175,55,.1)' : '#D4AF37',
            border: showForm ? '1px solid rgba(212,175,55,.3)' : 'none',
            color: showForm ? '#D4AF37' : '#0C2540',
            fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.85rem'
          }}>
            {showForm ? '✕ إلغاء' : '+ كوبون جديد'}
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: 24 }}>
          {[
            { label: 'إجمالي الكوبونات', value: coupons.length,                                 color: '#D4AF37', icon: '🎫' },
            { label: 'نشط',              value: coupons.filter(c => statusInfo(c).label === 'نشط').length, color: '#86EFAC', icon: '✅' },
            { label: 'إجمالي الاستخدام', value: coupons.reduce((s,c) => s + c.usedCount, 0),    color: '#A78BFA', icon: '📊' },
            { label: 'منتهي / متوقف',   value: coupons.filter(c => statusInfo(c).label !== 'نشط').length, color: '#FCA5A5', icon: '⏸️' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '14px' : '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
              <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '.65rem', color: s.color, fontWeight: 700, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(212,175,55,.15)', padding: isMobile ? '20px 16px' : '28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
            <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />

            <div style={{ fontSize: '.58rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 1, background: '#D4AF37' }} />
              إنشاء كوبون جديد
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', padding: '10px 14px', marginBottom: 16, fontSize: '.8rem' }}>⚠️ {error}</div>}

            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>كود الخصم *</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20" required style={{ ...inputStyle(form.code), letterSpacing: 2, direction: 'ltr' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                    onBlur={e => { e.target.style.borderColor = form.code ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form.code ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>نوع الخصم</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ v: 'percent', l: 'نسبة %' }, { v: 'fixed', l: 'مبلغ ج' }].map(t => (
                      <div key={t.v} onClick={() => setForm({ ...form, type: t.v })}
                        style={{ flex: 1, padding: '11px 0', textAlign: 'center', cursor: 'pointer', border: `1px solid ${form.type === t.v ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.07)'}`, background: form.type === t.v ? 'rgba(212,175,55,.08)' : 'rgba(255,255,255,.03)', color: form.type === t.v ? '#D4AF37' : 'rgba(255,255,255,.4)', fontSize: '.8rem', fontWeight: form.type === t.v ? 700 : 400, transition: 'all .2s' }}>
                        {t.l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>القيمة * {form.type === 'percent' ? '(%)' : '(ج)'}</label>
                  <input type="number" min="1" max={form.type === 'percent' ? 100 : undefined}
                    value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'percent' ? '20' : '50'} required
                    style={{ ...inputStyle(form.value), direction: 'ltr' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                    onBlur={e => { e.target.style.borderColor = form.value ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form.value ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>حد أدنى للطلب (ج)</label>
                  <input type="number" min="0" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })}
                    placeholder="0 = بدون حد" style={{ ...inputStyle(form.minOrder), direction: 'ltr' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                    onBlur={e => { e.target.style.borderColor = form.minOrder ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form.minOrder ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>عدد مرات الاستخدام</label>
                  <input type="number" min="0" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="0 = غير محدود" style={{ ...inputStyle(form.maxUses), direction: 'ltr' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                    onBlur={e => { e.target.style.borderColor = form.maxUses ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form.maxUses ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>تاريخ الانتهاء</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                    style={{ ...inputStyle(form.expiresAt), colorScheme: 'dark', direction: 'ltr' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                    onBlur={e => { e.target.style.borderColor = form.expiresAt ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form.expiresAt ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                </div>
              </div>

              <button type="submit" disabled={saving} style={{
                padding: '12px 32px', background: saving ? 'rgba(212,175,55,.3)' : '#D4AF37',
                border: 'none', color: '#0C2540', fontFamily: 'Tajawal',
                fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '.88rem'
              }}>
                {saving ? '⏳ جاري الإنشاء...' : '✓ إنشاء الكوبون'}
              </button>
            </form>
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,.2)', fontSize: '.85rem' }}>⏳ جاري التحميل...</div>
        ) : coupons.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 14, opacity: .2 }}>🎫</div>
            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '.88rem', marginBottom: 6 }}>لا توجد كوبونات بعد</div>
            <div style={{ color: 'rgba(255,255,255,.15)', fontSize: '.75rem' }}>أنشئ أول كوبون لزبائنك</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {coupons.map(c => {
              const st = statusInfo(c)
              const pct = c.maxUses > 0 ? (c.usedCount / c.maxUses) * 100 : 0
              return (
                <div key={c._id} style={{
                  background: 'rgba(255,255,255,.025)', border: `1px solid ${c.isActive && !isExpired(c.expiresAt) ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)'}`,
                  padding: isMobile ? '16px' : '20px 24px', position: 'relative', overflow: 'hidden',
                  opacity: !c.isActive ? 0.55 : 1, transition: 'opacity .2s'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${st.color}40, transparent)` }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    {/* Code */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 900, color: '#D4AF37', letterSpacing: 3 }}>
                          {c.code}
                        </div>
                        <button onClick={() => copyCode(c.code)} style={{
                          background: copied === c.code ? 'rgba(134,239,172,.1)' : 'rgba(212,175,55,.08)',
                          border: `1px solid ${copied === c.code ? 'rgba(134,239,172,.3)' : 'rgba(212,175,55,.2)'}`,
                          color: copied === c.code ? '#86EFAC' : 'rgba(212,175,55,.7)',
                          fontFamily: 'Tajawal', fontSize: '.65rem', padding: '3px 10px', cursor: 'pointer', fontWeight: 700
                        }}>
                          {copied === c.code ? '✓ تم النسخ' : 'نسخ'}
                        </button>
                        <span style={{ background: st.bg, color: st.color, padding: '3px 10px', fontSize: '.62rem', fontWeight: 700, letterSpacing: 0.5 }}>
                          {st.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: isMobile ? 12 : 24, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', fontFamily: 'Tajawal' }}>
                          💰 خصم {c.type === 'percent' ? `${c.value}%` : `${c.value} ج`}
                        </span>
                        {c.minOrder > 0 && <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>حد أدنى: {c.minOrder} ج</span>}
                        {c.expiresAt && <span style={{ fontSize: '.75rem', color: isExpired(c.expiresAt) ? '#FCA5A5' : 'rgba(255,255,255,.35)' }}>
                          ينتهي: {new Date(c.expiresAt).toLocaleDateString('ar-EG')}
                        </span>}
                      </div>

                      {/* Usage bar */}
                      {c.maxUses > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>الاستخدام</span>
                            <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.5)', fontFamily: 'Tajawal' }}>{c.usedCount} / {c.maxUses}</span>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#FCA5A5' : '#D4AF37', transition: 'width .5s' }} />
                          </div>
                        </div>
                      )}

                      {c.maxUses === 0 && (
                        <div style={{ marginTop: 8, fontSize: '.68rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>
                          استُخدم {c.usedCount} {c.usedCount === 1 ? 'مرة' : 'مرات'} · غير محدود
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => toggle(c._id, c.isActive)} style={{
                        padding: '7px 14px', background: 'transparent',
                        border: `1px solid ${c.isActive ? 'rgba(255,255,255,.1)' : 'rgba(134,239,172,.25)'}`,
                        color: c.isActive ? 'rgba(255,255,255,.35)' : '#86EFAC',
                        fontFamily: 'Tajawal', fontSize: '.72rem', cursor: 'pointer', fontWeight: 600,
                        transition: 'all .2s'
                      }}>
                        {c.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button onClick={() => del(c._id)} style={{
                        padding: '7px 14px', background: 'transparent',
                        border: '1px solid rgba(239,68,68,.2)',
                        color: 'rgba(239,68,68,.5)', fontFamily: 'Tajawal',
                        fontSize: '.72rem', cursor: 'pointer', transition: 'all .2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.5)'; e.currentTarget.style.color = '#FCA5A5' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; e.currentTarget.style.color = 'rgba(239,68,68,.5)' }}>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <span style={{ fontSize: '.5rem', letterSpacing: 4, color: 'rgba(255,255,255,.1)', textTransform: 'uppercase' }}>DAYEM ∞ — Trade Without Restrictions</span>
        </div>
      </div>
    </div>
  )
}
