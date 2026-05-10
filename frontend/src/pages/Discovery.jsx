// frontend/src/pages/Discovery.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ✅ FIX: Dynamic BASE URL
const BASE = window.location.protocol === 'https:'
  ? `${window.location.origin}/api`
  : `http://${window.location.hostname}:5000/api`

const G    = '#D4AF37'
const BG   = '#060F1E'
const SURF = '#0D1B2E'
const CARD = '#0C1E35'

const CATS = ['الكل','ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى']
const GOVS = ['الكل','القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']
const CAT_ICONS = {'ملابس وأزياء':'👗','إلكترونيات':'📱','أغذية ومشروبات':'🍕','مستلزمات منزلية':'🏠','مستحضرات تجميل':'💄','رياضة ولياقة':'⚽','كتب وتعليم':'📚','هدايا وتذكارات':'🎁','أخرى':'✨'}
const PLAN_C = { starter:'#6B7280', tajer:'#60A5FA', merchant:'#60A5FA', pro:'#D4AF37' }
const PLAN_L = { starter:'ستارتر', tajer:'تاجر', merchant:'تاجر', pro:'برو' }

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const Stars = ({ rating, count }) => (
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:11, color: s <= Math.round(rating||0) ? '#FCD34D' : 'rgba(255,255,255,.12)' }}>★</span>
      ))}
    </div>
    {count > 0 && <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.25)', fontFamily:'Tajawal' }}>({count})</span>}
  </div>
)

const StoreCard = ({ store, onClick }) => {
  const [hov, setHov] = useState(false)
  const plan = store.plan || 'starter'
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#0F2040' : CARD,
        border: `1px solid ${hov ? 'rgba(212,175,55,.25)' : 'rgba(255,255,255,.05)'}`,
        cursor:'pointer', position:'relative', overflow:'hidden',
        transition:'all .25s', boxShadow: hov ? '0 12px 40px rgba(0,0,0,.4),0 0 0 1px rgba(212,175,55,.08)' : '0 2px 8px rgba(0,0,0,.2)',
      }}>
      {/* Gold top line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${G}${hov?'99':'33'},transparent)`, transition:'all .3s' }} />

      {/* Cover */}
      <div style={{ height:96, background: store.logo ? 'transparent' : `linear-gradient(135deg,#0D1B2E,#112240)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {store.logo
          ? <img src={store.logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: hov ? 1 : .88, transition:'opacity .3s' }} />
          : <div style={{ fontFamily:'Playfair Display,serif', fontSize:'2.8rem', fontWeight:700, color:`${G}33` }}>{store.name?.charAt(0)?.toUpperCase()}</div>
        }
        {store.category && (
          <div style={{ position:'absolute', top:7, right:7, background:'rgba(6,15,30,.88)', border:'1px solid rgba(255,255,255,.07)', padding:'3px 7px', fontSize:'.56rem', color:'rgba(255,255,255,.55)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:3 }}>
            <span>{CAT_ICONS[store.category]||'✨'}</span><span>{store.category}</span>
          </div>
        )}
        {plan !== 'starter' && (
          <div style={{ position:'absolute', top:7, left:7, background:`${PLAN_C[plan]}18`, border:`1px solid ${PLAN_C[plan]}40`, padding:'2px 7px', fontSize:'.52rem', color:PLAN_C[plan], fontFamily:'Tajawal', fontWeight:700 }}>
            {plan === 'pro' ? '⭐ ' : '★ '}{PLAN_L[plan]||plan}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'12px 14px' }}>
        <h3 style={{ fontFamily:'Tajawal', fontSize:'.9rem', fontWeight:900, color:'#fff', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {store.name}
        </h3>
        {store.description && (
          <p style={{ fontSize:'.7rem', color:'rgba(255,255,255,.3)', fontFamily:'Tajawal', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginBottom:8 }}>
            {store.description}
          </p>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          {store.governorate && (
            <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.25)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:3 }}>
              📍 {store.governorate}
            </span>
          )}
          <Stars rating={store.rating} count={store.reviewCount} />
        </div>
        <div style={{ padding:'8px', background: hov ? `${G}12` : 'rgba(255,255,255,.02)', border:`1px solid ${hov ? G+'35' : 'rgba(255,255,255,.05)'}`, textAlign:'center', transition:'all .25s' }}>
          <span style={{ fontSize:'.72rem', fontWeight:700, color: hov ? G : 'rgba(255,255,255,.35)', fontFamily:'Tajawal' }}>
            دخول المتجر ←
          </span>
        </div>
      </div>
    </div>
  )
}

const Skel = () => (
  <div style={{ background:CARD, border:'1px solid rgba(255,255,255,.04)', overflow:'hidden' }}>
    <div style={{ height:96, background:'linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.03) 75%)', backgroundSize:'200% 100%', animation:'sk 1.8s ease infinite' }} />
    <div style={{ padding:'12px 14px' }}>
      <div style={{ height:13, background:'rgba(255,255,255,.05)', marginBottom:8, width:'65%' }} />
      <div style={{ height:9, background:'rgba(255,255,255,.03)', marginBottom:5, width:'90%' }} />
      <div style={{ height:9, background:'rgba(255,255,255,.03)', width:'55%' }} />
    </div>
  </div>
)

// ✅ FIX: Proper location detection with multiple fallbacks
const GOV_MAP = {
  'القاهرة': ['القاهرة','Cairo','قاهرة'],
  'الجيزة': ['الجيزة','Giza','جيزة'],
  'الإسكندرية': ['الإسكندرية','Alexandria','إسكندرية'],
  'الدقهلية': ['الدقهلية','Dakahlia','دقهلية'],
  'البحيرة': ['البحيرة','Beheira','بحيرة'],
  'الشرقية': ['الشرقية','Sharqia','شرقية'],
  'الغربية': ['الغربية','Gharbia','غربية'],
  'المنوفية': ['المنوفية','Monufia','منوفية'],
  'القليوبية': ['القليوبية','Qalyubia','قليوبية'],
  'الإسماعيلية': ['الإسماعيلية','Ismailia','إسماعيلية'],
  'السويس': ['السويس','Suez'],
  'بورسعيد': ['بورسعيد','Port Said'],
  'دمياط': ['دمياط','Damietta'],
  'المنيا': ['المنيا','Minya','منيا'],
  'أسيوط': ['أسيوط','Asyut','أسيوط'],
  'سوهاج': ['سوهاج','Sohag'],
  'قنا': ['قنا','Qena'],
  'الأقصر': ['الأقصر','Luxor','أقصر'],
  'أسوان': ['أسوان','Aswan'],
  'الفيوم': ['الفيوم','Fayoum','فيوم'],
  'بني سويف': ['بني سويف','Beni Suef'],
  'كفر الشيخ': ['كفر الشيخ','Kafr el-Sheikh'],
  'مطروح': ['مطروح','Matrouh','مرسى مطروح'],
  'الوادي الجديد': ['الوادي الجديد','New Valley'],
  'البحر الأحمر': ['البحر الأحمر','Red Sea'],
  'شمال سيناء': ['شمال سيناء','North Sinai'],
  'جنوب سيناء': ['جنوب سيناء','South Sinai'],
}

function matchGov(raw) {
  if (!raw) return null
  const r = raw.toLowerCase()
  for (const [govAr, aliases] of Object.entries(GOV_MAP)) {
    if (aliases.some(a => r.includes(a.toLowerCase()) || a.toLowerCase().includes(r.replace(/^ال/,'').slice(0,4)))) {
      return govAr
    }
  }
  return null
}

export default function Discovery() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 768
  const customer = JSON.parse(localStorage.getItem('dayem_customer') || '{}')
  const isLoggedIn = !!localStorage.getItem('dayem_customer_token')

  const [stores, setStores]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('')
  const [govFilter, setGovFilter] = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [locating, setLocating]   = useState(false)
  const [locErr, setLocErr]       = useState('')
  const searchTimer = useRef(null)

  const load = async (s, c, g, p) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 12 })
      if (s) params.set('search', s)
      if (c && c !== 'الكل') params.set('category', c)
      if (g && g !== 'الكل') params.set('governorate', g)
      const res = await fetch(`${BASE}/store?${params}`).then(r => r.json())
      if (res.success) {
        setStores(res.stores || [])
        setTotalPages(res.pages || 1)
        setTotal(res.total || 0)
      }
    } catch (e) {
      console.error('Discovery load error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { load(search, category, govFilter, page) }, [category, govFilter, page])

  const onSearch = v => {
    setSearch(v); setPage(1)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(v, category, govFilter, 1), 500)
  }

  // ✅ FIX: Robust location detection with proper Arabic gov matching
  const detectLocation = () => {
    setLocating(true)
    setLocErr('')

    if (!navigator.geolocation) {
      setLocErr('المتصفح مش بيدعم تحديد الموقع')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords

          // Try multiple geocoding APIs for better accuracy
          let matched = null

          // 1st try: Nominatim with Arabic language
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar&zoom=6`,
              { headers: { 'Accept-Language': 'ar' } }
            )
            const data = await res.json()
            const candidates = [
              data.address?.state,
              data.address?.county,
              data.address?.city,
              data.address?.town,
              data.address?.region,
            ].filter(Boolean)

            for (const c of candidates) {
              matched = matchGov(c)
              if (matched) break
            }

            // 2nd try with English if Arabic failed
            if (!matched) {
              const resEn = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en&zoom=6`
              )
              const dataEn = await resEn.json()
              const candidatesEn = [
                dataEn.address?.state,
                dataEn.address?.county,
                dataEn.address?.city,
              ].filter(Boolean)
              for (const c of candidatesEn) {
                matched = matchGov(c)
                if (matched) break
              }
            }
          } catch {}

          if (matched) {
            setGovFilter(matched)
            setPage(1)
          } else {
            setLocErr('مش قادر أحدد المحافظة — اختارها يدوي')
          }
        } catch {
          setLocErr('خطأ في تحديد الموقع')
        }
        setLocating(false)
      },
      (err) => {
        const msgs = {
          1: 'رفضت إذن الموقع — اختار المحافظة يدوي',
          2: 'مش قادر يحدد موقعك',
          3: 'انتهى وقت تحديد الموقع',
        }
        setLocErr(msgs[err.code] || 'خطأ في تحديد الموقع')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const clearFilters = () => { setSearch(''); setCategory(''); setGovFilter(''); setPage(1) }

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Tajawal', direction:'rtl', color:'#EAE0C8' }}>
      <style>{`
        @keyframes sk{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .fade{animation:fi .38s ease both}
        input::placeholder{color:rgba(255,255,255,.25)!important}
        select option{background:#0C2540;color:#fff}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2)}
        .cat-btn:hover{border-color:rgba(212,175,55,.3)!important;color:rgba(255,255,255,.7)!important}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:SURF, borderBottom:'1px solid rgba(255,255,255,.05)', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' }}>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
        <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '11px 14px' : '13px 32px', display:'flex', alignItems:'center', gap: mob ? 10 : 20 }}>
          {/* Logo */}
          <div onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:32, height:32, border:`1.5px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', color:G, fontSize:'.9rem' }}>∞</div>
            {!mob && (
              <div>
                <div style={{ fontWeight:900, color:'#fff', fontSize:'.85rem', letterSpacing:1.5 }}>دايم</div>
                <div style={{ fontSize:'.36rem', letterSpacing:3, color:`${G}60`, textTransform:'uppercase' }}>DISCOVER</div>
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', color:`${G}50`, fontSize:'.78rem', pointerEvents:'none' }}>🔍</span>
            <input value={search} onChange={e => onSearch(e.target.value)}
              placeholder="ابحث عن متجر أو منتج..."
              style={{ width:'100%', padding:'9px 36px 9px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', fontFamily:'Tajawal', fontSize:'.82rem', color:'#fff', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.07)'} />
          </div>

          {/* Account */}
          {isLoggedIn ? (
            <button onClick={() => nav('/customer/dashboard')}
              style={{ padding:'8px 13px', background:`${G}15`, border:`1px solid ${G}35`, color:G, fontFamily:'Tajawal', fontSize:'.76rem', fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              👤 {mob ? '' : customer.name?.split(' ')[0]}
            </button>
          ) : (
            <button onClick={() => nav('/customer/login')}
              style={{ padding:'8px 13px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.45)', fontFamily:'Tajawal', fontSize:'.76rem', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              {mob ? '👤' : 'دخول'}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(180deg,${SURF} 0%,${BG} 100%)`, padding: mob ? '28px 16px 20px' : '44px 32px 28px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'18vw', color:'rgba(212,175,55,.025)', fontWeight:900, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>∞</div>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:'.5rem', letterSpacing:4, color:`${G}77`, textTransform:'uppercase', fontWeight:800, marginBottom:10 }}>اكتشف · تسوق · استمتع</div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize: mob ? '1.7rem' : '2.6rem', fontWeight:700, color:'#fff', marginBottom:8, letterSpacing:-0.5 }}>
            اكتشف <em style={{ color:G, fontStyle:'italic' }}>متاجر</em> مصر
          </h1>
          <p style={{ fontSize: mob ? '.76rem' : '.86rem', color:'rgba(255,255,255,.3)', maxWidth:480, margin:'0 auto' }}>
            آلاف المتاجر المصرية في مكان واحد — اشتري من المتجر الأقرب ليك
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '14px 14px' : '22px 32px' }}>

        {/* ── Filters ── */}
        <div style={{ marginBottom:18 }}>

          {/* Location row */}
          <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={detectLocation} disabled={locating}
              style={{ padding:'8px 13px', background: govFilter && govFilter !== 'الكل' ? `${G}12` : 'rgba(255,255,255,.03)', border:`1px solid ${govFilter && govFilter !== 'الكل' ? G+'30' : 'rgba(255,255,255,.08)'}`, color: govFilter && govFilter !== 'الكل' ? G : 'rgba(255,255,255,.45)', fontFamily:'Tajawal', fontSize:'.76rem', cursor: locating ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:5, transition:'all .2s', flexShrink:0 }}>
              {locating ? '⏳' : '📍'} {locating ? 'جاري التحديد...' : govFilter && govFilter !== 'الكل' ? govFilter : 'موقعي'}
            </button>

            <select value={govFilter} onChange={e => { setGovFilter(e.target.value); setPage(1) }}
              style={{ flex:1, minWidth:130, maxWidth:190, padding:'8px 11px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', fontFamily:'Tajawal', fontSize:'.8rem', color: govFilter && govFilter !== 'الكل' ? '#fff' : 'rgba(255,255,255,.35)', outline:'none', cursor:'pointer' }}>
              {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {govFilter && govFilter !== 'الكل' && (
              <button onClick={() => { setGovFilter(''); setPage(1) }}
                style={{ padding:'8px 11px', background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.18)', color:'#FCA5A5', fontFamily:'Tajawal', fontSize:'.73rem', cursor:'pointer' }}>
                ✕ إلغاء الفلتر
              </button>
            )}
          </div>

          {/* Location error */}
          {locErr && (
            <div style={{ background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.15)', padding:'6px 12px', marginBottom:8, fontSize:'.72rem', color:'#FCA5A5', fontFamily:'Tajawal', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>⚠️ {locErr}</span>
              <span onClick={() => setLocErr('')} style={{ cursor:'pointer', opacity:.6 }}>✕</span>
            </div>
          )}

          {/* Categories */}
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:4 }}>
            {CATS.map(c => {
              const active = (category === c) || (!category && c === 'الكل')
              return (
                <button key={c} className="cat-btn"
                  onClick={() => { setCategory(c === 'الكل' ? '' : c); setPage(1) }}
                  style={{ padding:'6px 13px', background: active ? G : 'rgba(255,255,255,.03)', border:`1px solid ${active ? G : 'rgba(255,255,255,.07)'}`, color: active ? '#0C2540' : 'rgba(255,255,255,.45)', fontFamily:'Tajawal', fontSize:'.73rem', cursor:'pointer', fontWeight: active ? 800 : 400, transition:'all .2s', whiteSpace:'nowrap', flexShrink:0 }}>
                  {c !== 'الكل' && CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ''}{c}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <div style={{ marginBottom:14, fontSize:'.7rem', color:'rgba(255,255,255,.25)', fontFamily:'Tajawal', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>
              {total > 0 ? `${total} متجر` : 'لا توجد متاجر'}
              {category && category !== 'الكل' ? ` · ${category}` : ''}
              {govFilter && govFilter !== 'الكل' ? ` · ${govFilter}` : ''}
            </span>
            {(search || category || (govFilter && govFilter !== 'الكل')) && (
              <button onClick={clearFilters}
                style={{ background:'transparent', border:'none', color:'rgba(212,175,55,.4)', fontFamily:'Tajawal', fontSize:'.7rem', cursor:'pointer' }}>
                مسح الكل ✕
              </button>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr 1fr' : `repeat(auto-fill,minmax(210px,1fr))`, gap: mob ? 8 : 14, marginBottom:24 }}>
          {loading
            ? Array(12).fill(0).map((_,i) => <Skel key={i} />)
            : stores.length === 0
            ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'56px 0', color:'rgba(255,255,255,.18)' }}>
                <div style={{ fontSize:'2.8rem', marginBottom:12 }}>🔍</div>
                <p style={{ fontFamily:'Tajawal', fontSize:'.86rem', marginBottom:14 }}>مفيش متاجر بالمواصفات دي</p>
                <button onClick={clearFilters}
                  style={{ padding:'9px 22px', background:'transparent', border:`1px solid ${G}35`, color:`${G}70`, fontFamily:'Tajawal', fontSize:'.76rem', cursor:'pointer' }}>
                  إلغاء كل الفلاتر
                </button>
              </div>
            )
            : stores.map((s, i) => (
              <div key={s._id} className="fade" style={{ animationDelay:`${Math.min(i * 0.04, 0.3)}s` }}>
                <StoreCard store={s} onClick={() => nav(`/store/${s.slug}`)} />
              </div>
            ))
          }
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display:'flex', gap:5, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
            {page > 1 && (
              <button onClick={() => setPage(p => p-1)}
                style={{ padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.35)', fontFamily:'Tajawal', fontSize:'.76rem', cursor:'pointer' }}>
                → السابق
              </button>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_,i) => {
              const p = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width:34, height:34, background: page===p ? G : 'transparent', border:`1px solid ${page===p ? G : 'rgba(255,255,255,.08)'}`, color: page===p ? '#0C2540' : 'rgba(255,255,255,.35)', fontFamily:'Playfair Display,serif', fontWeight:700, cursor:'pointer', transition:'all .2s', fontSize:'.8rem' }}>
                  {p}
                </button>
              )
            })}
            {page < totalPages && (
              <button onClick={() => setPage(p => p+1)}
                style={{ padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.35)', fontFamily:'Tajawal', fontSize:'.76rem', cursor:'pointer' }}>
                ← التالي
              </button>
            )}
          </div>
        )}

        {/* ── CTA للتجار ── */}
        <div style={{ background:'rgba(212,175,55,.03)', border:'1px solid rgba(212,175,55,.1)', padding: mob ? '20px 16px' : '28px 32px', textAlign:'center', position:'relative', overflow:'hidden', marginBottom:20 }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'8rem', color:'rgba(212,175,55,.02)', fontWeight:900, lineHeight:1, pointerEvents:'none' }}>∞</div>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:'.48rem', letterSpacing:4, color:`${G}66`, textTransform:'uppercase', fontWeight:800, marginBottom:10 }}>للتجار</div>
            <h3 style={{ fontFamily:'Playfair Display,serif', fontSize: mob ? '1.2rem' : '1.5rem', fontWeight:700, color:'#fff', marginBottom:8 }}>
              ابدأ متجرك على <em style={{ color:G, fontStyle:'italic' }}>دايم</em> في ٥ دقايق
            </h3>
            <p style={{ fontSize:'.76rem', color:'rgba(255,255,255,.3)', marginBottom:20 }}>
              بدون خبرة تقنية — متجر كامل من 100 ج/شهر — AI يبني كتالوجك تلقائي
            </p>
            <button onClick={() => nav('/register')}
              style={{ padding:'12px 36px', background:G, border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:900, fontSize:'.86rem', cursor:'pointer', transition:'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#F0D060'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background=G; e.currentTarget.style.transform='none' }}>
              ابدأ متجرك ← من 100 ج/شهر
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
