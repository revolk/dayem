import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { merchantAPI, BASE } from '../../services/api'

const G = '#D4AF37'
const CARD = '#0C1E35'
const BG = '#060F1E'

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('dayem_token')}` })

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

const CATS = ['ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى']

const Toast = ({ msg, type }) => (
  <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#070D1A', border:`1px solid ${type==='error'?'rgba(239,68,68,.3)':'rgba(34,197,94,.3)'}`, padding:'12px 20px', zIndex:9999, display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 32px rgba(0,0,0,.5)', minWidth:240, animation:'toastIn .3s ease both' }}>
    <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    <span>{type==='error'?'⚠️':'✓'}</span>
    <span style={{ fontFamily:'Tajawal', fontSize:'.82rem', fontWeight:600, color:'#fff' }}>{msg}</span>
  </div>
)

// ── Multi-image uploader ──────────────────────────────────
function ImageUploader({ images, onChange, loading, setLoading }) {
  const inputRef = useRef()

  const upload = async (files) => {
    if (!files?.length) return
    setLoading(true)
    const newImgs = [...images]
    for (const file of Array.from(files)) {
      if (newImgs.length >= 5) break
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await fetch(`${BASE}/upload/image`, {
          method: 'POST', headers: auth(), body: formData
        }).then(r => r.json())
        if (res.success) newImgs.push({ url: res.url, publicId: res.publicId, isPrimary: newImgs.length === 0 })
      } catch {}
    }
    onChange(newImgs)
    setLoading(false)
  }

  const remove = async (idx) => {
    const img = images[idx]
    if (img.publicId) {
      await fetch(`${BASE}/upload/image`, { method:'DELETE', headers:{ ...auth(), 'Content-Type':'application/json' }, body: JSON.stringify({ publicId: img.publicId }) })
    }
    const updated = images.filter((_,i) => i !== idx).map((img, i) => ({ ...img, isPrimary: i === 0 }))
    onChange(updated)
  }

  const setPrimary = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  return (
    <div>
      <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:8, letterSpacing:2, textTransform:'uppercase' }}>
        الصور ({images.length}/5)
      </label>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position:'relative', paddingTop:'100%', background:CARD, border:`2px solid ${img.isPrimary?G:'rgba(255,255,255,.07)'}` }}>
            <img src={img.url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
            {img.isPrimary && <div style={{ position:'absolute', top:3, right:3, background:G, color:'#0C2540', fontSize:'.42rem', fontWeight:900, padding:'1px 4px' }}>رئيسية</div>}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:2, padding:3, background:'rgba(0,0,0,.6)' }}>
              {!img.isPrimary && <button type="button" onClick={() => setPrimary(i)} style={{ flex:1, padding:'2px 0', background:`${G}30`, border:`1px solid ${G}50`, color:G, fontSize:'.45rem', cursor:'pointer' }}>رئيسية</button>}
              <button type="button" onClick={() => remove(i)} style={{ flex:1, padding:'2px 0', background:'rgba(239,68,68,.2)', border:'1px solid rgba(239,68,68,.3)', color:'#FCA5A5', fontSize:'.45rem', cursor:'pointer' }}>حذف</button>
            </div>
          </div>
        ))}
        {images.length < 5 && (
          <div onClick={() => inputRef.current?.click()}
            style={{ paddingTop:'100%', position:'relative', background:'rgba(255,255,255,.03)', border:`2px dashed ${loading?G:'rgba(255,255,255,.1)'}`, cursor:'pointer', transition:'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = loading ? G : 'rgba(255,255,255,.1)'}>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
              {loading ? <div style={{ fontSize:'.9rem', animation:'spin 1s linear infinite' }}>⏳</div> : <><div style={{ fontSize:'1.2rem' }}>📷</div><div style={{ fontSize:'.45rem', color:'rgba(255,255,255,.3)' }}>إضافة</div></>}
            </div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => upload(e.target.files)} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Product Form ──────────────────────────────────────────
function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    nameAr:       product?.nameAr       || '',
    description:  product?.description  || '',
    price:        product?.price        || '',
    comparePrice: product?.comparePrice || '',
    category:     product?.category     || '',
    stock:        product?.stock        ?? 0,
    images:       product?.images       || [],
    isActive:     product?.isActive     ?? true,
  })
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const f = k => e => setForm({ ...form, [k]: e.target.value })

  const generateAI = async () => {
    // Need at least an image OR a product name
    const hasImage = form.images?.length > 0
    if (!hasImage && !form.nameAr) return

    setAiLoading(true)
    try {
      if (hasImage) {
        // ── Vision mode: analyze product image ──
        const imageUrl = form.images[0].url
        const res = await fetch(`${BASE}/ai/analyze-product`, {
          method: 'POST',
          headers: { ...auth(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        }).then(r => r.json())

        if (res.success && res.product) {
          const p = res.product
          setForm(f => ({
            ...f,
            nameAr:       p.nameAr       || f.nameAr,
            description:  p.description  || f.description,
            category:     p.category     || f.category,
            price:        p.suggestedPrice ? String(p.suggestedPrice) : f.price,
          }))
        }
      } else {
        // ── Text mode: generate description from name ──
        const res = await fetch(`${BASE}/ai/store-description`, {
          method: 'POST',
          headers: { ...auth(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ storeName: form.nameAr, category: form.category || 'منتجات متنوعة' })
        }).then(r => r.json())

        if (res.success) setForm(f => ({ ...f, description: res.description }))
      }
    } catch (err) {
      console.error('AI Error:', err)
    }
    setAiLoading(false)
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.nameAr || !form.price) return
    if (!form.images?.length) return alert('أضف صورة واحدة على الأقل')
    setSaving(true)
    const data = { ...form, price: Number(form.price), comparePrice: Number(form.comparePrice) || undefined, stock: Number(form.stock) }
    const res = product
      ? await merchantAPI.updateProduct(product._id, data)
      : await merchantAPI.addProduct(data)
    if (res.success) onSave(res.product)
    setSaving(false)
  }

  const inp = val => ({
    width:'100%', padding:'11px 14px', boxSizing:'border-box',
    background: val?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)',
    border:`1px solid ${val?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}`,
    fontFamily:'Tajawal', fontSize:'.88rem', color:'#fff', outline:'none', transition:'all .2s'
  })

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:'#070D1A', border:`1px solid rgba(212,175,55,.15)`, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto', margin:'20px', animation:'fi .3s ease' }}>
        <style>{`@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
        <div style={{ position:'sticky', top:0, background:'#070D1A', padding:'16px 20px', borderBottom:`1px solid rgba(255,255,255,.06)`, display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:1 }}>
          <div style={{ fontSize:'.55rem', letterSpacing:3, color:G, textTransform:'uppercase', fontWeight:800 }}>
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.4)', width:30, height:30, cursor:'pointer', fontSize:'.85rem' }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding:'20px' }}>
          <ImageUploader images={form.images} onChange={imgs => setForm({...form, images:imgs})} loading={uploading} setLoading={setUploading} />

          <div style={{ marginTop:16, marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>اسم المنتج *</label>
            <input value={form.nameAr} onChange={f('nameAr')} placeholder="مثال: قميص قطني أبيض" required style={inp(form.nameAr)}
              onFocus={e=>{e.target.style.borderColor=G}} onBlur={e=>{e.target.style.borderColor=form.nameAr?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}} />
          </div>

          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <label style={{ fontSize:'.55rem', fontWeight:700, color:`${G}88`, letterSpacing:2, textTransform:'uppercase' }}>الوصف</label>
              <button type="button" onClick={generateAI}
                disabled={aiLoading || (!form.nameAr && !form.images?.length)}
                style={{ padding:'4px 12px', background:aiLoading?`${G}08`:`${G}15`, border:`1px solid ${G}${aiLoading?'20':'40'}`, color:aiLoading?`${G}60`:G, fontFamily:'Tajawal', fontSize:'.62rem', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:5, transition:'all .2s' }}>
                {aiLoading
                  ? <><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span> جاري التحليل...</>
                  : <><span>✨</span> {form.images?.length ? 'تحليل الصورة' : 'توليد وصف'}</>
                }
              </button>
            </div>
            <textarea value={form.description} onChange={f('description')} placeholder="وصف المنتج..." rows={3}
              style={{ ...inp(form.description), resize:'vertical' }}
              onFocus={e=>{e.target.style.borderColor=G}} onBlur={e=>{e.target.style.borderColor=form.description?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>السعر (ج) *</label>
              <input type="number" value={form.price} onChange={f('price')} placeholder="150" required min={0} style={inp(form.price)}
                onFocus={e=>{e.target.style.borderColor=G}} onBlur={e=>{e.target.style.borderColor=form.price?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>السعر الأصلي (اختياري)</label>
              <input type="number" value={form.comparePrice} onChange={f('comparePrice')} placeholder="200" min={0} style={inp(form.comparePrice)}
                onFocus={e=>{e.target.style.borderColor=G}} onBlur={e=>{e.target.style.borderColor=form.comparePrice?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>التصنيف</label>
              <select value={form.category} onChange={f('category')} style={{ ...inp(form.category), cursor:'pointer' }}>
                <option value="">بدون تصنيف</option>
                {CATS.map(c => <option key={c} value={c} style={{ background:'#0C2540' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, color:`${G}88`, marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>المخزون</label>
              <input type="number" value={form.stock} onChange={f('stock')} min={0} style={inp(form.stock)}
                onFocus={e=>{e.target.style.borderColor=G}} onBlur={e=>{e.target.style.borderColor=form.stock?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}} />
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'12px 14px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)' }}>
            <div onClick={() => setForm({...form, isActive:!form.isActive})}
              style={{ width:40, height:22, borderRadius:11, background:form.isActive?G:'rgba(255,255,255,.1)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, right:form.isActive?3:undefined, left:form.isActive?undefined:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'all .2s' }} />
            </div>
            <span style={{ fontSize:'.78rem', color:'rgba(255,255,255,.5)', fontFamily:'Tajawal' }}>
              {form.isActive ? 'المنتج ظاهر في المتجر' : 'المنتج مخفي'}
            </span>
          </div>

          <button type="submit" disabled={saving || uploading}
            style={{ width:'100%', padding:'13px', background:saving||uploading?'rgba(212,175,55,.4)':G, color:'#0C2540', border:'none', fontFamily:'Tajawal', fontSize:'.9rem', fontWeight:900, cursor:saving||uploading?'not-allowed':'pointer' }}>
            {saving ? '⏳ جاري الحفظ...' : uploading ? '⏳ جاري رفع الصور...' : product ? 'حفظ التعديلات ←' : 'إضافة المنتج ←'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Products Page ────────────────────────────────────
export default function Products() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 1024

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [modal, setModal]       = useState(null) // null | 'add' | product object
  const [toast, setToast]       = useState(null)
  const [deleting, setDeleting] = useState(null)

  const merchant = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')
  const maxProducts = merchant?.store?.maxProducts || 5
  const planName    = merchant?.store?.plan || 'starter'

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  const load = async () => {
    setLoading(true)
    const res = await merchantAPI.getProducts()
    if (res.success) setProducts(res.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const matchSearch = !search || p.nameAr?.includes(search) || p.description?.includes(search)
    const matchFilter = filter === 'all' || (filter === 'active' && p.isActive) || (filter === 'hidden' && !p.isActive)
    return matchSearch && matchFilter
  })

  const handleSave = (product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p._id === product._id)
      if (idx >= 0) { const n=[...prev]; n[idx]=product; return n }
      return [product, ...prev]
    })
    setModal(null)
    showToast(modal?._id ? 'تم تعديل المنتج' : 'تم إضافة المنتج')
  }

  const handleDelete = async (id) => {
    if (!confirm('هتحذف المنتج؟')) return
    setDeleting(id)
    const res = await merchantAPI.deleteProduct(id)
    if (res.success) {
      setProducts(prev => prev.filter(p => p._id !== id))
      showToast('تم حذف المنتج')
    } else showToast('خطأ في الحذف', 'error')
    setDeleting(null)
  }

  const canAdd = maxProducts === -1 || products.filter(p=>p.isActive).length < maxProducts

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Tajawal', direction:'rtl' }}>
      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .prod-card:hover{border-color:rgba(212,175,55,.25)!important;transform:translateY(-2px)}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2)}
        select option{background:#0C2540} input::placeholder{color:rgba(255,255,255,.2)!important}
      `}</style>

      <Sidebar active="products" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {modal !== null && <ProductForm product={modal==='add'?null:modal} onSave={handleSave} onClose={()=>setModal(null)} />}

      <div style={{ marginRight:mob?0:240, paddingTop:mob?52:0 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:mob?'16px 14px':'28px 36px' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
            <div>
              <div style={{ fontSize:'.48rem', letterSpacing:4, color:`${G}66`, textTransform:'uppercase', fontWeight:800, marginBottom:6 }}>إدارة</div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:mob?'1.3rem':'1.7rem', fontWeight:700, color:'#fff', marginBottom:4 }}>المنتجات</h1>
              <div style={{ fontSize:'.68rem', color:'rgba(255,255,255,.25)' }}>
                {products.filter(p=>p.isActive).length} / {maxProducts === -1 ? '∞' : maxProducts} منتج نشط
                {planName !== 'pro' && <span onClick={()=>nav('/dashboard/settings')} style={{ color:G, cursor:'pointer', marginRight:8 }}>← رقّي خطتك</span>}
              </div>
            </div>
            <button onClick={() => canAdd ? setModal('add') : showToast(`وصلت للحد الأقصى — رقّي خطتك`,'error')}
              style={{ padding:mob?'10px 16px':'11px 22px', background:canAdd?G:'rgba(212,175,55,.2)', border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:900, cursor:'pointer', fontSize:'.82rem', display:'flex', alignItems:'center', gap:6, transition:'all .2s' }}>
              + إضافة منتج
            </button>
          </div>

          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:180 }}>
              <span style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', color:`${G}44`, fontSize:'.76rem', pointerEvents:'none' }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث في المنتجات..."
                style={{ width:'100%', padding:'9px 34px 9px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', fontFamily:'Tajawal', fontSize:'.82rem', color:'#fff', outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.07)'} />
            </div>
            {['all','active','hidden'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:'9px 14px', background:filter===f?G:'transparent', border:`1px solid ${filter===f?G:'rgba(255,255,255,.07)'}`, color:filter===f?'#0C2540':'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.75rem', cursor:'pointer', fontWeight:filter===f?700:400, transition:'all .2s' }}>
                {f==='all'?'الكل':f==='active'?'نشط':'مخفي'}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:mob?'1fr 1fr':'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
              {Array(6).fill(0).map((_,i) => <div key={i} style={{ height:280, background:CARD, opacity:1-i*.12 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,.18)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📦</div>
              <p style={{ fontFamily:'Tajawal', fontSize:'.88rem', marginBottom:16 }}>
                {search ? 'مفيش نتايج للبحث' : 'مفيش منتجات — ابدأ بإضافة أول منتج!'}
              </p>
              {!search && canAdd && <button onClick={()=>setModal('add')} style={{ padding:'10px 24px', background:G, border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:700, cursor:'pointer' }}>+ إضافة منتج</button>}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:mob?'1fr 1fr':'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
              {filtered.map((p, i) => (
                <div key={p._id} className="prod-card"
                  style={{ background:CARD, border:'1px solid rgba(255,255,255,.06)', position:'relative', overflow:'hidden', transition:'all .3s', animation:`fi .35s ${i*.03}s ease both`, opacity:p.isActive?1:.6 }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${G}22,transparent)` }} />

                  {/* Image */}
                  <div style={{ height:160, background:'rgba(255,255,255,.03)', position:'relative', overflow:'hidden' }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(212,175,55,.1)', fontSize:'2rem' }}>◆</div>
                    }
                    {/* Image count badge */}
                    {p.images?.length > 1 && (
                      <div style={{ position:'absolute', bottom:6, left:6, background:'rgba(0,0,0,.7)', color:'#fff', fontSize:'.55rem', padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                        📷 {p.images.length}
                      </div>
                    )}
                    {!p.isActive && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'rgba(255,255,255,.6)', fontSize:'.72rem', fontFamily:'Tajawal' }}>مخفي</span></div>}
                    {p.comparePrice > p.price && (
                      <div style={{ position:'absolute', top:6, right:6, background:'#EF4444', color:'#fff', fontSize:'.55rem', fontWeight:900, padding:'2px 6px' }}>
                        خصم {Math.round((1-p.price/p.comparePrice)*100)}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding:'12px 12px 10px' }}>
                    <div style={{ fontSize:'.82rem', fontWeight:700, color:'#fff', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nameAr}</div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:G }}>{p.price} ج</span>
                      {p.comparePrice > p.price && <span style={{ fontSize:'.7rem', color:'rgba(255,255,255,.25)', textDecoration:'line-through' }}>{p.comparePrice} ج</span>}
                    </div>
                    {p.category && <div style={{ fontSize:'.6rem', color:'rgba(255,255,255,.25)', marginBottom:8 }}>{p.category}</div>}
                    <div style={{ display:'flex', gap:5, fontSize:'.6rem', color:'rgba(255,255,255,.25)', marginBottom:10 }}>
                      <span>مبيعات: {p.totalSold||0}</span>
                      {p.stock > 0 && <><span>·</span><span>مخزون: {p.stock}</span></>}
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={() => setModal(p)}
                        style={{ flex:1, padding:'7px 0', background:'transparent', border:`1px solid ${G}30`, color:`${G}80`, fontFamily:'Tajawal', fontSize:'.72rem', cursor:'pointer', fontWeight:700, transition:'all .2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.color=G}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=`${G}80`}}>
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deleting===p._id}
                        style={{ padding:'7px 10px', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.15)', color:'#FCA5A5', fontFamily:'Tajawal', fontSize:'.72rem', cursor:'pointer', transition:'all .2s' }}>
                        {deleting===p._id?'...':'✕'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
