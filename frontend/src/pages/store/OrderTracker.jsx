import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BASE } from '../../services/api'

const G = '#D4AF37'

const STEPS = [
  { key: 'new',        label: 'تم الاستلام',  icon: '📋' },
  { key: 'confirmed',  label: 'تم التأكيد',   icon: '✅' },
  { key: 'processing', label: 'جاري التجهيز', icon: '⚙️' },
  { key: 'shipped',    label: 'في الطريق',    icon: '🚚' },
  { key: 'delivered',  label: 'تم التوصيل',   icon: '🎉' },
]
const STEP_IDX = { new:0, confirmed:1, processing:2, shipped:3, delivered:4, cancelled:-1 }
const PAY_L = { cash:'كاش عند الاستلام 💵', vodafone_cash:'فودافون كاش 📱', instapay:'انستاباي ⚡', fawry:'فوري 🏪' }

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h) }, [])
  return w
}

export default function OrderTracker() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const w = useW()
  const mob = w < 768

  const [orderNum, setOrderNum] = useState(params.get('order') || '')
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const track = async (num) => {
    const n = (num || orderNum).trim().toUpperCase()
    if (!n) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res = await fetch(`${BASE}/customer/track/${n}`).then(r => r.json())
      if (res.success) setOrder(res.order)
      else setError('الطلب مش موجود — تأكد من الرقم')
    } catch { setError('خطأ في الاتصال بالسيرفر') }
    setLoading(false)
  }

  // Auto-track if order number in URL
  useEffect(() => { if (params.get('order')) track(params.get('order')) }, [])

  const stepIdx = order ? (STEP_IDX[order.orderStatus] ?? 0) : -1
  const cancelled = order?.orderStatus === 'cancelled'

  return (
    <div style={{ minHeight:'100vh', background:'#060F1E', fontFamily:'Tajawal', direction:'rtl', color:'#fff', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .tr-inp:focus{border-color:#D4AF37!important;background:rgba(212,175,55,.05)!important;outline:none}
      `}</style>

      {/* BG ∞ */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize: mob?'80vw':'50vw', color:'rgba(212,175,55,.02)', fontWeight:900, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>∞</div>

      {/* ── Header ── */}
      <header style={{ background:'rgba(13,27,46,.97)', borderBottom:'1px solid rgba(255,255,255,.06)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
        <div style={{ maxWidth:860, margin:'0 auto', padding: mob?'10px 14px':'12px 32px', display:'flex', alignItems:'center', gap:12, justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Back button — FIXED */}
            <button
              onClick={() => {
                // Try to go back, if no history go to home
                if (window.history.length > 1) nav(-1)
                else nav('/')
              }}
              style={{ background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.45)', cursor:'pointer', fontSize:'.76rem', fontFamily:'Tajawal', padding:'6px 12px', display:'flex', alignItems:'center', gap:5, transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=G; e.currentTarget.style.color=G }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='rgba(255,255,255,.45)' }}>
              → رجوع
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, border:`1.5px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', color:G, fontSize:'.9rem' }}>∞</div>
            <div>
              <div style={{ fontWeight:900, color:'#fff', fontSize:'.85rem', letterSpacing:1.5 }}>دايم</div>
              <div style={{ fontSize:'.36rem', letterSpacing:3, color:`${G}55`, textTransform:'uppercase' }}>تتبع طلبك</div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:860, margin:'0 auto', padding: mob?'24px 14px':'40px 32px', position:'relative', zIndex:2 }}>

        {/* ── Search box ── */}
        <div style={{ textAlign:'center', marginBottom: order ? 28 : 60 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🔍</div>
          <h1 style={{ fontFamily:'Playfair Display, serif', fontSize: mob?'1.8rem':'2.4rem', fontWeight:700, marginBottom:8, lineHeight:1.1 }}>
            تتبع <em style={{ color:G, fontStyle:'italic' }}>طلبك</em>
          </h1>
          <p style={{ fontSize:'.82rem', color:'rgba(255,255,255,.3)', marginBottom:28, fontFamily:'Tajawal' }}>
            ادخل رقم الطلب اللي جالك في رسالة التأكيد
          </p>

          <form onSubmit={e => { e.preventDefault(); track() }}
            style={{ display:'flex', gap:0, maxWidth:500, margin:'0 auto', overflow:'hidden', border:`1px solid ${error?'rgba(239,68,68,.3)':G+'30'}`, transition:'border .2s' }}>
            <button type="submit" disabled={loading}
              style={{ padding:'0 20px', background: loading?'rgba(212,175,55,.4)':G, border:'none', color:'#0C2540', fontFamily:'Tajawal', fontWeight:900, cursor: loading?'not-allowed':'pointer', fontSize:'.85rem', flexShrink:0, transition:'all .2s', whiteSpace:'nowrap' }}>
              {loading ? '⏳' : 'تتبع ←'}
            </button>
            <input
              value={orderNum}
              onChange={e => setOrderNum(e.target.value.toUpperCase())}
              placeholder="DAY-00022"
              className="tr-inp"
              style={{ flex:1, padding:'13px 14px', background:'rgba(255,255,255,.03)', border:'none', fontFamily:'monospace', fontSize:'1rem', color:'#fff', letterSpacing:2, direction:'ltr', textAlign:'center', width:'100%' }}
            />
          </form>

          {error && (
            <div style={{ marginTop:12, color:'#FCA5A5', fontSize:'.78rem', fontFamily:'Tajawal' }}>⚠️ {error}</div>
          )}
        </div>

        {/* ── Order Card ── */}
        {order && (
          <div style={{ animation:'fi .4s ease both' }}>

            {/* Summary */}
            <div style={{ background:'rgba(255,255,255,.025)', border:`1px solid ${G}20`, padding: mob?'16px 14px':'20px 24px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${G}50,transparent)` }} />
              <div>
                <div style={{ fontSize:'.58rem', letterSpacing:3, color:`${G}77`, textTransform:'uppercase', fontWeight:800, marginBottom:4 }}>رقم الطلب</div>
                <div style={{ fontFamily:'monospace', fontSize:'1.1rem', fontWeight:700, color:G, letterSpacing:2 }}>{order.orderNumber}</div>
                <div style={{ fontSize:'.68rem', color:'rgba(255,255,255,.3)', marginTop:3 }}>
                  {new Date(order.createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })}
                </div>
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:'.58rem', letterSpacing:3, color:'rgba(255,255,255,.25)', textTransform:'uppercase', fontWeight:800, marginBottom:4 }}>الإجمالي</div>
                <div style={{ fontFamily:'Playfair Display, serif', fontSize:'1.5rem', fontWeight:700, color:'#fff' }}>{order.finalPrice?.toLocaleString('ar-EG')} ج</div>
                <div style={{ fontSize:'.68rem', color:'rgba(255,255,255,.3)', marginTop:3 }}>{PAY_L[order.paymentMethod] || order.paymentMethod}</div>
              </div>
            </div>

            {/* Store */}
            {order.store && (
              <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', padding: mob?'12px 14px':'14px 24px', marginBottom:12, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                onClick={() => nav(`/store/${order.store.slug}`)}>
                {order.store.logo && (
                  <div style={{ width:40, height:40, flexShrink:0, overflow:'hidden', border:`1px solid ${G}20` }}>
                    <img src={order.store.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize:'.58rem', color:'rgba(255,255,255,.25)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>المتجر</div>
                  <div style={{ fontSize:'.88rem', fontWeight:700, color:'#fff' }}>{order.store.name}</div>
                </div>
                <div style={{ marginRight:'auto', color:'rgba(255,255,255,.2)', fontSize:'.75rem' }}>←</div>
              </div>
            )}

            {/* Status Timeline */}
            <div style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', padding: mob?'20px 14px':'24px', marginBottom:12, position:'relative', overflow:'hidden' }}>
              <div style={{ fontSize:'.52rem', letterSpacing:3, color:G, textTransform:'uppercase', fontWeight:800, marginBottom:20 }}>حالة الطلب</div>

              {cancelled ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:10 }}>❌</div>
                  <div style={{ color:'#FCA5A5', fontWeight:700, fontSize:'1rem' }}>تم إلغاء الطلب</div>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', position:'relative', overflowX: mob?'auto':'visible', paddingBottom: mob?4:0 }}>
                  {/* Progress line */}
                  <div style={{ position:'absolute', top: mob?18:22, right: mob?20:20, left: mob?20:20, height:2, background:'rgba(255,255,255,.06)', zIndex:0 }}>
                    <div style={{ height:'100%', background:G, width: stepIdx < 0 ? '0%' : `${(stepIdx / (STEPS.length-1)) * 100}%`, transition:'width .6s ease' }} />
                  </div>

                  {STEPS.map((s, i) => {
                    const done    = i <= stepIdx
                    const current = i === stepIdx
                    return (
                      <div key={s.key} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, position:'relative', zIndex:1, flex:1, minWidth: mob?64:0 }}>
                        <div style={{
                          width: mob?36:44, height: mob?36:44, borderRadius:'50%',
                          background: done ? (current ? G : `${G}22`) : 'rgba(255,255,255,.05)',
                          border: `2px solid ${done ? G : 'rgba(255,255,255,.1)'}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize: mob?'.9rem':'1.1rem',
                          boxShadow: current ? `0 0 0 4px ${G}22, 0 0 16px ${G}44` : 'none',
                          transition:'all .4s',
                          animation: current ? 'pulse 2s ease infinite' : 'none',
                        }}>
                          {s.icon}
                        </div>
                        <div style={{ fontSize: mob?'.52rem':'.6rem', color: done ? (current ? G : 'rgba(255,255,255,.5)') : 'rgba(255,255,255,.2)', fontWeight: current?800:400, textAlign:'center', fontFamily:'Tajawal', lineHeight:1.3 }}>
                          {s.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Products */}
            {order.items?.length > 0 && (
              <div style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', padding: mob?'16px 14px':'20px 24px', marginBottom:12 }}>
                <div style={{ fontSize:'.52rem', letterSpacing:3, color:G, textTransform:'uppercase', fontWeight:800, marginBottom:16 }}>المنتجات</div>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom: i < order.items.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none', alignItems:'center' }}>
                    <div style={{ width:44, height:44, flexShrink:0, background:'rgba(255,255,255,.04)', border:`1px solid ${G}15`, overflow:'hidden' }}>
                      {item.image ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:`${G}33`, fontSize:'1.2rem' }}>◆</div>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.82rem', fontWeight:700, color:'#fff', marginBottom:2 }}>{item.nameAr}</div>
                      <div style={{ fontSize:'.65rem', color:'rgba(255,255,255,.3)' }}>الكمية: {item.quantity}</div>
                    </div>
                    <div style={{ fontFamily:'Playfair Display, serif', fontSize:'.88rem', fontWeight:700, color:G, flexShrink:0 }}>
                      {(item.price * item.quantity)?.toLocaleString('ar-EG')} ج
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing breakdown */}
            <div style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', padding: mob?'16px 14px':'20px 24px' }}>
              <div style={{ fontSize:'.52rem', letterSpacing:3, color:G, textTransform:'uppercase', fontWeight:800, marginBottom:16 }}>الفاتورة</div>
              {[
                ['المنتجات', `${order.totalPrice?.toLocaleString('ar-EG')} ج`],
                ['الشحن', `${(order.shippingPrice||0).toLocaleString('ar-EG')} ج`],
                order.discount > 0 && ['خصم', `- ${order.discount?.toLocaleString('ar-EG')} ج`],
              ].filter(Boolean).map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.04)', fontSize:'.76rem' }}>
                  <span style={{ color:'rgba(255,255,255,.35)' }}>{l}</span>
                  <span style={{ color: l==='خصم' ? '#86EFAC' : 'rgba(255,255,255,.6)', fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4 }}>
                <span style={{ fontWeight:900, color:'#fff', fontSize:'.85rem' }}>الإجمالي</span>
                <span style={{ fontFamily:'Playfair Display, serif', fontSize:'1.1rem', fontWeight:700, color:G }}>{order.finalPrice?.toLocaleString('ar-EG')} ج</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
