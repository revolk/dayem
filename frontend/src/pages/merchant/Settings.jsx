import { useState, useEffect, useRef } from 'react'
import { merchantAPI } from '../../services/api'
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

// ── Shared card wrapper (same as Dashboard pattern) ─────────────────────────
const Card = ({ children, gold = false, style = {} }) => (
  <div style={{
    background: gold ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.025)',
    border: `1px solid ${gold ? 'rgba(212,175,55,.12)' : 'rgba(255,255,255,.06)'}`,
    position: 'relative', overflow: 'hidden', ...style
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.2), transparent)'
    }} />
    {children}
  </div>
)

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37',
    textTransform: 'uppercase', fontWeight: 800, marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8
  }}>
    <div style={{ width: 14, height: 1, background: '#D4AF37' }} />
    {children}
  </div>
)

export default function Settings() {
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [merchant, setMerchant] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', category: '', governorate: '', vodafoneCash: '', instapay: '', fawryCode: '' })
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoRef = useRef(null)

  // Telegram state
  const [tgChatId, setTgChatId] = useState('')
  const [tgConnected, setTgConnected] = useState(false)
  const [tgSaving, setTgSaving] = useState(false)
  const [tgMsg, setTgMsg] = useState(null) // { type: 'success'|'error', text }
  const [tgStep, setTgStep] = useState(1) // 1=instructions, 2=input

  useEffect(() => {
    const m = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')
    setMerchant(m)
    setForm({
      name: m?.store?.name || '',
      description: m?.store?.description || '',
      phone: m?.store?.phone || m?.phone || '',
      address: m?.store?.address || '',
      category: m?.store?.category || '',
      governorate: m?.store?.governorate || '',
      vodafoneCash: m?.store?.vodafoneCash || '',
      instapay: m?.store?.instapay || '',
      fawryCode: m?.store?.fawryCode || '',
    })
    setLogoPreview(m?.store?.logo || null)
    fetchTgStatus()
  }, [])

  const fetchTgStatus = async () => {
    try {
      const res = await fetch(`${BASE}/merchant/telegram`, { headers: authHeaders() }).then(r => r.json())
      if (res.success) {
        setTgConnected(res.connected)
        if (res.chatId) setTgChatId(res.chatId)
      }
    } catch {}
  }

  const handleLogoSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)
    const uploadRes = await merchantAPI.uploadImage(file)
    if (uploadRes.success) logoRef.current = uploadRes.url
    setUploadingLogo(false)
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    const data = { ...form }
    if (logoRef.current) data.logo = logoRef.current
    const res = await merchantAPI.updateStore(data)
    if (res.success) {
      const m = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')
      m.store = { ...m.store, ...data }
      localStorage.setItem('dayem_merchant', JSON.stringify(m))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const connectTelegram = async () => {
    if (!tgChatId.trim()) return
    setTgSaving(true)
    setTgMsg(null)
    try {
      const res = await fetch(`${BASE}/merchant/telegram`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ chatId: tgChatId.trim() })
      }).then(r => r.json())

      if (res.success) {
        setTgConnected(true)
        setTgMsg({ type: 'success', text: '✓ تم الربط! راجع تليجرام هتلاقي رسالة تأكيد' })
        setTgStep(1)
      } else {
        setTgMsg({ type: 'error', text: res.message || 'حصل خطأ، حاول تاني' })
      }
    } catch {
      setTgMsg({ type: 'error', text: 'تأكد إن الـ backend شغال' })
    }
    setTgSaving(false)
  }

  const disconnectTelegram = async () => {
    setTgSaving(true)
    try {
      await fetch(`${BASE}/merchant/telegram`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ chatId: '' })
      })
      setTgConnected(false)
      setTgChatId('')
      setTgMsg({ type: 'success', text: 'تم إلغاء الربط' })
    } catch {}
    setTgSaving(false)
  }

  const inputStyle = (val) => ({
    width: '100%', padding: '11px 14px',
    background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)',
    border: `1px solid ${val ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'}`,
    fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none',
    transition: 'all .2s', boxSizing: 'border-box'
  })

  const storeUrl = `${window.location.origin}/store/${merchant?.store?.slug}`
  const planLabels = { starter: 'ستارتر', tajer: 'تاجر', pro: 'برو' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="settings" />
      <div style={{ flex: 1, marginRight: isMobile ? 0 : 240, padding: isMobile ? '68px 16px 40px' : '36px 40px', overflowY: 'auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: isMobile ? 24 : 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
            <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>إعدادات المتجر</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>الإعدادات</h1>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>تخصيص متجرك وإعدادات الإشعارات</p>
        </div>

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* ── RIGHT COL (main) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Logo */}
            <Card>
              <div style={{ padding: isMobile ? '18px 16px' : '22px' }}>
                <SectionLabel>لوجو المتجر</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 80, height: 80, flexShrink: 0, position: 'relative',
                    background: 'rgba(255,255,255,.04)',
                    border: `2px dashed ${logoPreview ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {logoPreview
                      ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', opacity: .2 }}>◈</div>
                          <div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.2)' }}>لوجو</div>
                        </div>
                    }
                    {uploadingLogo && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#D4AF37' }}>⏳</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', color: '#fff', fontWeight: 600, marginBottom: 5 }}>صورة لوجو متجرك</div>
                    <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', marginBottom: 12, lineHeight: 1.6 }}>يظهر في متجرك · PNG أو JPG</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                        <div style={{ background: 'transparent', border: '1px solid rgba(212,175,55,.3)', color: 'rgba(212,175,55,.8)', padding: '7px 16px', fontSize: '.7rem', fontWeight: 700 }}>
                          {logoPreview ? 'تغيير' : 'رفع لوجو'}
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoSelect} style={{ display: 'none' }} />
                      </label>
                      {logoPreview && (
                        <button onClick={() => { setLogoPreview(null); logoRef.current = '' }}
                          style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,.5)', fontSize: '.7rem', cursor: 'pointer', fontFamily: 'Tajawal' }}>
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Store Info */}
            <Card>
              <div style={{ padding: isMobile ? '18px 16px' : '22px' }}>
                <SectionLabel>بيانات المتجر</SectionLabel>
                <form onSubmit={save}>
                  {[
                    { name: 'name',        label: 'اسم المتجر',   placeholder: 'متجر محمد', required: true },
                    { name: 'description', label: 'وصف المتجر',   placeholder: 'وصف مختصر...', type: 'textarea' },
                    { name: 'phone',       label: 'رقم الواتساب', placeholder: '201xxxxxxxxx' },
                    { name: 'address',     label: 'العنوان',       placeholder: 'الشارع والمنطقة...' },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: form[f.name] ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                      {f.type === 'textarea'
                        ? <textarea name={f.name} placeholder={f.placeholder} rows={2} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} style={{ ...inputStyle(form[f.name]), resize: 'none' }} onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'} />
                        : <input name={f.name} type="text" placeholder={f.placeholder} required={f.required} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} style={inputStyle(form[f.name])} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }} onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                      }
                    </div>
                  ))}

                  {/* المحافظة */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: form.governorate ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>المحافظة</label>
                    <select value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} style={{ ...inputStyle(form.governorate), color: form.governorate ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر المحافظة</option>
                      {['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية'].map(g => <option key={g} value={g} style={{ background: '#0C2540' }}>{g}</option>)}
                    </select>
                  </div>

                  {/* تخصص المتجر */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: form.category ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>تخصص المتجر</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle(form.category), color: form.category ? '#fff' : 'rgba(255,255,255,.3)' }}>
                      <option value="" style={{ background: '#0C2540' }}>اختر التخصص</option>
                      {['ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى'].map(c => <option key={c} value={c} style={{ background: '#0C2540' }}>{c}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={saving} style={{
                    padding: '12px 28px',
                    background: saving ? 'rgba(212,175,55,.3)' : saved ? 'rgba(34,197,94,.15)' : '#D4AF37',
                    border: saved ? '1px solid rgba(34,197,94,.4)' : 'none',
                    color: saved ? '#86EFAC' : '#0C2540',
                    fontFamily: 'Tajawal', fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '.85rem', width: isMobile ? '100%' : 'auto',
                    transition: 'all .3s'
                  }}>
                    {saving ? '⏳ جاري الحفظ...' : saved ? '✓ تم الحفظ بنجاح' : 'حفظ التغييرات'}
                  </button>
                </form>
              </div>
            </Card>

            {/* ── وسائل الدفع ── */}
            <Card>
              <div style={{ padding: isMobile ? '18px 16px' : '22px' }}>
                <SectionLabel>وسائل الدفع</SectionLabel>
                <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 18, lineHeight: 1.6 }}>
                  حط أرقامك عشان الزبائن يقدروا يحولوا عليك — هتظهر في صفحة الدفع تلقائياً
                </p>

                {[
                  { name: 'vodafoneCash', label: 'فودافون كاش', placeholder: '01xxxxxxxxx', icon: '📱', color: 'rgba(239,68,68,.6)' },
                  { name: 'instapay',    label: 'انستاباي (IPA)', placeholder: 'رقم الهاتف أو الـ IPA', icon: '⚡', color: 'rgba(77,159,255,.6)' },
                  { name: 'fawryCode',   label: 'رقم موبايل فوري',    placeholder: '01xxxxxxxxx', icon: '🏪', color: 'rgba(255,191,0,.6)' },
                ].map(f => (
                  <div key={f.name} style={{ marginBottom: 14 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '.6rem', fontWeight: 700,
                      color: form[f.name] ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.3)',
                      marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase'
                    }}>
                      <span>{f.icon}</span> {f.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        name={f.name} type="text"
                        placeholder={f.placeholder}
                        value={form[f.name]}
                        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                        style={{ ...inputStyle(form[f.name]), direction: 'ltr', paddingRight: form[f.name] ? '40px' : '14px' }}
                        onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                        onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }}
                      />
                      {form[f.name] && (
                        <div style={{
                          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#22C55E', boxShadow: '0 0 6px #22C55E'
                        }} />
                      )}
                    </div>
                  </div>
                ))}

                <div style={{
                  background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)',
                  padding: '10px 14px', fontSize: '.72rem', color: 'rgba(212,175,55,.6)',
                  fontFamily: 'Tajawal', lineHeight: 1.6
                }}>
                  💡 الأرقام دي بتظهر للعميل في صفحة الدفع — احرص إنها صح
                </div>
              </div>
            </Card>

            {/* ── TELEGRAM SECTION ── */}
            <Card gold={tgConnected}>
              <div style={{ padding: isMobile ? '18px 16px' : '22px' }}>
                {/* Corner decoration (same as dashboard store link card) */}
                {tgConnected && <>
                  <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
                  <div style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: '1.5px solid #D4AF37', borderLeft: '1.5px solid #D4AF37' }} />
                </>}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <SectionLabel>إشعارات تليجرام</SectionLabel>
                  {/* Status badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px',
                    background: tgConnected ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${tgConnected ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.08)'}`,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: tgConnected ? '#22C55E' : 'rgba(255,255,255,.2)',
                      boxShadow: tgConnected ? '0 0 6px #22C55E' : 'none',
                      animation: tgConnected ? 'pulse 2s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: '.6rem', fontWeight: 700, color: tgConnected ? '#86EFAC' : 'rgba(255,255,255,.3)', letterSpacing: 1 }}>
                      {tgConnected ? 'مرتبط' : 'غير مرتبط'}
                    </span>
                  </div>
                </div>

                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

                {tgConnected ? (
                  /* ── Connected State ── */
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      background: 'rgba(34,197,94,.06)',
                      border: '1px solid rgba(34,197,94,.15)',
                      marginBottom: 16
                    }}>
                      <div style={{ fontSize: '1.4rem' }}>✅</div>
                      <div>
                        <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#86EFAC', marginBottom: 3 }}>
                          تليجرام مرتبط بنجاح
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                          هتوصلك رسالة على تليجرام مع كل طلب جديد فوراً
                        </div>
                      </div>
                    </div>

                    {/* Preview of notification */}
                    <div style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(255,255,255,.05)',
                      padding: '14px 16px',
                      marginBottom: 16
                    }}>
                      <div style={{ fontSize: '.58rem', letterSpacing: 2, color: 'rgba(255,255,255,.25)', marginBottom: 10, textTransform: 'uppercase' }}>معاينة الإشعار</div>
                      <div style={{
                        background: '#17212B',
                        border: '1px solid rgba(255,255,255,.06)',
                        padding: '12px 14px',
                        fontFamily: 'monospace', fontSize: '.72rem',
                        color: 'rgba(255,255,255,.6)', lineHeight: 1.8,
                        direction: 'rtl'
                      }}>
                        <div style={{ color: '#D4AF37', fontWeight: 700, marginBottom: 4 }}>🛍️ طلب جديد — دايم ∞</div>
                        <div>📋 رقم الطلب: <span style={{ color: '#fff' }}>DAY-00015</span></div>
                        <div>👤 العميل: <span style={{ color: '#fff' }}>محمد أحمد</span></div>
                        <div>💰 الإجمالي: <span style={{ color: '#D4AF37', fontWeight: 700 }}>1,800 ج</span></div>
                        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '.65rem', marginTop: 4 }}>📱 فودافون كاش</div>
                      </div>
                    </div>

                    <button onClick={disconnectTelegram} disabled={tgSaving} style={{
                      background: 'none', border: '1px solid rgba(239,68,68,.2)',
                      color: 'rgba(239,68,68,.5)', fontFamily: 'Tajawal',
                      fontSize: '.72rem', padding: '7px 16px', cursor: 'pointer',
                      transition: 'all .2s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.5)'; e.currentTarget.style.color = '#FCA5A5' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; e.currentTarget.style.color = 'rgba(239,68,68,.5)' }}>
                      {tgSaving ? '...' : 'إلغاء الربط'}
                    </button>
                  </div>

                ) : tgStep === 1 ? (
                  /* ── Step 1: Instructions ── */
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 18 }}>
                      ربّط متجرك بتليجرام عشان توصلك إشعارات فورية مع كل طلب جديد
                    </div>

                    {/* Steps */}
                    {[
                      { n: '01', text: 'افتح تليجرام وابحث عن', link: '@dayem_notify_bot', linkHref: 'https://t.me/dayem_notify_bot' },
                      { n: '02', text: 'اضغط Start وابعت أي رسالة للبوت' },
                      { n: '03', text: 'افتح اللينك ده وانسخ الـ Chat ID', link: 'getUpdates', linkHref: `https://api.telegram.org/bot8616880829:AAGwhk3SSD_k-Oq1EpuZMhfEuEA0xaY8rVo/getUpdates` },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 14, padding: '12px 0',
                        borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none'
                      }}>
                        <div style={{
                          width: 28, height: 28, flexShrink: 0,
                          border: '1px solid rgba(212,175,55,.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.6rem', fontWeight: 900, color: '#D4AF37',
                          fontFamily: 'monospace'
                        }}>{s.n}</div>
                        <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.6, paddingTop: 4 }}>
                          {s.text}{' '}
                          {s.link && (
                            <a href={s.linkHref} target="_blank" rel="noreferrer"
                              style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>
                              {s.link} ←
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    <button onClick={() => setTgStep(2)} style={{
                      marginTop: 18, width: '100%', padding: '12px',
                      background: '#D4AF37', border: 'none',
                      color: '#0C2540', fontFamily: 'Tajawal',
                      fontWeight: 900, cursor: 'pointer', fontSize: '.85rem',
                      transition: 'opacity .2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      عندي الـ Chat ID — ربط الآن ←
                    </button>
                  </div>

                ) : (
                  /* ── Step 2: Input Chat ID ── */
                  <div>
                    <button onClick={() => setTgStep(1)} style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,.3)',
                      fontFamily: 'Tajawal', fontSize: '.72rem', cursor: 'pointer',
                      marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      → رجوع
                    </button>

                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(212,175,55,.6)', marginBottom: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Chat ID
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 7097105353"
                      value={tgChatId}
                      onChange={e => setTgChatId(e.target.value)}
                      style={{ ...inputStyle(tgChatId), marginBottom: 14, direction: 'ltr' }}
                      onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }}
                      onBlur={e => { e.target.style.borderColor = tgChatId ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = tgChatId ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }}
                    />

                    {tgMsg && (
                      <div style={{
                        padding: '10px 14px', marginBottom: 14, fontSize: '.78rem',
                        background: tgMsg.type === 'success' ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                        border: `1px solid ${tgMsg.type === 'success' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
                        color: tgMsg.type === 'success' ? '#86EFAC' : '#FCA5A5'
                      }}>
                        {tgMsg.text}
                      </div>
                    )}

                    <button onClick={connectTelegram} disabled={tgSaving || !tgChatId.trim()} style={{
                      width: '100%', padding: '12px',
                      background: tgSaving ? 'rgba(212,175,55,.3)' : '#D4AF37',
                      border: 'none', color: '#0C2540',
                      fontFamily: 'Tajawal', fontWeight: 900,
                      cursor: tgSaving || !tgChatId.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '.85rem', transition: 'all .2s'
                    }}>
                      {tgSaving ? '⏳ جاري الربط...' : '✓ ربط تليجرام'}
                    </button>
                  </div>
                )}
              </div>
            </Card>

          </div>

          {/* ── LEFT COL (sidebar) ── */}
          <div style={{ marginTop: isMobile ? 16 : 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Store Preview */}
            <Card>
              <div style={{ padding: '16px 18px' }}>
                <SectionLabel>معاينة المتجر</SectionLabel>
                <div style={{ background: '#0C2540', padding: '12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: logoPreview ? 'transparent' : 'linear-gradient(135deg,#D4AF37,#A88C2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoPreview
                        ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '.65rem', fontWeight: 900, color: '#0C2540' }}>{form.name?.charAt(0)}</span>
                      }
                    </div>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.name || 'اسم المتجر'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.25)', marginBottom: 8 }}>رابط المتجر</div>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', padding: '8px 10px', fontSize: '.65rem', color: 'rgba(212,175,55,.6)', direction: 'ltr', wordBreak: 'break-all', marginBottom: 10 }}>
                  {storeUrl}
                </div>
                <button onClick={() => window.open(storeUrl, '_blank')} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid rgba(212,175,55,.2)', color: 'rgba(212,175,55,.7)', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.72rem' }}>
                  فتح المتجر ←
                </button>
              </div>
            </Card>

            {/* Account Info */}
            <Card>
              <div style={{ padding: '16px 18px' }}>
                <SectionLabel>بيانات الحساب</SectionLabel>
                {[
                  ['الاسم',  merchant?.name],
                  ['البريد', merchant?.email],
                  ['الخطة',  planLabels[merchant?.store?.plan] || 'ستارتر'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: '.76rem' }}>
                    <span style={{ color: 'rgba(255,255,255,.28)' }}>{l}</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upgrade */}
            <Card gold style={{ padding: '16px 18px' }}>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
              <SectionLabel>ترقية الخطة</SectionLabel>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: 12, lineHeight: 1.6 }}>
                منتجات غير محدودة وتقارير متقدمة وأدوات AI إضافية
              </div>
              <button onClick={() => window.open('https://wa.me/201027360268', '_blank')} style={{ width: '100%', padding: '9px', background: '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer', fontSize: '.75rem' }}>
                تواصل معنا ←
              </button>
            </Card>

          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ fontSize: '.5rem', letterSpacing: 4, color: 'rgba(255,255,255,.1)', textTransform: 'uppercase' }}>
            DAYEM ∞ — Trade Without Restrictions
          </span>
        </div>
      </div>
    </div>
  )
}
