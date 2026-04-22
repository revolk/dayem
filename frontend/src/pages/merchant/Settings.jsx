import { useState, useEffect, useRef } from 'react'
import { merchantAPI } from '../../services/api'
import Sidebar from '../../components/Sidebar'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function Settings() {
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [merchant, setMerchant] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', category: '' })
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoRef = useRef(null)

  useEffect(() => {
    const m = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')
    setMerchant(m)
    setForm({ name: m?.store?.name || '', description: m?.store?.description || '', phone: m?.store?.phone || m?.phone || '', address: m?.store?.address || '', category: m?.store?.category || '' })
    setLogoPreview(m?.store?.logo || null)
  }, [])

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

  const storeUrl = `${window.location.origin}/store/${merchant?.store?.slug}`

  const inputStyle = (val) => ({
    width: '100%', padding: '11px 14px',
    background: val ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)',
    border: `1px solid ${val ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'}`,
    fontFamily: 'Tajawal', fontSize: '.88rem', color: '#fff', outline: 'none',
    transition: 'all .2s', boxSizing: 'border-box'
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="settings" />
      <div style={{ flex: 1, marginRight: isMobile ? 0 : 240, padding: isMobile ? '68px 16px 24px' : '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 20 : 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
            <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>إعدادات المتجر</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>الإعدادات</h1>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>تخصيص متجرك وبياناتك</p>
        </div>

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Main */}
          <div>
            {/* Logo */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '18px 16px' : '22px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.2), transparent)' }} />
              <div style={{ fontSize: '.58rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 16 }}>لوجو المتجر</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,.04)', border: `2px dashed ${logoPreview ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {logoPreview ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', opacity: .2 }}>◈</div><div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.2)' }}>لوجو</div></div>}
                  {uploadingLogo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#D4AF37' }}>⏳</div>}
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
                      <button onClick={() => { setLogoPreview(null); logoRef.current = '' }} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,.5)', fontSize: '.7rem', cursor: 'pointer', fontFamily: 'Tajawal' }}>حذف</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: isMobile ? '18px 16px' : '22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.2), transparent)' }} />
              <div style={{ fontSize: '.58rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>بيانات المتجر</div>
              <form onSubmit={save}>
                {[
                  { name: 'name', label: 'اسم المتجر', placeholder: 'متجر محمد', required: true },
                  { name: 'description', label: 'وصف المتجر', placeholder: 'وصف مختصر...', type: 'textarea' },
                  { name: 'phone', label: 'رقم الواتساب', placeholder: '201xxxxxxxxx' },
                  { name: 'category', label: 'تخصص المتجر', placeholder: 'ملابس، إلكترونيات...' },
                  { name: 'address', label: 'العنوان', placeholder: 'المدينة...' },
                ].map(f => (
                  <div key={f.name} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: form[f.name] ? 'rgba(212,175,55,.6)' : 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                    {f.type === 'textarea'
                      ? <textarea name={f.name} placeholder={f.placeholder} rows={2} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} style={{ ...inputStyle(form[f.name]), resize: 'none' }} onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'} />
                      : <input name={f.name} type="text" placeholder={f.placeholder} required={f.required} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} style={inputStyle(form[f.name])} onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,.05)' }} onBlur={e => { e.target.style.borderColor = form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.07)'; e.target.style.background = form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)' }} />
                    }
                  </div>
                ))}
                <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: saving ? 'rgba(212,175,55,.3)' : saved ? 'rgba(34,197,94,.2)' : '#D4AF37', border: saved ? '1px solid rgba(34,197,94,.4)' : 'none', color: saved ? '#86EFAC' : '#0C2540', fontFamily: 'Tajawal', fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '.85rem', width: isMobile ? '100%' : 'auto' }}>
                  {saving ? '⏳ جاري...' : saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
                </button>
              </form>
            </div>
          </div>

          {/* Side */}
          <div style={{ marginTop: isMobile ? 16 : 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Preview */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.2), transparent)' }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 14 }}>معاينة المتجر</div>
                <div style={{ background: '#0C2540', padding: '12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: logoPreview ? 'transparent' : 'linear-gradient(135deg,#D4AF37,#A88C2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoPreview ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '.65rem', fontWeight: 900, color: '#0C2540' }}>{form.name?.charAt(0)}</span>}
                    </div>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.name || 'اسم المتجر'}</div>
                  </div>
                </div>
                <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.25)', marginBottom: 8 }}>رابط المتجر</div>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', padding: '8px 10px', fontSize: '.65rem', color: 'rgba(212,175,55,.6)', direction: 'ltr', wordBreak: 'break-all', marginBottom: 10 }}>{storeUrl}</div>
                <button onClick={() => window.open(storeUrl, '_blank')} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid rgba(212,175,55,.2)', color: 'rgba(212,175,55,.7)', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.72rem' }}>
                  فتح المتجر ←
                </button>
              </div>
            </div>

            {/* Account */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '16px 18px' }}>
              <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 14 }}>بيانات الحساب</div>
              {[['الاسم', merchant?.name], ['البريد', merchant?.email], ['الخطة', merchant?.store?.plan === 'starter' ? 'ستارتر' : merchant?.store?.plan === 'pro' ? 'برو' : 'تاجر']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: '.76rem' }}>
                  <span style={{ color: 'rgba(255,255,255,.28)' }}>{l}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Upgrade */}
            <div style={{ background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.12)', padding: '16px 18px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1.5px solid #D4AF37', borderRight: '1.5px solid #D4AF37' }} />
              <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>ترقية الخطة</div>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: 12, lineHeight: 1.6 }}>منتجات غير محدودة وتقارير متقدمة</div>
              <button onClick={() => window.open('https://wa.me/201027360268', '_blank')} style={{ width: '100%', padding: '9px', background: '#D4AF37', border: 'none', color: '#0C2540', fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer', fontSize: '.75rem' }}>
                تواصل معنا ←
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ fontSize: '.5rem', letterSpacing: 4, color: 'rgba(255,255,255,.1)', textTransform: 'uppercase' }}>DAYEM ∞ — Trade Without Restrictions</span>
        </div>
      </div>
    </div>
  )
}
