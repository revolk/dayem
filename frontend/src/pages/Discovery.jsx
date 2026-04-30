// frontend/src/pages/Discovery.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = `http://${window.location.hostname}:5000/api`
const G = '#D4AF37'
const BG = '#060F1E'
const SURF = '#0D1B2E'
const CARD = '#112240'

const CATS = ['الكل','ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى']
const GOVS = ['الكل','القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']
const CAT_ICONS = {'ملابس وأزياء':'👗','إلكترونيات':'📱','أغذية ومشروبات':'🍕','مستلزمات منزلية':'🏠','مستحضرات تجميل':'💄','رياضة ولياقة':'⚽','كتب وتعليم':'📚','هدايا وتذكارات':'🎁','أخرى':'✨'}
const PLAN_C = { starter:'#6B7280', tajer:'#60A5FA', pro:'#D4AF37' }
const PLAN_L = { starter:'ستارتر', tajer:'تاجر', pro:'برو' }

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h) }, [])
  return w
}

const Stars = ({ rating, count }) => (
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:11, color: s <= Math.round(rating) ? '#FCD34D' : 'rgba(255,255,255,.15)' }}>★</span>
      ))}
    </div>
    {count > 0 && <span style={{ fontSize:'.62rem', color:'rgba(255,255,255,.3)', fontFamily:'Tajawal' }}>({count})</span>}
  </div>
)

const StoreCard = ({ store, onClick }) => {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#152848' : CARD,
        border: `1px solid ${hov ? 'rgba(212,175,55,.3)' : 'rgba(255,255,255,.06)'}`,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'all .25s', boxShadow: hov ? '0 8px 32px rgba(0,0,0,.3)' : 'none',
      }}>
      {/* Gold top line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${G}${hov?'aa':'44'},transparent)`, transition:'all .3s' }} />

      {/* Logo / Cover */}
      <div style={{ height:100, background: store.logo ? 'transparent' : `linear-gradient(135deg,${SURF},${CARD})`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {store.logo
          ? <img src={store.logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: hov ? 1 : .9, transition:'opacity .3s' }} />
          : <div style={{ fontFamily:'Playfair Display, serif', fontSize:'2.5rem', fontWeight:700, color:`${G}44` }}>{store.name?.charAt(0)}</div>
        }
        {/* Category badge */}
        {store.category && (
          <div style={{ position:'absolute', top:8, right:8, background:'rgba(6,15,30,.85)', border:'1px solid rgba(255,255,255,.08)', padding:'3px 8px', fontSize:'.58rem', color:'rgba(255,255,255,.6)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:4 }}>
            <span>{CAT_ICONS[store.category] || '✨'}</span>
            <span>{store.category}</span>
          </div>
        )}
        {/* Plan badge */}
        {store.plan && store.plan !== 'starter' && (
          <div style={{ position:'absolute', top:8, left:8, background:`${PLAN_C[store.plan]}15`, border:`1px solid ${PLAN_C[store.plan]}40`, padding:'2px 7px', fontSize:'.55rem', color:PLAN_C[store.plan], fontFamily:'Tajawal', fontWeight:700 }}>
            {store.plan === 'pro' ? '⭐ ' : ''}{PLAN_L[store.plan]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ marginBottom:8 }}>
          <h3 style={{ fontFamily:'Tajawal', fontSize:'.92rem', fontWeight:900, color:'#fff', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {store.name}
          </h3>
          {store.description && (
            <p style={{ fontSize:'.72rem', color:'rgba(255,255,255,.35)', fontFamily:'Tajawal', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {store.description}
            </p>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {store.governorate && (
              <span style={{ fontSize:'.62rem', color:'rgba(255,255,255,.3)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:3 }}>
                📍 {store.governorate}
              </span>
            )}
          </div>
          <Stars rating={store.rating} count={store.reviewCount} />
        </div>

        {/* CTA */}
        <div style={{ marginTop:12, padding:'8px', background: hov ? `${G}15` : 'rgba(255,255,255,.03)', border:`1px solid ${hov ? G+'40' : 'rgba(255,255,255,.06)'}`, textAlign:'center', transition:'all .25s' }}>
          <span style={{ fontSize:'.72rem', fontWeight:700, color: hov ? G : 'rgba(255,255,255,.4)', fontFamily:'Tajawal' }}>
            دخول المتجر ←
          </span>
        </div>
      </div>
    </div>
  )
}

const Skel = () => (
  <div style={{ background:CARD, border:'1px solid rgba(255,255,255,.04)', overflow:'hidden' }}>
    <div style={{ height:100, background:'rgba(255,255,255,.03)', animation:'sk 1.8s ease infinite', backgroundSize:'200% 100%' }} />
    <div style={{ padding:'14px 16px' }}>
      <div style={{ height:14, background:'rgba(255,255,255,.05)', marginBottom:8, width:'70%' }} />
      <div style={{ height:10, background:'rgba(255,255,255,.03)', marginBottom:6, width:'90%' }} />
      <div style={{ height:10, background:'rgba(255,255,255,.03)', width:'60%' }} />
    </div>
  </div>
)

export default function Discovery() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 768
  const customer = JSON.parse(localStorage.getItem('dayem_customer') || '{}')
  const isLoggedIn = !!localStorage.getItem('dayem_customer_token')

  const [stores, setStores]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [govFilter, setGovFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [locating, setLocating] = useState(false)
  const searchTimer = useRef(null)

  const load = async (s, c, g, p) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 12 })
    if (s) params.set('search', s)
    if (c && c !== 'الكل') params.set('category', c)
    if (g && g !== 'الكل') params.set('governorate', g)
    const res = await fetch(`${BASE}/store?${params}`).then(r => r.json())
    if (res.success) { setStores(res.stores); setTotalPages(res.pages); setTotal(res.total) }
    setLoading(false)
  }

  useEffect(() => { load(search, category, govFilter, page) }, [category, govFilter, page])

  const onSearch = v => {
    setSearch(v); setPage(1)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(v, category, govFilter, 1), 500)
  }

  const detectLocation = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`)
          const data = await res.json()
          const gov = data.address?.state || data.address?.county || ''
          // Match to our govs list
          const matched = GOVS.find(g => g !== 'الكل' && gov.includes(g.replace('ال','')))
          if (matched) { setGovFilter(matched); setPage(1) }
        } catch {}
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Tajawal', direction:'rtl', color:'#EAE0C8' }}>
      <style>{`
        @keyframes sk{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade{animation:fi .4s ease both}
        input::placeholder,select option{color:rgba(255,255,255,.3)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2);border-radius:2px}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:SURF, borderBottom:'1px solid rgba(255,255,255,.06)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
        <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '12px 16px' : '14px 32px', display:'flex', alignItems:'center', gap:mob?10:20 }}>
          {/* Logo */}
          <div onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:34, height:34, border:`1.5px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', color:G, fontSize:'1rem' }}>∞</div>
            {!mob && (
              <div>
                <div style={{ fontWeight:900, color:'#fff', fontSize:'.88rem', letterSpacing:1.5 }}>دايم</div>
                <div style={{ fontSize:'.38rem', letterSpacing:3, color:`${G}70`, textTransform:'uppercase' }}>DISCOVER</div>
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:`${G}60`, fontSize:'.8rem', pointerEvents:'none' }}>🔍</span>
            <input value={search} onChange={e => onSearch(e.target.value)}
              placeholder="ابحث عن متجر أو منتج..."
              style={{ width:'100%', padding:'10px 38px 10px 14px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', fontFamily:'Tajawal', fontSize:'.85rem', color:'#fff', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
          </div>

          {/* Account */}
          {isLoggedIn ? (
            <button onClick={() => nav('/customer/dashboard')}
              style={{ padding:'9px 14px', background:`${G}15`, border:`1px solid ${G}35`, color:G, fontFamily:'Tajawal', fontSize:'.78rem', fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              👤 {mob ? '' : customer.name?.split(' ')[0]}
            </button>
          ) : (
            <button onClick={() => nav('/auth')}
              style={{ padding:'9px 14px', background:'transparent', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.5)', fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              {mob ? '👤' : 'دخول'}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(180deg,${SURF},${BG})`, padding: mob ? '28px 16px 20px' : '48px 32px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'20vw', color:'rgba(212,175,55,.03)', fontWeight:900, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>∞</div>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:'.52rem', letterSpacing:4, color:`${G}88`, textTransform:'uppercase', fontWeight:800, marginBottom:10 }}>اكتشف · تسوق · استمتع</div>
          <h1 style={{ fontFamily:'Playfair Display, serif', fontSize: mob ? '1.8rem' : '2.8rem', fontWeight:700, color:'#fff', marginBottom:8, letterSpacing:-1 }}>
            اكتشف <em style={{ color:G, fontStyle:'italic' }}>متاجر</em> مصر
          </h1>
          <p style={{ fontSize: mob ? '.78rem' : '.88rem', color:'rgba(255,255,255,.35)', maxWidth:500, margin:'0 auto' }}>
            آلاف المتاجر المصرية في مكان واحد — اشتري من المتجر الأقرب ليك
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '16px' : '24px 32px' }}>

        {/* ── Filters ── */}
        <div style={{ marginBottom:20 }}>
          {/* Location + Governorate */}
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={detectLocation} disabled={locating}
              style={{ padding:'9px 14px', background: govFilter && govFilter !== 'الكل' ? `${G}15` : 'rgba(255,255,255,.04)', border:`1px solid ${govFilter && govFilter !== 'الكل' ? G+'35' : 'rgba(255,255,255,.1)'}`, color: govFilter && govFilter !== 'الكل' ? G : 'rgba(255,255,255,.5)', fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all .2s', flexShrink:0 }}>
              {locating ? '⏳' : '📍'} {locating ? 'جاري التحديد...' : govFilter && govFilter !== 'الكل' ? govFilter : 'موقعي'}
            </button>
            <select value={govFilter} onChange={e => { setGovFilter(e.target.value); setPage(1) }}
              style={{ flex:1, minWidth:140, maxWidth:200, padding:'9px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', fontFamily:'Tajawal', fontSize:'.82rem', color: govFilter && govFilter !== 'الكل' ? '#fff' : 'rgba(255,255,255,.4)', outline:'none' }}>
              {GOVS.map(g => <option key={g} value={g} style={{ background:'#0C2540' }}>{g}</option>)}
            </select>
            {(govFilter && govFilter !== 'الكل') && (
              <button onClick={() => { setGovFilter(''); setPage(1) }}
                style={{ padding:'9px 12px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#FCA5A5', fontFamily:'Tajawal', fontSize:'.75rem', cursor:'pointer' }}>
                ✕ إلغاء الفلتر
              </button>
            )}
          </div>

          {/* Categories */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
            {CATS.map(c => (
              <button key={c} onClick={() => { setCategory(c==='الكل'?'':c); setPage(1) }}
                style={{ padding:'7px 14px', background: (category === c || (!category && c === 'الكل')) ? G : 'rgba(255,255,255,.04)', border:`1px solid ${(category === c || (!category && c === 'الكل')) ? G : 'rgba(255,255,255,.08)'}`, color: (category === c || (!category && c === 'الكل')) ? '#0C2540' : 'rgba(255,255,255,.5)', fontFamily:'Tajawal', fontSize:'.75rem', cursor:'pointer', fontWeight:(category === c || (!category && c === 'الكل')) ? 700 : 400, transition:'all .2s', whiteSpace:'nowrap', flexShrink:0 }}>
                {c !== 'الكل' && CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ''}{c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results Count ── */}
        {!loading && (
          <div style={{ marginBottom:16, fontSize:'.72rem', color:'rgba(255,255,255,.3)', fontFamily:'Tajawal' }}>
            {total > 0 ? `${total} متجر` : 'لا توجد متاجر'}
            {category && category !== 'الكل' ? ` في ${category}` : ''}
            {govFilter && govFilter !== 'الكل' ? ` · ${govFilter}` : ''}
          </div>
        )}

        {/* ── Grid ── */}
        <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr 1fr' : `repeat(auto-fill, minmax(220px, 1fr))`, gap: mob ? 10 : 16, marginBottom:24 }}>
          {loading
            ? Array(12).fill(0).map((_,i) => <Skel key={i} />)
            : stores.length === 0
            ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,.2)' }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>🔍</div>
                <p style={{ fontFamily:'Tajawal', fontSize:'.88rem' }}>مفيش متاجر بالمواصفات دي</p>
                <button onClick={() => { setSearch(''); setCategory(''); setGovFilter(''); setPage(1) }}
                  style={{ marginTop:14, padding:'9px 20px', background:'transparent', border:`1px solid ${G}40`, color:`${G}80`, fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer' }}>
                  إلغاء كل الفلاتر
                </button>
              </div>
            )
            : stores.map((s, i) => (
              <div key={s._id} className="fade" style={{ animationDelay:`${i * 0.05}s` }}>
                <StoreCard store={s} onClick={() => nav(`/store/${s.slug}`)} />
              </div>
            ))
          }
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
            {page > 1 && (
              <button onClick={() => setPage(p => p-1)}
                style={{ padding:'9px 16px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer' }}>
                → السابق
              </button>
            )}
            {Array.from({ length:totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width:36, height:36, background: page===p ? G : 'transparent', border:`1px solid ${page===p ? G : 'rgba(255,255,255,.1)'}`, color: page===p ? '#0C2540' : 'rgba(255,255,255,.4)', fontFamily:'Playfair Display, serif', fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button onClick={() => setPage(p => p+1)}
                style={{ padding:'9px 16px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer' }}>
                ← التالي
              </button>
            )}
          </div>
        )}

        {/* ── للتجار ── */}
        <div style={{ background:'rgba(212,175,55,.04)', border:'1px solid rgba(212,175,55,.12)', padding: mob ? '20px 16px' : '24px 28px', textAlign:'center', position:'relative', overflow:'hidden', marginBottom:20 }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
          <div style={{ fontSize:'.5rem', letterSpacing:4, color:`${G}88`, textTransform:'uppercase', fontWeight:800, marginBottom:10 }}>للتجار</div>
          <h3 style={{ fontFamily:'Playfair Display, serif', fontSize: mob ? '1.2rem' : '1.5rem', fontWeight:700, color:'#fff', marginBottom:8 }}>
            ابدأ متجرك على <em style={{ color:G, fontStyle:'italic' }}>دايم</em> في ٥ دقايق
          </h3>
          <p style={{ fontSize:'.78rem', color:'rgba(255,255,255,.35)', marginBottom:18 }}>بدون خبرة تقنية — متجر كامل بـ 100 ج/شهر</p>
          <button onClick={() => nav('/register')}
            style={{ padding:'12px 32px', background:G, border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:900, fontSize:'.88rem', cursor:'pointer', transition:'all .25s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            ابدأ مجاناً ←
          </button>
        </div>
      </div>
    </div>
  )
}
