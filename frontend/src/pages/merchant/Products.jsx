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

export default function Products() {
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nameAr: '', name: '', description: '', price: '', stock: '', category: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const res = await merchantAPI.getProducts()
    if (res.success) setProducts(res.products)
  }

  const openAdd = (p = null) => {
    setEditing(p ? p._id : null)
    fileRef.current = null
    setUploadedImageUrl(p?.images?.[0]?.url || null)
    setImagePreview(p?.images?.[0]?.url || null)
    setImageUrl('')
    setForm(p ? { nameAr: p.nameAr || '', name: p.name || '', description: p.description, price: p.price, stock: p.stock, category: p.category || '' }
      : { nameAr: '', name: '', description: '', price: '', stock: '', category: '' })
    setShowForm(true)
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    fileRef.current = file
    setImagePreview(URL.createObjectURL(file))
    setUploadedImageUrl(null)
    const uploadRes = await merchantAPI.uploadImage(file)
    if (uploadRes.success) setUploadedImageUrl(uploadRes.url)
    analyzeImageFile(file)
  }

  const analyzeImageFile = async (file) => {
    setAiLoading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(',')[1]
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/ai/analyze-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dayem_token')}` },
          body: JSON.stringify({ imageBase64: base64 })
        }).then(r => r.json())
        if (res.success) setForm({ nameAr: res.product.nameAr || '', name: res.product.name || '', description: res.product.description || '', price: res.product.suggestedPrice || '', stock: '10', category: res.product.category || '' })
      } catch { }
      setAiLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const analyzeUrl = async () => {
    if (!imageUrl) return
    setAiLoading(true)
    setImagePreview(imageUrl)
    setUploadedImageUrl(imageUrl)
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/ai/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dayem_token')}` },
        body: JSON.stringify({ imageUrl })
      }).then(r => r.json())
      if (res.success) setForm({ nameAr: res.product.nameAr || '', name: res.product.name || '', description: res.product.description || '', price: res.product.suggestedPrice || '', stock: '10', category: res.product.category || '' })
    } catch { }
    setAiLoading(false)
  }

  const submit = async e => {
    e.preventDefault()
    setUploading(true)
    try {
      let images = []
      if (uploadedImageUrl) images = [{ url: uploadedImageUrl }]
      else if (fileRef.current) {
        const r = await merchantAPI.uploadImage(fileRef.current)
        if (r.success) images = [{ url: r.url }]
      } else if (editing) {
        images = products.find(p => p._id === editing)?.images || []
      }
      const data = { nameAr: form.nameAr || form.name, name: form.name || form.nameAr, description: form.description, price: Number(form.price), stock: Number(form.stock), category: form.category, images }
      const res = editing ? await merchantAPI.updateProduct(editing, data) : await merchantAPI.addProduct(data)
      if (res.success) { setShowForm(false); fileRef.current = null; setImagePreview(null); setUploadedImageUrl(null); load() }
      else alert('فشل الحفظ: ' + (res.message || 'خطأ'))
    } catch (err) { alert('حدث خطأ: ' + err.message) }
    setUploading(false)
  }

  const del = async id => {
    if (!window.confirm('هتحذف المنتج؟')) return
    await merchantAPI.deleteProduct(id)
    load()
  }

  const cols = isMobile ? (w < 480 ? 2 : 3) : 4

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <Sidebar active="products" />
      <div style={{ flex: 1, marginRight: isMobile ? 0 : 240, padding: isMobile ? '68px 16px 24px' : '36px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 20 : 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 1, background: '#D4AF37' }} />
              <span style={{ fontSize: '.55rem', letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800 }}>إدارة المنتجات</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>المنتجات</h1>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>{products.length} منتج</p>
          </div>
          <button onClick={() => openAdd()} style={{ background: '#D4AF37', color: '#0C2540', border: 'none', padding: isMobile ? '10px 14px' : '12px 24px', fontFamily: 'Tajawal', fontSize: isMobile ? '.75rem' : '.82rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span>✦</span>
            {isMobile ? 'إضافة' : 'إضافة بالـ AI'}
          </button>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.02)' }}>
            <div style={{ fontSize: '2rem', color: 'rgba(212,175,55,.15)', marginBottom: 14 }}>◆</div>
            <h3 style={{ color: 'rgba(255,255,255,.4)', marginBottom: 8, fontSize: '.95rem' }}>مفيش منتجات لسه</h3>
            <button onClick={() => openAdd()} style={{ background: '#D4AF37', color: '#0C2540', border: 'none', padding: '10px 22px', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.8rem', marginTop: 12 }}>
              ✦ أضف أول منتج
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 10 : 14 }}>
            {products.map(p => (
              <div key={p._id} style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,.25)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: 'rgba(255,255,255,.03)' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: isMobile ? 4 : 8 }} />
                      : <span style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', color: 'rgba(212,175,55,.1)' }}>◆</span>
                    }
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #113459, #D4AF37)' }} />
                  {p.stock === 0 && (
                    <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,.9)', color: '#fff', fontSize: '.52rem', padding: '2px 7px', fontWeight: 700 }}>نفذ</div>
                  )}
                </div>
                <div style={{ padding: isMobile ? '8px 8px 10px' : '12px 14px' }}>
                  {p.category && <div style={{ fontSize: '.5rem', letterSpacing: 1.5, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{p.category}</div>}
                  <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: 5, fontSize: isMobile ? '.75rem' : '.88rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.nameAr || p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? '.9rem' : '1.05rem', fontWeight: 700, color: '#D4AF37' }}>{p.price} <span style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Tajawal' }}>ج</span></span>
                    <span style={{ fontSize: '.55rem', color: p.stock > 0 ? '#86EFAC' : '#FCA5A5', background: p.stock > 0 ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', padding: '2px 6px', fontWeight: 700 }}>{p.stock > 0 ? `${p.stock}` : 'نفذ'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openAdd(p)} style={{ flex: 1, padding: '6px 0', background: 'transparent', color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.08)', fontFamily: 'Tajawal', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '.68rem' : '.72rem', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.color = '#D4AF37' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)' }}>تعديل</button>
                    <button onClick={() => del(p._id)} style={{ flex: 1, padding: '6px 0', background: 'transparent', color: 'rgba(239,68,68,.45)', border: '1px solid rgba(239,68,68,.1)', fontFamily: 'Tajawal', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '.68rem' : '.72rem', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.color = '#FCA5A5' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,.45)' }}>حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20 }}>
            <div style={{ background: '#0A1628', border: '1px solid rgba(212,175,55,.15)', width: '100%', maxWidth: isMobile ? '100%' : 540, maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', position: 'relative', borderRadius: isMobile ? '16px 16px 0 0' : 0 }}>
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
              {isMobile && <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '10px auto 0' }} />}

              <div style={{ padding: isMobile ? '16px 18px' : '20px 26px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 3 }}>{editing ? 'تعديل' : 'منتج جديد'}</div>
                  <h2 style={{ fontSize: '.95rem', fontWeight: 900, color: '#fff' }}>✦ الذكاء الاصطناعي يكتب البيانات</h2>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.35)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>✕</button>
              </div>

              <div style={{ padding: isMobile ? '16px 18px' : '20px 26px' }}>
                {/* Image Upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 7, letterSpacing: 2, textTransform: 'uppercase' }}>صورة المنتج</label>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{ border: `2px dashed ${imagePreview ? 'rgba(212,175,55,.4)' : 'rgba(212,175,55,.12)'}`, minHeight: isMobile ? 110 : 140, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} style={{ width: '100%', height: isMobile ? 120 : 150, objectFit: 'contain' }} />
                          {uploadedImageUrl && <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(34,197,94,.9)', color: '#fff', fontSize: '.55rem', padding: '2px 7px', fontWeight: 700 }}>✓ تم الرفع</div>}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.6))', padding: '8px', textAlign: 'center', fontSize: '.62rem', color: '#D4AF37' }}>اضغط لتغيير</div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                          <div style={{ fontSize: '1.8rem', color: 'rgba(212,175,55,.2)', marginBottom: 8 }}>◆</div>
                          <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: 3 }}>ارفع صورة المنتج</div>
                          <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.15)' }}>الـ AI يحلل ويكتب تلقائياً</div>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  </label>

                  {aiLoading && (
                    <div style={{ marginTop: 8, padding: '9px 12px', background: 'rgba(212,175,55,.04)', border: '1px solid rgba(212,175,55,.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 5, height: 5, background: '#D4AF37', borderRadius: '50%', opacity: .7 }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '.72rem', color: '#D4AF37', fontWeight: 600 }}>الذكاء الاصطناعي يحلل...</span>
                    </div>
                  )}
                </div>

                {/* URL Input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 6, letterSpacing: 2, textTransform: 'uppercase' }}>أو رابط صورة</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                      style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', fontFamily: 'Tajawal', fontSize: '.85rem', color: '#fff', outline: 'none' }} />
                    <button onClick={analyzeUrl} disabled={aiLoading || !imageUrl} style={{ background: '#D4AF37', color: '#0C2540', border: 'none', padding: '10px 14px', fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer', fontSize: '.75rem', flexShrink: 0 }}>
                      {aiLoading ? '...' : '✦'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                  <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.18)', letterSpacing: 2 }}>أو عدّل يدوياً</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                </div>

                <form onSubmit={submit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { name: 'nameAr', label: 'الاسم بالعربي', placeholder: 'حذاء رياضي', required: true },
                      { name: 'name', label: 'الاسم بالإنجليزي', placeholder: 'Sports Shoe' },
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ display: 'block', fontSize: '.58rem', fontWeight: 700, color: 'rgba(255,255,255,.28)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                        <input name={f.name} type="text" placeholder={f.placeholder} required={f.required} value={form[f.name]}
                          onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', background: form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)', border: `1px solid ${form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.06)'}`, fontFamily: 'Tajawal', fontSize: '.85rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>

                  {[
                    { name: 'description', label: 'الوصف', placeholder: 'وصف مقنع...', required: true },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: '.58rem', fontWeight: 700, color: 'rgba(255,255,255,.28)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                      <input name={f.name} type="text" placeholder={f.placeholder} required={f.required} value={form[f.name]}
                        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', background: form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)', border: `1px solid ${form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.06)'}`, fontFamily: 'Tajawal', fontSize: '.85rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                      { name: 'price', label: 'السعر', placeholder: '250', type: 'number', required: true },
                      { name: 'stock', label: 'الكمية', placeholder: '10', type: 'number', required: true },
                      { name: 'category', label: 'الفئة', placeholder: 'أحذية...' },
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ display: 'block', fontSize: '.58rem', fontWeight: 700, color: 'rgba(255,255,255,.28)', marginBottom: 5, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</label>
                        <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} required={f.required} value={form[f.name]}
                          onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', background: form[f.name] ? 'rgba(212,175,55,.04)' : 'rgba(255,255,255,.03)', border: `1px solid ${form[f.name] ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.06)'}`, fontFamily: 'Tajawal', fontSize: '.85rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={uploading} style={{ flex: 1, padding: 13, background: uploading ? 'rgba(212,175,55,.3)' : '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontWeight: 900, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '.85rem' }}>
                      {uploading ? '⏳ جاري...' : editing ? 'حفظ التعديلات' : '+ إضافة'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '13px 16px', background: 'transparent', color: 'rgba(255,255,255,.28)', border: '1px solid rgba(255,255,255,.06)', fontFamily: 'Tajawal', fontWeight: 600, cursor: 'pointer', fontSize: '.82rem' }}>إلغاء</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
