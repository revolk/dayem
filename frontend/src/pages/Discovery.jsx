import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE } from '../services/api'

/* ── Constants ─────────────────────────────────────────── */
const G    = '#D4AF37'
const BG   = '#060F1E'
const SURF = '#0D1B2E'
const CARD = '#0C1E35'

const CATS = ['الكل','ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى']
const GOVS = ['الكل','القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']
const CAT_ICONS = {'ملابس وأزياء':'👗','إلكترونيات':'📱','أغذية ومشروبات':'🍕','مستلزمات منزلية':'🏠','مستحضرات تجميل':'💄','رياضة ولياقة':'⚽','كتب وتعليم':'📚','هدايا وتذكارات':'🎁','أخرى':'✨'}
const PLAN_C = { starter:'rgba(107,114,128,.6)', tajer:'rgba(96,165,250,.7)', merchant:'rgba(96,165,250,.7)', pro:G }
const PLAN_L = { starter:'ستارتر', tajer:'تاجر', merchant:'تاجر', pro:'⭐ برو' }

// ── Governorate matching for location detection ──
const GOV_MAP = {
  'القاهرة':['القاهرة','Cairo','قاهرة','Cairo Governorate','محافظة القاهرة'],'الجيزة':['الجيزة','Giza','جيزة','Giza Governorate','محافظة الجيزة'],
  'الإسكندرية':['الإسكندرية','Alexandria','إسكندرية','Alexandria Governorate','محافظة الإسكندرية'],'الدقهلية':['الدقهلية','Dakahlia'],
  'البحيرة':['البحيرة','Beheira'],'الشرقية':['الشرقية','Sharqia'],
  'الغربية':['الغربية','Gharbia','Gharbiyya','Gharb','محافظة الغربية'],'المنوفية':['المنوفية','Monufia'],
  'القليوبية':['القليوبية','Qalyubia'],'الإسماعيلية':['الإسماعيلية','Ismailia'],
  'السويس':['السويس','Suez'],'بورسعيد':['بورسعيد','Port Said'],
  'دمياط':['دمياط','Damietta'],'المنيا':['المنيا','Minya','منيا','Al Minya','El Minya','Minya Governorate','محافظة المنيا'],
  'أسيوط':['أسيوط','Asyut','Assiut','Asyyut','محافظة أسيوط'],'سوهاج':['سوهاج','Sohag','Suhag','محافظة سوهاج'],
  'قنا':['قنا','Qena'],'الأقصر':['الأقصر','Luxor'],
  'أسوان':['أسوان','Aswan'],'الفيوم':['الفيوم','Fayoum'],
  'بني سويف':['بني سويف','Beni Suef'],'كفر الشيخ':['كفر الشيخ','Kafr el-Sheikh'],
  'مطروح':['مطروح','Matrouh'],'الوادي الجديد':['الوادي الجديد','New Valley'],
  'البحر الأحمر':['البحر الأحمر','Red Sea'],'شمال سيناء':['شمال سيناء','North Sinai'],
  'جنوب سيناء':['جنوب سيناء','South Sinai'],
}

function matchGov(raw) {
  if (!raw) return null
  const r = raw.trim().toLowerCase().replace(/^محافظة\s+/, '')
  // 1. Exact match first
  for (const [ar, aliases] of Object.entries(GOV_MAP)) {
    if (aliases.some(a => a.toLowerCase() === r)) return ar
    if (ar.replace(/^ال/, '') === r.replace(/^ال/, '')) return ar
  }
  // 2. Contains match — check if raw contains alias (longer aliases first to avoid false matches)
  const sorted = Object.entries(GOV_MAP).sort((a,b) => {
    const maxA = Math.max(...a[1].map(x => x.length))
    const maxB = Math.max(...b[1].map(x => x.length))
    return maxB - maxA
  })
  for (const [ar, aliases] of sorted) {
    if (aliases.some(a => r.includes(a.toLowerCase()))) return ar
  }
  // 3. Alias contains raw (partial)
  for (const [ar, aliases] of sorted) {
    if (aliases.some(a => a.toLowerCase().includes(r.replace(/^ال/, '')))) return ar
  }
  return null
}

/* ── Hooks ─────────────────────────────────────────────── */
const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

/* ── Stars ─────────────────────────────────────────────── */
const Stars = ({ rating, count }) => (
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <div style={{ display:'flex', gap:1.5 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:10, color: s <= Math.round(rating||0) ? '#FCD34D' : 'rgba(255,255,255,.1)' }}>★</span>
      ))}
    </div>
    {count > 0 && <span style={{ fontSize:'.58rem', color:'rgba(255,255,255,.2)', fontFamily:'Tajawal' }}>({count})</span>}
  </div>
)

/* ── Store Card ────────────────────────────────────────── */
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
        transition:'all .3s cubic-bezier(.23,1,.32,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 36px rgba(0,0,0,.4),0 0 0 1px rgba(212,175,55,.06)' : '0 2px 8px rgba(0,0,0,.15)',
      }}>
      {/* Gold top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${G}${hov?'88':'22'},transparent)`, transition:'all .3s' }} />

      {/* Image */}
      <div style={{ height:88, background: store.logo ? 'transparent' : `linear-gradient(135deg,#0D1B2E,#112240)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {store.logo
          ? <img src={store.logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: hov ? 1 : .85, transition:'opacity .3s' }} />
          : <div style={{ fontFamily:'Playfair Display, serif', fontSize:'2.5rem', fontWeight:700, color:`${G}22` }}>{store.name?.charAt(0)?.toUpperCase()}</div>
        }
        {store.category && (
          <div style={{ position:'absolute', bottom:6, right:6, background:'rgba(6,15,30,.9)', border:'1px solid rgba(255,255,255,.06)', padding:'2px 7px', fontSize:'.5rem', color:'rgba(255,255,255,.5)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:3 }}>
            {CAT_ICONS[store.category]||'✨'} {store.category}
          </div>
        )}
        {plan !== 'starter' && (
          <div style={{ position:'absolute', top:6, left:6, background:`${PLAN_C[plan]}15`, border:`1px solid ${PLAN_C[plan]}40`, padding:'2px 6px', fontSize:'.48rem', color:PLAN_C[plan], fontFamily:'Tajawal', fontWeight:700 }}>
            {PLAN_L[plan]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'11px 13px 13px' }}>
        <h3 style={{ fontFamily:'Tajawal', fontSize:'.88rem', fontWeight:900, color:'#fff', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {store.name}
        </h3>
        {store.description && (
          <p style={{ fontSize:'.68rem', color:'rgba(255,255,255,.28)', fontFamily:'Tajawal', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginBottom:8 }}>
            {store.description}
          </p>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {store.governorate && (
            <span style={{ fontSize:'.58rem', color:'rgba(255,255,255,.22)', fontFamily:'Tajawal', display:'flex', alignItems:'center', gap:3 }}>
              📍 {store.governorate}
            </span>
          )}
          <Stars rating={store.rating} count={store.reviewCount} />
        </div>
        <div style={{ padding:'7px 10px', background: hov ? `${G}10` : 'rgba(255,255,255,.02)', border:`1px solid ${hov ? G+'30' : 'rgba(255,255,255,.04)'}`, textAlign:'center', transition:'all .25s' }}>
          <span style={{ fontSize:'.68rem', fontWeight:700, color: hov ? G : 'rgba(255,255,255,.28)', fontFamily:'Tajawal' }}>
            دخول المتجر ←
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────── */
const Skel = () => (
  <div style={{ background:CARD, border:'1px solid rgba(255,255,255,.04)', overflow:'hidden' }}>
    <div style={{ height:88, background:'linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.055) 50%,rgba(255,255,255,.03) 75%)', backgroundSize:'200% 100%', animation:'sk 1.8s ease infinite' }} />
    <div style={{ padding:'11px 13px' }}>
      <div style={{ height:12, background:'rgba(255,255,255,.05)', marginBottom:7, width:'60%' }} />
      <div style={{ height:9, background:'rgba(255,255,255,.03)', marginBottom:5, width:'90%' }} />
      <div style={{ height:9, background:'rgba(255,255,255,.03)', width:'55%' }} />
    </div>
  </div>
)

/* ── Main ──────────────────────────────────────────────── */
export default function Discovery() {
  const nav = useNavigate()
  const w = useW()
  const mob = w < 768
  const customer  = JSON.parse(localStorage.getItem('dayem_customer') || '{}')
  const isLoggedIn = !!localStorage.getItem('dayem_customer_token')

  const [stores, setStores]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('')
  const [govFilter, setGovFilter]   = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const [locating, setLocating]     = useState(false)
  const [locErr, setLocErr]         = useState('')
  const searchTimer = useRef(null)

  const load = useCallback(async (s, c, g, p) => {
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
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load(search, category, govFilter, page) }, [category, govFilter, page])

  const onSearch = v => {
    setSearch(v); setPage(1)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(v, category, govFilter, 1), 500)
  }

  const detectLocation = async () => {
    setLocating(true); setLocErr('')
    let matched = null

    // ── Strategy 1: GPS + ipapi.co (الأدق — بيستخدم الـ IP مباشرة)
    const tryIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const d = await res.json()
        // d.region = اسم المحافظة بالإنجليزي
        if (d.region) return matchGov(d.region)
        if (d.city)   return matchGov(d.city)
      } catch {}
      return null
    }

    // ── Strategy 2: GPS عالي الدقة مع Nominatim zoom=10
    const tryGPS = () => new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const { latitude: lat, longitude: lng } = pos.coords
            // zoom=10 = مستوى المدينة — أدق بكتير
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&accept-language=en`
            ).then(x => x.json())
            const candidates = [
              r.address?.state,
              r.address?.state_district,
              r.address?.county,
              r.address?.city,
              r.address?.town,
              r.address?.village,
            ].filter(Boolean)
            for (const c of candidates) {
              const m = matchGov(c)
              if (m) return resolve(m)
            }
          } catch {}
          resolve(null)
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    })

    // جرب GPS الأول لأنه أدق، لو فشل جرب IP
    matched = await tryGPS()
    if (!matched) matched = await tryIP()

    if (matched) {
      setGovFilter(matched)
      setPage(1)
      setLocErr('')
    } else {
      setLocErr('تعذّر تحديد المحافظة — اختارها يدوياً')
    }
    setLocating(false)
  }

  const clearAll = () => { setSearch(''); setCategory(''); setGovFilter(''); setPage(1) }
  const hasFilter = search || category || (govFilter && govFilter !== 'الكل')

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Tajawal', direction:'rtl', color:'#EAE0C8' }}>
      <style>{`
        @keyframes sk{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .fade{animation:fi .35s ease both}
        .cat-pill:hover{border-color:rgba(212,175,55,.3)!important;color:rgba(255,255,255,.7)!important}
        input::placeholder{color:rgba(255,255,255,.22)!important}
        select option{background:#0C2540}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.18)}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:'rgba(13,27,46,.97)', borderBottom:'1px solid rgba(255,255,255,.05)', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' }}>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
        <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '10px 14px' : '12px 32px', display:'flex', alignItems:'center', gap: mob ? 10 : 18 }}>
          {/* Logo */}
          <div onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:32, height:32, border:`1.5px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', color:G, fontSize:'.9rem' }}>∞</div>
            {!mob && (
              <div>
                <div style={{ fontWeight:900, color:'#fff', fontSize:'.85rem', letterSpacing:1.5 }}>دايم</div>
                <div style={{ fontSize:'.36rem', letterSpacing:3, color:`${G}55`, textTransform:'uppercase' }}>DISCOVER</div>
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', color:`${G}44`, fontSize:'.76rem', pointerEvents:'none' }}>🔍</span>
            <input value={search} onChange={e => onSearch(e.target.value)}
              placeholder="ابحث عن متجر أو منتج..."
              style={{ width:'100%', padding:'9px 34px 9px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', fontFamily:'Tajawal', fontSize:'.82rem', color:'#fff', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.07)'} />
          </div>

          {/* Account */}
          {isLoggedIn ? (
            <button onClick={() => nav('/customer/dashboard')}
              style={{ padding:'8px 12px', background:`${G}12`, border:`1px solid ${G}30`, color:G, fontFamily:'Tajawal', fontSize:'.75rem', fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              👤 {mob ? '' : customer.name?.split(' ')[0]}
            </button>
          ) : (
            <button onClick={() => nav('/customer/login')}
              style={{ padding:'8px 12px', background:'transparent', border:'1px solid rgba(255,255,255,.09)', color:'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.75rem', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              {mob ? '👤' : 'دخول'}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(180deg,${SURF} 0%,${BG} 100%)`, padding: mob ? '32px 16px 24px' : '52px 32px 36px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'min(60vw,500px)', color:'rgba(212,175,55,.022)', fontWeight:900, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>∞</div>
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:1, background:`linear-gradient(90deg,transparent,${G})` }} />
            <span style={{ fontSize:'.44rem', letterSpacing:6, color:`${G}66`, textTransform:'uppercase', fontWeight:800 }}>اكتشف · تسوق · استمتع</span>
            <div style={{ width:32, height:1, background:`linear-gradient(90deg,${G},transparent)` }} />
          </div>
          <h1 style={{ fontFamily:'Playfair Display, serif', fontSize: mob ? '1.9rem' : '2.8rem', fontWeight:700, color:'#fff', marginBottom:10, letterSpacing:-0.5 }}>
            اكتشف <em style={{ color:G, fontStyle:'italic' }}>متاجر</em> مصر
          </h1>
          <p style={{ fontSize: mob ? '.78rem' : '.88rem', color:'rgba(255,255,255,.28)', maxWidth:460, margin:'0 auto' }}>
            آلاف المتاجر المصرية في مكان واحد — اشتري من المتجر الأقرب ليك
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding: mob ? '16px 14px' : '24px 32px' }}>

        {/* ── Filters ── */}
        <div style={{ marginBottom:20 }}>
          {/* Location row */}
          <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={detectLocation} disabled={locating}
              style={{ padding:'8px 13px', background: govFilter && govFilter !== 'الكل' ? `${G}10` : 'rgba(255,255,255,.03)', border:`1px solid ${govFilter && govFilter !== 'الكل' ? G+'28' : 'rgba(255,255,255,.08)'}`, color: govFilter && govFilter !== 'الكل' ? G : 'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.76rem', cursor: locating ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:5, transition:'all .2s', flexShrink:0 }}>
              {locating ? '⏳' : '📍'} {locating ? 'جاري...' : govFilter && govFilter !== 'الكل' ? govFilter : 'موقعي'}
            </button>
            <select value={govFilter} onChange={e => { setGovFilter(e.target.value); setPage(1) }}
              style={{ flex:1, minWidth:130, maxWidth:180, padding:'8px 11px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', fontFamily:'Tajawal', fontSize:'.8rem', color: govFilter && govFilter !== 'الكل' ? '#fff' : 'rgba(255,255,255,.3)', outline:'none', cursor:'pointer' }}>
              {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {govFilter && govFilter !== 'الكل' && (
              <button onClick={() => { setGovFilter(''); setPage(1) }}
                style={{ padding:'8px 11px', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.15)', color:'#FCA5A5', fontFamily:'Tajawal', fontSize:'.72rem', cursor:'pointer' }}>
                ✕ إلغاء
              </button>
            )}
          </div>

          {/* Location error */}
          {locErr && (
            <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.12)', padding:'6px 12px', marginBottom:8, fontSize:'.7rem', color:'#FCA5A5', fontFamily:'Tajawal', display:'flex', justifyContent:'space-between' }}>
              <span>⚠️ {locErr}</span>
              <span onClick={() => setLocErr('')} style={{ cursor:'pointer', opacity:.6 }}>✕</span>
            </div>
          )}

          {/* Categories */}
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:3 }}>
            {CATS.map(c => {
              const active = (category === c) || (!category && c === 'الكل')
              return (
                <button key={c} className="cat-pill"
                  onClick={() => { setCategory(c === 'الكل' ? '' : c); setPage(1) }}
                  style={{ padding:'6px 12px', background: active ? G : 'rgba(255,255,255,.03)', border:`1px solid ${active ? G : 'rgba(255,255,255,.07)'}`, color: active ? '#0C2540' : 'rgba(255,255,255,.4)', fontFamily:'Tajawal', fontSize:'.72rem', cursor:'pointer', fontWeight: active ? 700 : 400, transition:'all .2s', whiteSpace:'nowrap', flexShrink:0 }}>
                  {c !== 'الكل' && CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ''}{c}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results bar ── */}
        {!loading && (
          <div style={{ marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'.68rem', color:'rgba(255,255,255,.22)', fontFamily:'Tajawal' }}>
            <span>
              {total > 0 ? `${total} متجر` : 'لا توجد متاجر'}
              {category && category !== 'الكل' ? ` · ${category}` : ''}
              {govFilter && govFilter !== 'الكل' ? ` · ${govFilter}` : ''}
            </span>
            {hasFilter && (
              <button onClick={clearAll} style={{ background:'transparent', border:'none', color:`${G}55`, fontFamily:'Tajawal', fontSize:'.68rem', cursor:'pointer', padding:0 }}>
                مسح الكل ✕
              </button>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr 1fr' : `repeat(auto-fill,minmax(200px,1fr))`, gap: mob ? 8 : 14, marginBottom:24 }}>
          {loading
            ? Array(12).fill(0).map((_,i) => <Skel key={i} />)
            : stores.length === 0
            ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,.16)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🔍</div>
                <p style={{ fontFamily:'Tajawal', fontSize:'.88rem', marginBottom:14 }}>مفيش متاجر بالمواصفات دي</p>
                <button onClick={clearAll}
                  style={{ padding:'9px 22px', background:'transparent', border:`1px solid ${G}30`, color:`${G}60`, fontFamily:'Tajawal', fontSize:'.78rem', cursor:'pointer' }}>
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
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width:34, height:34, background: page===p ? G : 'transparent', border:`1px solid ${page===p ? G : 'rgba(255,255,255,.08)'}`, color: page===p ? '#0C2540' : 'rgba(255,255,255,.35)', fontFamily:'Playfair Display, serif', fontWeight:700, cursor:'pointer', transition:'all .2s', fontSize:'.8rem' }}>
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
        <div style={{ background:'rgba(212,175,55,.03)', border:'1px solid rgba(212,175,55,.1)', padding: mob ? '20px 16px' : '28px 32px', textAlign:'center', position:'relative', overflow:'hidden', marginBottom:16 }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
          <div style={{ position:'absolute', top:-1, right:-1, width:16, height:16, borderTop:`2px solid ${G}`, borderRight:`2px solid ${G}` }} />
          <div style={{ position:'absolute', bottom:-1, left:-1, width:16, height:16, borderBottom:`2px solid ${G}`, borderLeft:`2px solid ${G}` }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'8rem', color:'rgba(212,175,55,.018)', fontWeight:900, lineHeight:1, pointerEvents:'none' }}>∞</div>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:'.44rem', letterSpacing:4, color:`${G}55`, textTransform:'uppercase', fontWeight:800, marginBottom:10 }}>للتجار</div>
            <h3 style={{ fontFamily:'Playfair Display, serif', fontSize: mob ? '1.2rem' : '1.5rem', fontWeight:700, color:'#fff', marginBottom:8 }}>
              ابدأ متجرك على <em style={{ color:G, fontStyle:'italic' }}>دايم</em> في ٥ دقايق
            </h3>
            <p style={{ fontSize:'.76rem', color:'rgba(255,255,255,.28)', marginBottom:18 }}>
              بدون خبرة تقنية — متجر كامل من 100 ج/شهر
            </p>
            <button onClick={() => nav('/register')}
              style={{ padding:'12px 32px', background:G, border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:900, fontSize:'.88rem', cursor:'pointer', transition:'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#F0D060'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background=G; e.currentTarget.style.transform='none' }}>
              ابدأ متجرك ← 100 ج/شهر
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
