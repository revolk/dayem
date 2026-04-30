import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { storeAPI } from '../../services/api'

// Hook للـ responsive
const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function CustomerStore() {
  const { slug } = useParams()
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 768
  const isTablet = w >= 768 && w < 1024

  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  useEffect(() => { load() }, [slug])

  const load = async () => {
    const [sr, pr] = await Promise.all([storeAPI.getStore(slug), storeAPI.getProducts(slug)])
    if (!sr.success) { setNotFound(true); setLoading(false); return }
    setStore(sr.store)
    setProducts(pr.products || [])
    setLoading(false)
  }

  const addToCart = p => {
    const ex = cart.find(i => i._id === p._id)
    if (ex) setCart(cart.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i))
    else setCart([...cart, { ...p, qty: 1 }])
  }

  const removeFromCart = id => setCart(cart.filter(i => i._id !== id))
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(cart.map(i => i._id === id ? { ...i, qty } : i))
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const categories = ['الكل', ...new Set(products.filter(p => p.category).map(p => p.category))]
  const filtered = products.filter(p => {
    const matchSearch = !search || p.nameAr?.includes(search) || p.name?.includes(search)
    const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory
    return matchSearch && matchCat
  })

  const cols = isMobile ? 2 : isTablet ? 3 : 4

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', color: 'rgba(212,175,55,.4)', marginBottom: 12 }}>∞</div>
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '.82rem' }}>جاري التحميل...</div>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#060F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: 'rgba(255,255,255,.15)', marginBottom: 14 }}>◈</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', marginBottom: 8 }}>المتجر غير موجود</h2>
        <button onClick={() => nav('/')} style={{ background: '#D4AF37', color: '#0C2540', border: 'none', padding: '10px 24px', fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer', marginTop: 16 }}>الرئيسية</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060F1E', fontFamily: 'Tajawal', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', borderBottom: '1px solid rgba(212,175,55,.1)', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
        <div style={{ padding: isMobile ? '0 14px' : '0 5%' }}>

          {/* Main header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: isMobile ? 56 : 64, gap: 10 }}>

            {/* Logo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexShrink: 0 }}>
              <div style={{ width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, background: store?.logo ? '#fff' : 'linear-gradient(135deg,#D4AF37,#A88C2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '.9rem' : '1.1rem', fontWeight: 900, color: '#0C2540', flexShrink: 0, overflow: 'hidden', border: store?.logo ? '1px solid rgba(212,175,55,.2)' : 'none', padding: store?.logo ? 3 : 0 }}>
                {store?.logo ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : store?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '.85rem' : '1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, maxWidth: isMobile ? 120 : 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store?.name}</div>
                {!isMobile && store?.description && <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{store.description.slice(0, 35)}</div>}
              </div>
            </div>

            {/* Search - hidden on mobile, shown below */}
            {!isMobile && (
              <div style={{ flex: 1, maxWidth: 360, margin: '0 20px', position: 'relative' }}>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,.4)', fontSize: '.75rem', pointerEvents: 'none' }}>◈</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..."
                  style={{ width: '100%', padding: '9px 34px 9px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(212,175,55,.12)', fontFamily: 'Tajawal', fontSize: '.82rem', color: '#fff', outline: 'none' }} />
              </div>
            )}

            {/* Cart + Account */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Account button */}
              {localStorage.getItem('dayem_customer_token') ? (
                <button onClick={() => nav('/customer/dashboard')}
                  style={{ background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.2)', color: '#D4AF37', padding: isMobile ? '8px 10px' : '9px 14px', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '.72rem' : '.75rem', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s' }}>
                  👤 {isMobile ? '' : JSON.parse(localStorage.getItem('dayem_customer') || '{}').name?.split(' ')[0]}
                </button>
              ) : (
                <button onClick={() => nav('/customer/login', { state: { redirect: `/store/${slug}` } })}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)', padding: isMobile ? '8px 10px' : '9px 14px', fontFamily: 'Tajawal', fontSize: isMobile ? '.72rem' : '.75rem', cursor: 'pointer', transition: 'all .2s' }}>
                  {isMobile ? '👤' : 'دخول'}
                </button>
              )}
              {/* Cart */}
              <button onClick={() => setShowCart(!showCart)} style={{
                background: cartCount > 0 ? '#D4AF37' : 'transparent',
                border: `1px solid ${cartCount > 0 ? '#D4AF37' : 'rgba(212,175,55,.25)'}`,
                color: cartCount > 0 ? '#0C2540' : '#D4AF37',
                padding: isMobile ? '8px 12px' : '9px 16px',
                fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: isMobile ? '.75rem' : '.78rem', transition: 'all .25s'
              }}>
                ◆ {cartCount > 0 ? (isMobile ? cartCount : `${cartCount} · ${total} ج`) : 'السلة'}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isMobile && (
            <div style={{ paddingBottom: 10, position: 'relative' }}>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-60%)', color: 'rgba(212,175,55,.4)', fontSize: '.75rem', pointerEvents: 'none' }}>◈</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..."
                style={{ width: '100%', padding: '9px 34px 9px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(212,175,55,.12)', fontFamily: 'Tajawal', fontSize: '.82rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Categories */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,.04)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  padding: isMobile ? '8px 14px' : '10px 18px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: selectedCategory === cat ? '#D4AF37' : 'rgba(255,255,255,.35)',
                  fontFamily: 'Tajawal', fontSize: isMobile ? '.7rem' : '.72rem',
                  fontWeight: selectedCategory === cat ? 700 : 400,
                  borderBottom: `2px solid ${selectedCategory === cat ? '#D4AF37' : 'transparent'}`,
                  transition: 'all .2s', whiteSpace: 'nowrap', marginBottom: -1
                }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: isMobile ? '20px 14px' : '32px 5%' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '2rem', color: 'rgba(212,175,55,.1)', marginBottom: 14 }}>◆</div>
            <h3 style={{ color: 'rgba(255,255,255,.3)', marginBottom: 8, fontWeight: 700 }}>
              {search ? 'مفيش نتايج' : 'المتجر فاضي لسه'}
            </h3>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 1, background: '#D4AF37' }} />
                <h2 style={{ fontSize: isMobile ? '.88rem' : '1rem', fontWeight: 800, color: '#fff' }}>
                  {selectedCategory === 'الكل' ? 'جميع المنتجات' : selectedCategory}
                  <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.25)', marginRight: 6 }}>({filtered.length})</span>
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 10 : 16 }}>
              {filtered.map(p => {
                const inCart = cart.find(i => i._id === p._id)
                return (
                  <div key={p._id} style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', transition: 'all .3s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,.3)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.4)'; e.currentTarget.style.background = 'rgba(255,255,255,.055)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,.035)' }}>
                    {/* Square Image */}
                    <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: 'rgba(255,255,255,.04)' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: isMobile ? 4 : 8 }} />
                          : <span style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', color: 'rgba(212,175,55,.1)' }}>◆</span>
                        }
                      </div>
                      {p.stock === 0 && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 700, fontSize: '.7rem' }}>نفذ</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #0C2540, #D4AF37)' }} />
                    </div>

                    <div style={{ padding: isMobile ? '8px 8px 10px' : '12px 14px 14px' }}>
                      <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: 6, fontSize: isMobile ? '.75rem' : '.85rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: isMobile ? '2.2em' : '2.4em' }}>
                        {p.nameAr || p.name}
                      </h3>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? '.9rem' : '1.05rem', fontWeight: 700, color: '#D4AF37' }}>
                          {p.price} <span style={{ fontFamily: 'Tajawal', fontSize: '.6rem', color: 'rgba(255,255,255,.3)' }}>ج</span>
                        </span>
                        {p.stock > 0 && <span style={{ fontSize: '.55rem', color: '#86EFAC', background: 'rgba(34,197,94,.1)', padding: '2px 6px', fontWeight: 700 }}>متاح</span>}
                      </div>

                      {p.stock > 0 && (
                        inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.15)' }}>
                            <button onClick={() => updateQty(p._id, inCart.qty - 1)} style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 30, background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '.9rem', fontWeight: 700 }}>−</button>
                            <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, color: '#fff', fontSize: isMobile ? '.72rem' : '.8rem' }}>{inCart.qty}</span>
                            <button onClick={() => updateQty(p._id, inCart.qty + 1)} style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 30, background: '#D4AF37', border: 'none', color: '#0C2540', cursor: 'pointer', fontSize: '.9rem', fontWeight: 700 }}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(p)} style={{ width: '100%', padding: isMobile ? '7px' : '9px', background: 'rgba(212,175,55,.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,.2)', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '.7rem' : '.78rem', transition: 'all .25s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.color = '#0C2540' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,.08)'; e.currentTarget.style.color = '#D4AF37' }}>
                            + أضف
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#0A1628', borderTop: '1px solid rgba(212,175,55,.08)', padding: isMobile ? '14px' : '18px 5%', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.2)' }}>{store?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '.5rem', letterSpacing: 3, color: 'rgba(255,255,255,.15)', textTransform: 'uppercase' }}>مدعوم بـ</span>
            <span style={{ color: '#D4AF37', fontWeight: 900, fontSize: '.7rem', letterSpacing: 2, opacity: .7 }}>DAYEM ∞</span>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: isMobile ? '90%' : 380, maxWidth: 400, background: '#0A1628', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(212,175,55,.1)' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
            <div style={{ padding: '18px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase', fontWeight: 800, marginBottom: 3 }}>سلة التسوق</div>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: '.95rem' }}>{cartCount} منتج</div>
              </div>
              <button onClick={() => setShowCart(false)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.35)', width: 32, height: 32, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', color: 'rgba(212,175,55,.1)', marginBottom: 12 }}>◆</div>
                <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '.85rem' }}>السلة فاضية</div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px' }}>
                  {cart.map(i => (
                    <div key={i._id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,.05)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i.images?.[0]?.url ? <img src={i.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'rgba(212,175,55,.2)' }}>◆</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '.8rem', marginBottom: 6 }}>{i.nameAr || i.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => updateQty(i._id, i.qty - 1)} style={{ width: 24, height: 24, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ color: '#fff', fontSize: '.82rem', fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{i.qty}</span>
                            <button onClick={() => updateQty(i._id, i.qty + 1)} style={{ width: 24, height: 24, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', color: '#D4AF37', cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          </div>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '.88rem' }}>{i.price * i.qty} ج</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(212,175,55,.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.78rem', color: 'rgba(255,255,255,.3)' }}>
                    <span>المجموع</span><span>{total} ج</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '.78rem' }}>
                    <span style={{ color: 'rgba(255,255,255,.3)' }}>الشحن</span>
                    <span style={{ color: total >= 500 ? '#86EFAC' : 'rgba(255,255,255,.3)', fontWeight: total >= 500 ? 700 : 400 }}>{total >= 500 ? 'مجاني ✓' : '60 ج'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontWeight: 900, color: '#fff' }}>الإجمالي</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '1.1rem' }}>{total + (total >= 500 ? 0 : 60)} ج</span>
                  </div>
                  <button onClick={() => { setShowCart(false); nav(`/store/${slug}/checkout`, { state: { cart, store } }) }}
                    style={{ width: '100%', padding: 13, background: '#D4AF37', color: '#0C2540', border: 'none', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem' }}>
                    إتمام الطلب ←
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cartCount > 0 && !showCart && (
        <button onClick={() => setShowCart(true)}
          style={{ position: 'fixed', bottom: isMobile ? 16 : 24, left: '50%', transform: 'translateX(-50%)', background: '#D4AF37', color: '#0C2540', border: 'none', padding: isMobile ? '11px 20px' : '12px 28px', fontFamily: 'Tajawal', fontWeight: 900, cursor: 'pointer', borderRadius: 50, fontSize: isMobile ? '.8rem' : '.85rem', boxShadow: '0 8px 28px rgba(212,175,55,.4)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 150, whiteSpace: 'nowrap' }}>
          ◆ {cartCount} منتج · {total} ج · اطلب ←
        </button>
      )}
    </div>
  )
}
