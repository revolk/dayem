// frontend/src/pages/store/CustomerStore.jsx
// DAYEM ∞ — Iframe-isolated store (100% matches store_v5.html)
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { storeAPI, BASE } from '../../services/api'

// Theme hex map
const THEME_HEX = {
  midnight:'#1A1A2E', obsidian:'#111111', rose:'#BE185D',
  forest:'#047857',   desert:'#C2410C',   ocean:'#0891B2',
  royal:'#7C3AED',    crimson:'#DC2626',
  sky:'#0891B2',      mint:'#059669',     blush:'#F43F5E',
  lemon:'#CA8A04',    lavender:'#7C3AED', peach:'#EA580C',
}

export default function CustomerStore() {
  const { slug } = useParams()
  const nav      = useNavigate()
  const iframeRef = useRef(null)

  const [store,    setStore]    = useState(null)
  const [products, setProducts] = useState([])
  const [coupon,   setCoupon]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [htmlReady, setHtmlReady] = useState(false)

  useEffect(() => { 
    setStore(null)
    setProducts([])
    setCoupon(null)
    loadData() 
  }, [slug])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sr, pr, cr] = await Promise.all([
        storeAPI.getStore(slug),
        storeAPI.getProducts(slug),
        storeAPI.getFeaturedCoupon(slug),
      ])
      if (!sr.success) { setNotFound(true); setLoading(false); return }
      setStore(sr.store)
      setProducts(pr.products || [])
      setCoupon(cr?.coupon || null)
    } catch { setNotFound(true) }
    setLoading(false)
  }

  // Build HTML with real data
  const buildHTML = () => {
    if (!store || !products) return ''
    const accentHex = THEME_HEX[store.theme] || '#111111'
    
    // Build products HTML
    const productsHTML = products.map((p, idx) => {
      const imgs = (p.images || []).filter(i => i?.url)
      const oos = p.stock === 0
      const disc = p.comparePrice && p.comparePrice > p.price
        ? Math.round((1 - p.price / p.comparePrice) * 100) : null
      const imgSrc = imgs[0]?.url || ''

      return `
        <div class="card fu" data-id="${p._id}" data-price="${p.price}" data-name="${(p.nameAr||p.name||'')}">
          <div class="card-img" id="cimg-${p._id}">
            ${imgSrc ? `<img class="cimg" src="${imgSrc}" alt="${p.nameAr||p.name||''}" loading="lazy">` : '<div class="no-img-ph">🖼</div>'}
            ${imgs.length > 1 ? `
              <button class="sl-prev" onclick="slide('${p._id}',-1,event)">›</button>
              <button class="sl-next" onclick="slide('${p._id}',1,event)">‹</button>
              <div class="sl-dots" id="dots-${p._id}">
                ${imgs.map((_,i) => `<div class="sl-dot${i===0?' on':''}" onclick="setSlide('${p._id}',${i},event)"></div>`).join('') }
              </div>
            ` : ''}
            ${oos ? '<div class="oos-veil"><span class="oos-chip">نفذ المخزون</span></div>' : ''}
            ${disc ? `<div class="badge-sale">-${disc}%</div>` : ''}
            ${!disc && p.totalSold > 10 && !oos ? '<div class="badge-hot">🔥 الأكثر</div>' : ''}
            <button class="wish-btn" onclick="wishToggle(this,event)">♡</button>
            ${!oos ? `<button class="quick-plus" id="qp-${p._id}" onclick="quickAdd('${p._id}','${(p.nameAr||p.name||'').replace(/'/g,"\'")}',${p.price},'${imgSrc}',event)">+</button>` : ''}
          </div>
          <div class="card-info">
            ${p.category ? `<div class="p-cat">${p.category}</div>` : ''}
            <div class="p-name">${p.nameAr||p.name||''}</div>
            ${p.rating > 0 ? `<div class="p-stars">${'★'.repeat(Math.min(5,Math.round(p.rating)))}${'☆'.repeat(Math.max(0,5-Math.round(p.rating)))} <span>(${p.reviewCount||0})</span></div>` : ''}
            <div class="price-row">
              <span class="p-price">${p.price.toLocaleString('en-US')}</span>
              <span class="p-egp">ج.م</span>
              ${disc ? `<span class="p-old">${p.comparePrice}</span><span class="p-pct">-${disc}%</span>` : ''}
            </div>
          </div>
          <div class="card-foot">
            ${oos
              ? '<div class="cart-add-row"><button class="cart-add-btn oos">نفذ المخزون</button></div>'
              : `<div class="cart-add-row" id="car-${p._id}">
                  <button class="cart-add-btn" id="cab-${p._id}" onclick="addItem('${p._id}','${(p.nameAr||p.name||'').replace(/'/g,"\'")}',${p.price},'${imgSrc}',event)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>
                    <span>أضف للسلة</span>
                  </button>
                </div>`
            }
          </div>
        </div>`
    }).join('\n')

    // Build categories
    const allCats = ['الكل', ...new Set(products.filter(p=>p.category).map(p=>p.category))]
    const catsHTML = allCats.map(c => 
      `<button class="cat-pill${c==='الكل'?' on':''}" onclick="filterCat(this,'${c}')">${c}</button>`
    ).join('')

    // Get imgs per product for slider
    const sliderData = products.reduce((acc, p) => {
      const imgs = (p.images||[]).filter(i=>i?.url).map(i=>i.url)
      if (imgs.length > 1) acc[p._id] = imgs
      return acc
    }, {})

    const isLoggedIn = !!localStorage.getItem('dayem_customer_token')
    const customer = JSON.parse(localStorage.getItem('dayem_customer')||'{}'  )
    const logoHTML = store.logo 
      ? `<img src="${store.logo}" style="width:100%;height:100%;object-fit:contain" alt="">`
      : (store.name?.charAt(0)||'م')

    // Inject into store_v5 template
    let html = STORE_V5_TEMPLATE
    
    // Set accent color
    // Inject all accent vars
    const {r,g,b} = (() => {
      const c = accentHex.replace('#','')
      return {r:parseInt(c.substr(0,2),16),g:parseInt(c.substr(2,2),16),b:parseInt(c.substr(4,2),16)}
    })()
    const lum = (0.299*r + 0.587*g + 0.114*b)/255
    const tx  = lum > 0.55 ? '#111111' : '#FFFFFF'
    html = html.replace(/__ACCENT__/g, accentHex)
    html = html.replace(/__ACCENT_TX__/g, tx)
    html = html.replace(/__ACCENT_S1__/g, `rgba(${r},${g},${b},.06)`)
    html = html.replace(/__ACCENT_S2__/g, `rgba(${r},${g},${b},.12)`)
    html = html.replace(/__ACCENT_S3__/g, `rgba(${r},${g},${b},.25)`)
    html = html.replace(/__STORE_NAME__/g, store.name||'متجر دايم')
    html = html.replace(/__STORE_CAT__/g, store.category||'')
    html = html.replace(/__STORE_LOGO__/g, logoHTML)
    html = html.replace(/__CATS_HTML__/g, catsHTML)
    html = html.replace(/__PRODUCTS_HTML__/g, productsHTML)
    html = html.replace(/__PRODUCT_COUNT__/g, products.length)
    html = html.replace(/__PROMO_CODE__/g, coupon?.code || '')
    html = html.replace(/__SHOW_PROMO__/g, coupon ? 'block' : 'none')
    html = html.replace(/__SHOW_ANNOUNCE__/g, coupon ? 'flex' : 'none')
    html = html.replace(/__SLIDER_DATA__/g, JSON.stringify(sliderData))
    html = html.replace(/__STORE_SLUG__/g, slug)
    html = html.replace(/__MERCHANT_ID__/g, store.merchantId || '')
    html = html.replace(/__API_BASE__/g, BASE)
    html = html.replace(/__IS_LOGGED_IN__/g, isLoggedIn ? 'true' : 'false')
    html = html.replace(/__LOGIN_BTN__/g, isLoggedIn 
      ? `<button class="btn-login" onclick="goTo('/customer/dashboard')">${customer.name?.split(' ')[0]||'حسابي'}</button>`
      : `<button class="btn-login" onclick="goTo('/customer/login')">دخول</button>`)
    
    return html
  }

  const getIframeHTML = () => {
    if (!store || !products.length) return ''
    return buildHTML()
  }

  // Handle messages from iframe (navigation, checkout)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'NAVIGATE') nav(e.data.path)
      if (e.data?.type === 'CHECKOUT') {
        const { cart, couponCode, discount } = e.data
        nav(`/store/${slug}/checkout`, { state: { cart, store, couponCode, discount } })
      }
      if (e.data?.type === 'BACK') {
        window.history.length > 1 ? nav(-1) : nav('/')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [slug, store, nav])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,background:'#F5F5F5',fontFamily:'Cairo,sans-serif'}}>
      <div style={{width:44,height:44,border:'3px solid #F0F0F0',borderTop:'3px solid #111',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{fontSize:'.72rem',color:'#BBB',letterSpacing:2,textTransform:'uppercase'}}>جاري التحميل</div>
    </div>
  )

  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,background:'#F5F5F5',fontFamily:'Cairo,sans-serif',direction:'rtl'}}>
      <div style={{fontSize:'3rem',opacity:.12}}>🔍</div>
      <div style={{fontSize:'.88rem',color:'#AAA'}}>المتجر غير موجود</div>
      <button onClick={()=>nav('/')} style={{padding:'10px 28px',background:'#111',color:'#fff',border:'none',borderRadius:9,fontFamily:'Cairo',fontWeight:900,cursor:'pointer'}}>الرئيسية</button>
    </div>
  )

  const iframeContent = getIframeHTML()

  return (
    <iframe
      ref={iframeRef}
      key={`store-${slug}-${store?.theme}-${products.length}-${coupon?.code||'none'}`}
      srcDoc={iframeContent}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      sandbox="allow-scripts allow-same-origin allow-forms"
      title={store?.name || 'متجر دايم'}
    />
  )
}

// ══ STORE V5 HTML TEMPLATE ══
const STORE_V5_TEMPLATE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>DAYEM Store</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
/* ══ ACCENT SYSTEM — set by React from store.theme ══ */
:root {
  --ac:    __ACCENT__;
  --ac-dk: __ACCENT__;
  --ac-tx: __ACCENT_TX__;
  --ac-s1: __ACCENT_S1__;
  --ac-s2: __ACCENT_S2__;
  --ac-s3: __ACCENT_S3__;
}

/* ══ FIXED WHITE PALETTE — never changes ══ */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth;-webkit-tap-highlight-color:transparent}
body{
  font-family:'Cairo',sans-serif;direction:rtl;
  background:#F5F5F5;color:#111;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;display:flex;flex-direction:column;
  padding-bottom:64px; /* space for bottom nav */
}

/* ══ ANNOUNCEMENT BAR ══ */
.announce{
  background:var(--ac);color:var(--ac-tx);
  text-align:center;padding:8px 16px;
  font-size:.74rem;font-weight:600;letter-spacing:.3px;
  display:flex;align-items:center;justify-content:center;gap:10px;
}
.announce-code{
  background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);
  border-radius:4px;padding:2px 10px;font-weight:800;
  cursor:pointer;transition:background .2s;
}
.announce-code:hover{background:rgba(255,255,255,.35)}

/* ══ HEADER ══ */
.hdr{
  position:sticky;top:0;z-index:200;
  background:var(--ac);
  box-shadow:0 2px 12px rgba(0,0,0,.18);
  transition:background .3s;
}
.hdr-row{
  display:flex;align-items:center;gap:10px;
  padding:0 16px;height:56px;
  max-width:1440px;margin:0 auto;
}
@media(max-width:640px){.hdr-row{padding:0 12px;height:52px;gap:8px}}

.btn-back{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);
  color:#fff;cursor:pointer;display:flex;align-items:center;
  justify-content:center;font-size:1rem;transition:all .2s;
}
.btn-back:hover{background:rgba(255,255,255,.28)}

.store-brand{display:flex;align-items:center;gap:8px;flex-shrink:0}
.brand-logo{
  width:36px;height:36px;border-radius:8px;
  background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.3);
  color:#fff;font-weight:900;font-size:.88rem;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.brand-name{font-weight:800;font-size:.85rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.brand-cat{font-size:.58rem;color:rgba(255,255,255,.6)}
@media(max-width:380px){.brand-name{max-width:70px}}

.search-box{
  flex:1;position:relative;
}
.search-inp{
  width:100%;padding:8px 36px 8px 12px;
  background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.22);
  border-radius:20px;font-family:'Cairo',sans-serif;
  font-size:14px;color:#fff;outline:none;transition:all .25s;
}
.search-inp::placeholder{color:rgba(255,255,255,.5)}
.search-inp:focus{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5)}
.srch-ico{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.5);font-size:.88rem;pointer-events:none}

.hdr-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-right:auto}

.btn-login{
  padding:6px 14px;background:rgba(255,255,255,.15);
  border:1px solid rgba(255,255,255,.25);border-radius:18px;
  color:#fff;font-family:'Cairo',sans-serif;
  font-size:.74rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;
}
.btn-login:hover{background:rgba(255,255,255,.28)}

/* Cart button */
.cart-trigger{position:relative;cursor:pointer}
.cart-ring{
  width:40px;height:40px;border-radius:50%;
  background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.28);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:1.15rem;transition:all .2s;
}
.cart-ring.filled{background:#fff;border-color:#fff;color:var(--ac)}
.cart-ring.filled .cart-svg-icon{color:var(--ac)}
.cart-pill-count{
  position:absolute;top:-4px;left:-4px;
  min-width:18px;height:18px;border-radius:9px;
  background:#EF4444;color:#fff;
  font-size:.58rem;font-weight:900;padding:0 4px;
  display:flex;align-items:center;justify-content:center;
  border:2px solid var(--ac);
  animation:pop .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}

/* Mobile search row */
.mob-search{
  background:var(--ac);padding:0 12px 10px;
  display:none;transition:background .3s;
}
.mob-search .search-inp{background:rgba(255,255,255,.15)}

/* ══ CATS BAR ══ */
.cats-bar{background:var(--ac);transition:background .3s}
.cats-scroll{
  display:flex;overflow-x:auto;scrollbar-width:none;
  max-width:1440px;margin:0 auto;padding:0 14px;
}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-pill{
  padding:8px 16px;border:none;background:transparent;
  color:rgba(255,255,255,.55);font-family:'Cairo',sans-serif;
  font-size:.78rem;font-weight:500;cursor:pointer;
  white-space:nowrap;position:relative;transition:color .2s;
  border-bottom:2px solid transparent;margin-bottom:-1px;
}
.cat-pill:hover{color:rgba(255,255,255,.88)}
.cat-pill.on{color:#fff;font-weight:700;border-bottom-color:#fff}
.hdr-rule{height:2px;background:rgba(255,255,255,.08)}

/* ══ PROMO BANNER ══ */
.promo-banner{
  margin:14px 16px;
  background:linear-gradient(135deg,var(--ac) 0%,var(--ac-dk) 100%);
  border-radius:14px;padding:14px 18px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  overflow:hidden;position:relative;
}
.promo-banner::before{
  content:'';position:absolute;
  top:-20px;left:-20px;width:120px;height:120px;
  background:rgba(255,255,255,.06);border-radius:50%;
}
.promo-text{}
.promo-tag{display:inline-block;background:rgba(255,255,255,.2);color:#fff;font-size:.58rem;font-weight:700;padding:2px 8px;border-radius:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px}
.promo-headline{font-size:1.05rem;font-weight:900;color:#fff;line-height:1.2}
.promo-sub{font-size:.72rem;color:rgba(255,255,255,.7);margin-top:3px}
.promo-code-wrap{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
.promo-code{
  background:rgba(255,255,255,.18);border:1.5px dashed rgba(255,255,255,.45);
  color:#fff;font-weight:900;font-size:.8rem;padding:5px 12px;border-radius:7px;
  letter-spacing:1px;cursor:pointer;transition:background .2s;
}
.promo-code:hover{background:rgba(255,255,255,.28)}
.promo-copy{
  background:#fff;color:var(--ac);border:none;border-radius:7px;
  padding:5px 12px;font-family:'Cairo',sans-serif;font-weight:800;
  font-size:.72rem;cursor:pointer;transition:opacity .2s;
}
.promo-copy:hover{opacity:.85}
.promo-icon{font-size:2.5rem;flex-shrink:0}
@media(max-width:480px){.promo-banner{margin:10px 10px}.promo-headline{font-size:.92rem}}

/* ══ SECTION HEADER ══ */
.sec-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 16px;margin:16px 0 12px;
  max-width:1440px;
}
.sec-title{font-size:1rem;font-weight:800;color:#111}
.sec-more{
  font-size:.76rem;color:var(--ac);font-weight:600;
  border:1px solid var(--ac-s2);border-radius:16px;
  padding:4px 12px;background:var(--ac-s1);cursor:pointer;transition:all .2s;
}
.sec-more:hover{background:var(--ac);color:var(--ac-tx)}

/* ══ PRODUCT GRID ══ */
.grid-outer{background:#F5F5F5;flex:1}
.grid-wrap{max-width:1440px;margin:0 auto;padding:0 12px 20px}

.grid{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:12px;
}
@media(max-width:1280px){.grid{grid-template-columns:repeat(4,1fr)}}
@media(max-width:960px) {.grid{grid-template-columns:repeat(3,1fr);gap:10px}}
@media(max-width:600px) {.grid{grid-template-columns:repeat(2,1fr);gap:8px}}

/* ══ PRODUCT CARD ══ */
.card{
  background:#fff;border-radius:12px;overflow:hidden;
  cursor:pointer;position:relative;display:flex;flex-direction:column;
  border:1px solid #EBEBEB;
  transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s,border-color .3s;
}
@media(hover:hover){
  .card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1);border-color:transparent}
  .card:hover .cimg{transform:scale(1.05)}
  .card:hover .wish-btn{opacity:1}
}
.card.tapped{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.09);border-color:transparent}
.card.tapped .wish-btn{opacity:1}

/* Image */
.card-img{width:100%;padding-bottom:100%;position:relative;overflow:hidden;background:#F4F4F4}
.cimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.4,0,.2,1)}
.no-img-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#DDD}

/* Slider */
.sl-prev,.sl-next{
  position:absolute;top:50%;transform:translateY(-50%);z-index:4;
  width:28px;height:28px;border-radius:50%;
  background:rgba(0,0,0,.45);color:#fff;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:.76rem;opacity:0;transition:opacity .2s;backdrop-filter:blur(4px);
}
.sl-prev{right:7px}.sl-next{left:7px}
.card:hover .sl-prev,.card:hover .sl-next,
.card.tapped .sl-prev,.card.tapped .sl-next{opacity:1}
.sl-dots{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);display:flex;gap:4px;z-index:4}
.sl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.5);border:none;cursor:pointer;padding:0;transition:all .2s}
.sl-dot.on{background:#fff;width:14px;border-radius:3px}

/* Badges */
.badge-sale{position:absolute;top:9px;right:9px;z-index:3;background:#EF4444;color:#fff;font-size:.58rem;font-weight:800;padding:3px 8px;border-radius:5px}
.badge-new{position:absolute;top:9px;right:9px;z-index:3;background:var(--ac);color:var(--ac-tx);font-size:.55rem;font-weight:800;padding:3px 8px;border-radius:5px;transition:background .3s,color .3s}
.badge-hot{position:absolute;top:9px;right:9px;z-index:3;background:#FF6B35;color:#fff;font-size:.55rem;font-weight:800;padding:3px 8px;border-radius:5px}

/* OOS */
.oos-veil{position:absolute;inset:0;z-index:3;background:rgba(255,255,255,.72);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.oos-chip{background:#fff;border-radius:20px;padding:5px 16px;font-size:.7rem;font-weight:700;color:#888;box-shadow:0 2px 8px rgba(0,0,0,.1);letter-spacing:1.5px;text-transform:uppercase}

/* Wishlist */
.wish-btn{
  position:absolute;top:9px;left:9px;z-index:5;
  width:30px;height:30px;border-radius:50%;
  background:#fff;border:none;color:#CCC;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:.85rem;box-shadow:0 2px 8px rgba(0,0,0,.1);
  opacity:0;transition:all .2s;
}
.wish-btn:hover,.wish-btn.liked{color:#EF4444}
.wish-btn.liked{opacity:1}

/* + Add button on image */
.quick-plus{
  position:absolute;bottom:9px;left:9px;z-index:5;
  width:34px;height:34px;border-radius:50%;
  background:var(--ac);color:var(--ac-tx);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;font-weight:900;box-shadow:0 4px 12px var(--ac-s3);
  opacity:0;transform:scale(.8);
  transition:all .22s cubic-bezier(.4,0,.2,1);
}
@media(hover:hover){
  .card:hover .quick-plus{opacity:1;transform:scale(1)}
}
.card.tapped .quick-plus{opacity:1;transform:scale(1)}
.quick-plus:hover{filter:brightness(1.1);transform:scale(1.1)!important}
.quick-plus.added{background:#1B8A4D;transform:scale(1.1)!important}

/* Card info */
.card-info{padding:9px 10px 0;flex:1;display:flex;flex-direction:column;gap:2px}
@media(max-width:600px){.card-info{padding:7px 8px 0}}

.p-cat{font-size:.6rem;color:#AAA;font-weight:500;letter-spacing:.3px}
.p-name{
  font-size:.8rem;font-weight:600;color:#111;line-height:1.35;
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
  min-height:2.16em;transition:color .2s;
}
@media(max-width:600px){.p-name{font-size:.74rem}}
@media(hover:hover){.card:hover .p-name{color:var(--ac)}}
.card.tapped .p-name{color:var(--ac)}

.p-stars{font-size:.6rem;color:#F59E0B;letter-spacing:1px;margin:2px 0}
.p-stars span{color:#CCC;font-size:.58rem;margin-right:2px}

.price-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:2px}
.p-price{font-size:.98rem;font-weight:900;color:#111}
.p-egp{font-size:.6rem;color:#BBB}
.p-old{font-size:.68rem;color:#CCC;text-decoration:line-through}
.p-pct{font-size:.6rem;font-weight:700;color:#EF4444;background:rgba(239,68,68,.08);padding:1px 5px;border-radius:3px}

/* Card footer row */
.card-foot{
  padding:8px 10px 10px;display:flex;align-items:center;justify-content:space-between;
}
@media(max-width:600px){.card-foot{padding:6px 8px 8px}}

.cart-add-row{
  display:flex;align-items:center;gap:0;
  border:1.5px solid #E8E8E8;border-radius:9px;overflow:hidden;
  background:#fff;width:100%;
}
.cart-add-btn{
  flex:1;padding:8px 0;background:#fff;color:#111;
  border:none;font-family:'Cairo',sans-serif;font-weight:700;
  font-size:.74rem;cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:5px;
}
.cart-add-btn:hover{background:var(--ac);color:var(--ac-tx);border-color:var(--ac)}
.cart-add-btn.added{background:#1B8A4D;color:#fff}

.qty-ctrl{display:flex;align-items:center;width:100%;border:1.5px solid var(--ac);border-radius:9px;overflow:hidden}
.qc-btn{
  flex:1;padding:8px 0;border:none;background:var(--ac-s1);
  color:var(--ac);font-weight:900;font-size:.9rem;cursor:pointer;
  transition:all .15s;font-family:'Cairo',sans-serif;
}
.qc-btn:hover{background:var(--ac);color:var(--ac-tx)}
.qc-num{
  flex:1.2;text-align:center;font-weight:800;font-size:.84rem;
  color:#111;background:#fff;
  border-left:1px solid var(--ac-s2);border-right:1px solid var(--ac-s2);
  padding:8px 0;
}

/* ══ FLOAT CART ══ */
.float-cart{
  position:fixed;bottom:74px;left:50%;transform:translateX(-50%);
  background:var(--ac);color:var(--ac-tx);
  border:none;padding:12px 22px;border-radius:50px;
  font-family:'Cairo',sans-serif;font-weight:800;font-size:.86rem;
  cursor:pointer;z-index:150;display:flex;align-items:center;
  gap:10px;white-space:nowrap;
  box-shadow:0 8px 24px var(--ac-s3);
  animation:float-anim 3s ease-in-out infinite;
  transition:filter .2s,transform .2s;
}
.float-cart:hover{filter:brightness(1.1);transform:translateX(-50%) translateY(-2px)}
@keyframes float-anim{0%,100%{box-shadow:0 8px 24px var(--ac-s3)}50%{box-shadow:0 14px 32px var(--ac-s3)}}
.f-div{width:1px;height:14px;background:rgba(255,255,255,.25)}
@media(max-width:600px){.float-cart{padding:10px 18px;font-size:.8rem;bottom:72px}}

/* ══ BOTTOM NAV ══ */
.bottom-nav{
  position:fixed;bottom:0;left:0;right:0;z-index:300;
  height:62px;background:#fff;
  border-top:1px solid #EBEBEB;
  display:flex;align-items:stretch;
  box-shadow:0 -4px 20px rgba(0,0,0,.07);
}
.bn-item{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:3px;cursor:pointer;
  border:none;background:transparent;
  font-family:'Cairo',sans-serif;transition:all .2s;
  -webkit-tap-highlight-color:transparent;
}
.bn-item:hover .bn-icon,.bn-item.on .bn-icon{color:var(--ac)}
.bn-item.on .bn-lbl{color:var(--ac);font-weight:700}
.bn-icon{font-size:1.15rem;color:#BBB;transition:color .2s;position:relative}
.bn-lbl{font-size:.58rem;color:#BBB;transition:color .2s}
.bn-badge{
  position:absolute;top:-4px;right:-6px;
  width:15px;height:15px;border-radius:50%;
  background:var(--ac);color:var(--ac-tx);
  font-size:.5rem;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid #fff;
}

/* ══ CART DRAWER ══ */
.overlay{
  position:fixed;inset:0;z-index:400;
  background:rgba(0,0,0,.42);backdrop-filter:blur(4px);
  animation:ov .2s ease;
}
@keyframes ov{from{opacity:0}to{opacity:1}}

.cart-drawer{
  position:absolute;top:0;left:0;bottom:0;
  width:390px;max-width:100vw;
  background:#fff;display:flex;flex-direction:column;
  animation:dr-in .32s cubic-bezier(.4,0,.2,1);
  box-shadow:6px 0 40px rgba(0,0,0,.1);
}
@keyframes dr-in{from{transform:translateX(-100%)}to{transform:none}}
@media(max-width:500px){.cart-drawer{width:100%;max-width:100vw}}

.drawer-top{height:4px;background:var(--ac);flex-shrink:0;transition:background .3s}
.drawer-hd{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;border-bottom:1px solid #F0F0F0;flex-shrink:0;
}
.drawer-title{font-weight:900;font-size:1rem;color:#111;display:flex;align-items:center;gap:6px}
.drawer-sub{font-size:.7rem;color:#AAA;margin-top:2px}
.drawer-close{
  width:32px;height:32px;border-radius:50%;
  background:#F4F4F4;border:none;color:#888;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:.82rem;transition:all .2s;
}
.drawer-close:hover{background:var(--ac);color:var(--ac-tx)}

.drawer-items{flex:1;overflow-y:auto;padding:6px 16px}
.drawer-items::-webkit-scrollbar{width:3px}
.drawer-items::-webkit-scrollbar-thumb{background:#E8E8E8;border-radius:2px}

.ci{display:flex;gap:10px;padding:11px 0;border-bottom:1px solid #F8F8F8;animation:ci-in .25s ease both}
@keyframes ci-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.ci-img{width:56px;height:56px;flex-shrink:0;background:#F4F4F4;border-radius:10px;overflow:hidden}
.ci-name{font-size:.78rem;font-weight:600;color:#111;margin-bottom:7px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ci-row{display:flex;align-items:center;justify-content:space-between}
.ci-qty{display:flex;align-items:center;gap:6px}
.ci-qbtn{
  width:26px;height:26px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:.85rem;font-weight:900;transition:all .15s;font-family:'Cairo',sans-serif;
}
.ci-minus{background:#F4F4F4;border:1.5px solid #E8E8E8;color:#111}
.ci-minus:hover{background:#111;color:#fff;border-color:#111}
.ci-plus{background:var(--ac);border:1.5px solid var(--ac);color:var(--ac-tx);transition:background .3s,border-color .3s}
.ci-plus:hover{filter:brightness(1.1)}
.ci-num{min-width:20px;text-align:center;font-weight:800;font-size:.82rem;color:#111}
.ci-price{font-weight:800;font-size:.88rem;color:#111}
.ci-rm{background:none;border:none;color:#CCC;cursor:pointer;font-size:.74rem;padding:2px 4px;transition:color .2s;font-family:'Cairo',sans-serif}
.ci-rm:hover{color:#EF4444}

.drawer-foot{padding:12px 18px 16px;border-top:1px solid #F0F0F0;flex-shrink:0}
.coupon-row{display:flex;gap:8px;margin-bottom:12px}
.coupon-inp{
  flex:1;padding:9px 12px;background:#F4F4F4;
  border:1.5px solid #E8E8E8;border-radius:9px;
  font-family:'Cairo',sans-serif;font-size:16px;color:#111;
  outline:none;transition:all .2s;
}
.coupon-inp:focus{border-color:var(--ac);background:#fff}
.coupon-inp::placeholder{color:#CCC}
.coupon-apply{
  padding:0 14px;background:var(--ac);color:var(--ac-tx);
  border:none;border-radius:9px;
  font-family:'Cairo',sans-serif;font-weight:700;font-size:.78rem;
  cursor:pointer;transition:filter .2s;
}
.coupon-apply:hover{filter:brightness(1.08)}

.ship-hint{text-align:center;padding:7px 10px;margin-bottom:10px;background:rgba(27,138,77,.06);border:1px solid rgba(27,138,77,.18);border-radius:8px;font-size:.7rem;color:#1B8A4D;font-weight:500}
.tot-line{display:flex;justify-content:space-between;margin-bottom:6px;font-size:.78rem;color:#888}
.tot-main{padding-top:10px;margin-top:8px;border-top:2px solid #F0F0F0}
.tot-main .lbl{font-weight:900;color:#111;font-size:.92rem}
.tot-main .val{font-size:1.1rem;font-weight:900;color:#111}
.checkout-btn{
  width:100%;padding:14px;border:none;border-radius:12px;
  background:var(--ac);color:var(--ac-tx);
  font-family:'Cairo',sans-serif;font-weight:800;font-size:.94rem;
  cursor:pointer;transition:all .25s;margin-top:10px;
}
.checkout-btn:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 6px 18px var(--ac-s3)}

/* ══ FOOTER ══ */
.site-footer{background:var(--ac);padding:16px 20px;text-align:center;transition:background .3s}
.site-footer p{font-size:.6rem;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase}

/* ══ THEME PICKER (demo only) ══ */
.theme-pick{
  position:fixed;bottom:72px;right:12px;z-index:250;
  background:#fff;border-radius:14px;padding:10px;
  box-shadow:0 6px 24px rgba(0,0,0,.12);border:1px solid #EEE;
}
/* theme picker dots removed — theme now controlled from merchant Settings */

/* ══ RESPONSIVE ══ */
@media(max-width:768px){
  .search-box{display:none}
  .mob-search{display:block}
  .sec-hdr{padding:0 10px;margin:14px 0 10px}
  .grid-wrap{padding:0 8px 16px}
}
@media(min-width:769px){
  .mob-search{display:none!important}
}

/* Skeleton */
.skel{background:linear-gradient(90deg,#F4F4F4 0%,#E8E8E8 50%,#F4F4F4 100%);background-size:400% 100%;animation:sk 1.8s ease infinite;border-radius:4px}
@keyframes sk{0%{background-position:100% 0}100%{background-position:-100% 0}}

/* Entry anims */
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fu{animation:fu .35s ease both}
.fu:nth-child(1){animation-delay:.04s}.fu:nth-child(2){animation-delay:.08s}
.fu:nth-child(3){animation-delay:.12s}.fu:nth-child(4){animation-delay:.16s}
.fu:nth-child(5){animation-delay:.20s}.fu:nth-child(6){animation-delay:.24s}
.fu:nth-child(7){animation-delay:.28s}.fu:nth-child(8){animation-delay:.32s}
</style>
</head>
<body>

<!-- ══ ANNOUNCEMENT BAR ══ -->
<div class="announce" id="announce" style="display:__SHOW_ANNOUNCE__">
  🎁 استخدم كود <span class="announce-code" onclick="copyCode('__PROMO_CODE__')">__PROMO_CODE__</span> واحصل على خصم على أول طلب
</div>

<!-- ══ HEADER ══ -->
<header class="hdr">
  <div class="hdr-row">
    <button class="btn-back" onclick="goBack()">←</button>

    <div class="store-brand">
      <div class="brand-logo" id="brand-logo-el">__STORE_LOGO__</div>
      <div>
        <div class="brand-name">__STORE_NAME__</div>
        <div class="brand-cat">__STORE_CAT__</div>
      </div>
    </div>

    <div class="search-box">
      <span class="srch-ico">⌕</span>
      <input class="search-inp" id="srch-desktop" placeholder="ابحث في المتجر..." oninput="doSearch(this.value)">
    </div>

    <div class="hdr-actions">
      __LOGIN_BTN__
      <div class="cart-trigger" onclick="openCart()">
        <div class="cart-ring" id="cart-ring">
          <span class="cart-svg-icon" style="font-size:1.1rem">🛒</span>
        </div>
        <div class="cart-pill-count" id="cart-badge" style="display:none">0</div>
      </div>
    </div>
  </div>

  <!-- Mobile search -->
  <div class="mob-search">
    <div style="position:relative">
      <span class="srch-ico" style="position:absolute;right:11px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.5);pointer-events:none">⌕</span>
      <input class="search-inp" id="srch-mobile" style="width:100%;border-radius:20px" placeholder="ابحث في المتجر..." oninput="doSearch(this.value)">
    </div>
  </div>

  <!-- Categories -->
  <div class="cats-bar">
    <div class="cats-scroll">
      __CATS_HTML__
    </div>
  </div>
  <div class="hdr-rule"></div>
</header>

<!-- ══ PROMO BANNER ══ -->
<div class="promo-banner" id="promo" style="display:__SHOW_PROMO__">
  <div class="promo-text">
    <div class="promo-tag">عرض محدود</div>
    <div class="promo-headline">احصل على خصم<br>على أول طلب 🎉</div>
    <div class="promo-sub">انضم لآلاف العملاء السعداء</div>
    <div class="promo-code-wrap">
      <div class="promo-code" onclick="copyCode('__PROMO_CODE__')">__PROMO_CODE__</div>
      <button class="promo-copy" onclick="copyCode('__PROMO_CODE__')">نسخ الكود</button>
    </div>
  </div>
  <div class="promo-icon">🎁</div>
</div>

<!-- ══ SECTION HEADER ══ -->
<div class="sec-hdr">
  <div class="sec-title">🛍 كل المنتجات</div>
  <div style="display:flex;align-items:center;gap:8px">
    <div class="prod-count" style="font-size:.76rem;color:#888"><b id="count-lbl">__PRODUCT_COUNT__</b> منتج</div>
    <select style="padding:5px 10px;background:#F4F4F4;border:1px solid #E8E8E8;border-radius:8px;color:#888;font-family:Cairo,sans-serif;font-size:.74rem;cursor:pointer;outline:none" onchange="sortProducts(this.value)">
      <option value="latest">الأحدث</option>
      <option value="price_asc">السعر ↑</option>
      <option value="price_desc">السعر ↓</option>
      <option value="popular">الأكثر مبيعاً</option>
    </select>
  </div>
</div>

<!-- ══ PRODUCT GRID ══ -->
<div class="grid-outer">
  <div class="grid-wrap">
    <div class="grid" id="product-grid">

      __PRODUCTS_HTML__

    </div>
  </div>
</div>

<!-- ══ FOOTER ══ -->
<footer class="site-footer">
  <p>__STORE_NAME__ — مدعوم بـ DAYEM ∞ — Trade Without Restrictions</p>
</footer>

<!-- ══ FLOAT CART ══ -->
<button class="float-cart" id="float-cart" onclick="openCart()" style="display:none">
  <span>🛒</span>
  <div class="f-div"></div>
  <span id="fc-count">0 منتجات</span>
  <div class="f-div"></div>
  <span id="fc-total">0 ج</span>
  <div class="f-div"></div>
  <span>اطلب الآن ←</span>
</button>

<!-- ══ BOTTOM NAV ══ -->
<nav class="bottom-nav">
  <button class="bn-item on" onclick="setNav(this);scrollToTop()">
    <span class="bn-icon">🏠</span>
    <span class="bn-lbl">الرئيسية</span>
  </button>
  <button class="bn-item" onclick="setNav(this);focusSearch()">
    <span class="bn-icon">🔍</span>
    <span class="bn-lbl">بحث</span>
  </button>
  <button class="bn-item" onclick="openCart()">
    <span class="bn-icon" style="position:relative">
      🛒
      <span class="bn-badge" id="bn-badge" style="display:none">0</span>
    </span>
    <span class="bn-lbl">السلة</span>
  </button>
  <button class="bn-item" onclick="goAccount()">
    <span class="bn-icon">👤</span>
    <span class="bn-lbl">حسابي</span>
  </button>
</nav>

<!-- ══ CART DRAWER ══ -->
<div class="overlay" id="overlay" style="display:none" onclick="closeCart()">
  <div class="cart-drawer" onclick="event.stopPropagation()">
    <div class="drawer-top"></div>
    <div class="drawer-hd">
      <div>
        <div class="drawer-title">🛒 سلة التسوق</div>
        <div class="drawer-sub" id="dr-sub">٠ منتج</div>
      </div>
      <button class="drawer-close" onclick="closeCart()">✕</button>
    </div>
    <div class="drawer-items" id="drawer-items"></div>
    <div class="drawer-foot">
      <div class="coupon-row">
        <input class="coupon-inp" id="coupon-inp" placeholder="كوبون الخصم...">
        <button class="coupon-apply" onclick="applyCoupon()">تطبيق</button>
      </div>
      <div class="ship-hint" id="ship-hint">🎉 أضف ١٠٠ ج للشحن المجاني</div>
      <div class="tot-line"><span>المنتجات</span><span id="tl-sub">٠ ج</span></div>
      <div class="tot-line" id="tl-disc-row" style="display:none;color:#1B8A4D">
        <span>خصم الكوبون</span><span id="tl-disc">-٠ ج</span>
      </div>
      <div class="tot-line"><span>الشحن</span><span id="tl-ship">٦٠ ج</span></div>
      <div class="tot-line tot-main"><span class="lbl">الإجمالي</span><span class="val" id="tl-total">٠ ج</span></div>
      <button class="checkout-btn" onclick="doCheckout()">إتمام الطلب ←</button>
    </div>
  </div>
</div>

</div>

<script>
/* ══ THEME ENGINE ══ */
function setTheme(color, dot) {
  const hex = color.replace('#','');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  const lum = (0.299*r + 0.587*g + 0.114*b)/255;
  const tx = lum > 0.55 ? '#111111' : '#FFFFFF';
  const root = document.documentElement;
  root.style.setProperty('--ac',  color);
  root.style.setProperty('--ac-dk', color);
  root.style.setProperty('--ac-tx', tx);
  root.style.setProperty('--ac-s1', \`rgba(\${r},\${g},\${b},.06)\`);
  root.style.setProperty('--ac-s2', \`rgba(\${r},\${g},\${b},.12)\`);
  root.style.setProperty('--ac-s3', \`rgba(\${r},\${g},\${b},.25)\`);
  document.querySelectorAll('.tp-dot').forEach(d => { d.classList.remove('on'); d.style.borderColor='transparent'; });
  dot.classList.add('on');
}

/* ══ CART ══ */
const cart = {};
function cartCount() { return Object.values(cart).reduce((s,i)=>s+i.qty,0); }
function cartTotal() { return Object.values(cart).reduce((s,i)=>s+i.price*i.qty,0); }

function addItem(id, name, price, img, e) {
  if (e) e.stopPropagation();
  if (cart[id]) cart[id].qty++;
  else cart[id] = { id, name, price, img, qty: 1 };
  btnFeedback(id);
  updateUI();
}
function quickAdd(id, name, price, img, e) {
  if (e) e.stopPropagation();
  addItem(id, name, price, img);
  const btn = document.getElementById(\`qp-\${id}\`);
  if (btn) { btn.classList.add('added'); btn.textContent='✓'; setTimeout(()=>{ btn.classList.remove('added'); btn.textContent='+'; },1400); }
}
function btnFeedback(id) {
  const btn = document.getElementById(\`cab-\${id}\`);
  if (!btn) return;
  if (cart[id]) {
    // Switch to qty control
    const row = document.getElementById(\`car-\${id}\`);
    if (row) {
      row.innerHTML = \`<div class="qty-ctrl">
        <button class="qc-btn" onclick="changeQty(\${id},-1,event)">−</button>
        <div class="qc-num">\${cart[id].qty}</div>
        <button class="qc-btn" onclick="changeQty(\${id},1,event)">+</button>
      </div>\`;
    }
  }
}
function changeQty(id, delta, e) {
  if (e) e.stopPropagation();
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
    // Restore add button
    const row = document.getElementById(\`car-\${id}\`);
    if (row) row.innerHTML = \`<button class="cart-add-btn" id="cab-\${id}" onclick="addItem(\${id},'\${cart[id]?.name||''}',\${cart[id]?.price||0},'',event)"><span>🛒</span><span>أضف للسلة</span></button>\`;
  } else {
    const numEl = row => row?.querySelector('.qc-num');
    const row = document.getElementById(\`car-\${id}\`);
    if (row) { const n = numEl(row); if(n) n.textContent = cart[id].qty; }
  }
  updateUI();
}
function removeItem(id) { delete cart[id]; updateUI(); renderDrawer(); }
function cartQtyChange(id, delta) { if(!cart[id])return; cart[id].qty+=delta; if(cart[id].qty<=0)delete cart[id]; updateUI(); renderDrawer(); }

function updateUI() {
  const count = cartCount();
  const sub   = cartTotal();
  const discount = appliedDiscount || 0;
  const ship  = (sub - discount) >= 500 ? 0 : 60;
  const total = Math.max(0, sub - discount + ship);
  const empty = count === 0;

  // Header badge
  const badge = document.getElementById('cart-badge');
  const ring  = document.getElementById('cart-ring');
  badge.style.display = empty ? 'none' : 'flex';
  badge.textContent   = count;
  ring.classList.toggle('filled', !empty);

  // Bottom nav badge
  const bb = document.getElementById('bn-badge');
  bb.style.display = empty ? 'none' : 'flex';
  bb.textContent   = count;

  // Float cart
  const fc = document.getElementById('float-cart');
  fc.style.display = empty ? 'none' : 'flex';
  if (!empty) {
    document.getElementById('fc-count').textContent = count + ' منتجات';
    document.getElementById('fc-total').textContent = total.toLocaleString('ar-EG') + ' ج';
  }

  // Drawer labels
  document.getElementById('dr-sub').textContent   = count + ' منتجات · ' + total.toLocaleString('ar-EG') + ' ج';
  document.getElementById('tl-sub').textContent   = sub.toLocaleString('ar-EG') + ' ج';
  const discRow = document.getElementById('tl-disc-row');
  if (discRow) {
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    const discVal = document.getElementById('tl-disc');
    if (discVal) discVal.textContent = '-' + discount.toLocaleString('ar-EG') + ' ج';
  }
  document.getElementById('tl-ship').innerHTML    = ship === 0 ? '<span style="color:#1B8A4D;font-weight:700">✓ مجاني</span>' : ship + ' ج';
  document.getElementById('tl-total').textContent = total.toLocaleString('ar-EG') + ' ج';
  const hint = document.getElementById('ship-hint');
  hint.style.display = (sub - discount) >= 500 ? 'none' : 'block';
  if ((sub - discount) < 500) hint.textContent = '🎉 أضف ' + (500-sub) + ' ج للشحن المجاني';
}

function renderDrawer() {
  const el = document.getElementById('drawer-items');
  const keys = Object.keys(cart);
  if (keys.length === 0) {
    el.innerHTML = \`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:50px 20px;text-align:center"><div style="font-size:3rem;opacity:.1">🛒</div><div style="font-size:.84rem;color:#AAA">السلة فاضية</div><button onclick="closeCart()" style="padding:8px 20px;background:#F4F4F4;border:none;border-radius:9px;font-family:Cairo,sans-serif;font-weight:600;cursor:pointer;font-size:.78rem;color:#666">تصفح المنتجات</button></div>\`;
    return;
  }
  el.innerHTML = keys.map(id => {
    const i = cart[id];
    return \`<div class="ci">
      <div class="ci-img"><img src="\${i.img}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.opacity=.2"></div>
      <div style="flex:1;min-width:0">
        <div class="ci-name">\${i.name}</div>
        <div class="ci-row">
          <div class="ci-qty">
            <button class="ci-qbtn ci-minus" onclick="cartQtyChange(\${id},-1)">−</button>
            <span class="ci-num">\${i.qty}</span>
            <button class="ci-qbtn ci-plus" onclick="cartQtyChange(\${id},1)">+</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="ci-price">\${(i.price*i.qty).toLocaleString('ar-EG')} ج</span>
            <button class="ci-rm" onclick="removeItem(\${id})">✕</button>
          </div>
        </div>
      </div>
    </div>\`;
  }).join('');
}

function openCart()  { document.getElementById('overlay').style.display='flex'; document.body.style.overflow='hidden'; renderDrawer(); }
function closeCart() { document.getElementById('overlay').style.display='none'; document.body.style.overflow=''; }
let appliedCoupon = null;
let appliedDiscount = 0;

async function applyCoupon() {
  const inp = document.getElementById('coupon-inp');
  const code = inp.value.toUpperCase().trim();
  if (!code) return;

  const btn = document.querySelector('.coupon-apply');
  const origText = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await fetch('__API_BASE__/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, merchantId: '__MERCHANT_ID__', orderTotal: cartTotal() })
    });
    const data = await res.json();

    if (data.success && data.coupon) {
      appliedCoupon = data.coupon.code;
      appliedDiscount = data.coupon.discount || 0;
      inp.style.borderColor = '#1B8A4D';
      inp.disabled = true;
      btn.textContent = '✓ تم';
      btn.style.background = '#1B8A4D';
      updateUI();
    } else {
      inp.style.borderColor = '#EF4444';
      btn.textContent = origText;
      btn.disabled = false;
      setTimeout(() => { inp.style.borderColor = '#E8E8E8'; }, 2000);
    }
  } catch (err) {
    btn.textContent = origText;
    btn.disabled = false;
  }
}

function removeCoupon() {
  appliedCoupon = null;
  appliedDiscount = 0;
  const inp = document.getElementById('coupon-inp');
  if (inp) { inp.value=''; inp.disabled=false; inp.style.borderColor='#E8E8E8'; }
  updateUI();
}

/* ══ CARD TAP ══ */
function tapCard(card, e) {
  if (e.target.closest('.cart-add-row,.qty-ctrl,.wish-btn,.quick-plus,.sl-prev,.sl-next,.sl-dot')) return;
  const was = card.classList.contains('tapped');
  document.querySelectorAll('.card.tapped').forEach(c=>c.classList.remove('tapped'));
  if (!was) card.classList.add('tapped');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.card')) document.querySelectorAll('.card.tapped').forEach(c=>c.classList.remove('tapped'));
});

/* ══ WISH ══ */
function wishToggle(btn,e) { e.stopPropagation(); btn.classList.toggle('liked'); btn.textContent=btn.classList.contains('liked')?'♥':'♡'; }

/* ══ CATS ══ */
function filterCat(btn,cat) {
  document.querySelectorAll('.cat-pill').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  applyFilters();
}

let currentSearch = '';
let currentCat = 'الكل';

function doSearch(v) {
  currentSearch = (v||'').trim();
  applyFilters();
}

function applyFilters() {
  const onCat = document.querySelector('.cat-pill.on');
  currentCat = onCat ? onCat.textContent.trim() : 'الكل';
  const cards = document.querySelectorAll('#product-grid .card');
  let visible = 0;
  cards.forEach(card => {
    const name = (card.dataset.name||'').toLowerCase();
    const cat  = card.querySelector('.p-cat')?.textContent.trim() || '';
    const matchSearch = !currentSearch || name.includes(currentSearch.toLowerCase());
    const matchCat = currentCat === 'الكل' || cat === currentCat;
    const show = matchSearch && matchCat;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const countEl = document.querySelector('.prod-count b');
  if (countEl) countEl.textContent = visible;
}
function sortProducts(v) {
  const grid = document.getElementById('product-grid');
  const cards = Array.from(grid.querySelectorAll('.card'));
  const getPrice = c => parseFloat(c.dataset.price) || 0;
  if (v === 'price_asc')  cards.sort((a,b) => getPrice(a) - getPrice(b));
  if (v === 'price_desc') cards.sort((a,b) => getPrice(b) - getPrice(a));
  cards.forEach(c => grid.appendChild(c));
}

/* ══ SLIDER — real per-product images injected from React ══ */
const slImgs = __SLIDER_DATA__;
const slIdx = {};
function slide(id,dir,e) {
  e.stopPropagation();
  const imgs = slImgs[id]; if (!imgs || !imgs.length) return;
  slIdx[id] = ((slIdx[id]||0) + dir + imgs.length) % imgs.length;
  const imgEl = document.getElementById('img-' + id);
  if (imgEl) imgEl.src = imgs[slIdx[id]];
  document.querySelectorAll('#dots-' + id + ' .sl-dot').forEach((d,i)=>d.classList.toggle('on', i===slIdx[id]));
}
function setSlide(id, i, e) {
  e.stopPropagation();
  const imgs = slImgs[id]; if (!imgs || !imgs[i]) return;
  slIdx[id] = i;
  const imgEl = document.getElementById('img-' + id);
  if (imgEl) imgEl.src = imgs[i];
  document.querySelectorAll('#dots-' + id + ' .sl-dot').forEach((d,k)=>d.classList.toggle('on', k===i));
}


/* ══ COPY CODE ══ */
// ══ Navigation via postMessage to React parent ══
function goTo(path) { window.parent.postMessage({ type: 'NAVIGATE', path }, '*'); }
function goBack()   { window.parent.postMessage({ type: 'BACK' }, '*'); }

function doCheckout() {
  if (cartCount() === 0) return;
  const cartArray = Object.values(cart).map(i => ({
    _id: i.id, nameAr: i.name, name: i.name,
    price: i.price, qty: i.qty,
    images: i.img ? [{ url: i.img }] : []
  }));
  window.parent.postMessage({
    type: 'CHECKOUT',
    cart: cartArray,
    couponCode: appliedCoupon,
    discount: appliedDiscount
  }, '*');
}

function copyCode(code) {
  navigator.clipboard?.writeText(code).then(()=>{
    const el = document.getElementById('announce');
    const orig = el.innerHTML;
    el.innerHTML = \`✅ تم نسخ الكود: \${code}\`;
    setTimeout(()=>el.innerHTML=orig,2000);
  });
}

/* ══ BOTTOM NAV ══ */
function setNav(btn) { document.querySelectorAll('.bn-item').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); }

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function focusSearch() {
  const isMobile = window.innerWidth <= 768;
  const inp = isMobile
    ? document.getElementById('srch-mobile')
    : document.getElementById('srch-desktop');
  if (inp) { inp.focus(); inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

function goAccount() {
  if (__IS_LOGGED_IN__) goTo('/customer/dashboard');
  else goTo('/customer/login');
}

/* ESC */
document.addEventListener('keydown', e=>{if(e.key==='Escape')closeCart()});

/* Init */
updateUI();
</script>
</body>
</html>
`
