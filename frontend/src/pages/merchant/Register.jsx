import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantAPI } from '../../services/api'

const G = '#D4AF37'

const PLANS = [
  { id:'starter', name:'ستارتر', price:'100', period:'شهر', products:'5 منتجات', color:'rgba(107,114,128,.6)', features:['متجر كامل','رابط مخصص','كل طرق الدفع','دعم فني'] },
  { id:'merchant', name:'تاجر', price:'199', period:'شهر', products:'20 منتج', color:'rgba(96,165,250,.8)', popular:true, features:['20 منتج','تقارير مبيعات','كوبونات وخصومات','AI كتالوج','إشعارات فورية'] },
  { id:'pro', name:'برو', price:'349', period:'شهر', products:'غير محدود', color:G, features:['منتجات غير محدودة','متاجر متعددة','تحليلات متقدمة','API Integration','مدير حساب'] },
]

const inp = (val) => ({
  width:'100%', padding:'12px 14px', boxSizing:'border-box',
  background: val?'rgba(212,175,55,.04)':'rgba(255,255,255,.04)',
  border:`1px solid ${val?'rgba(212,175,55,.25)':'rgba(255,255,255,.08)'}`,
  fontFamily:'Tajawal', fontSize:'.9rem', color:'#fff', outline:'none', transition:'all .2s'
})

export default function Register() {
  const nav = useNavigate()
  const [step, setStep]   = useState(1) // 1=info, 2=plan
  const [form, setForm]   = useState({ name:'', email:'', password:'', storeName:'' })
  const [plan, setPlan]   = useState('starter')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const f = (k) => (e) => setForm({...form, [k]: e.target.value})

  const nextStep = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.storeName)
      return setError('كل الحقول مطلوبة')
    if (form.password.length < 6)
      return setError('كلمة المرور 6 أحرف على الأقل')
    setError(''); setStep(2)
  }

  const submit = async () => {
    setLoading(true); setError('')
    const res = await merchantAPI.register({ ...form, planId: plan })
    if (res.success) {
      localStorage.setItem('dayem_token', res.token)
      localStorage.setItem('dayem_merchant', JSON.stringify(res.merchant))
      nav('/dashboard')
    } else {
      setError(res.message || 'حدث خطأ')
      setStep(1)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060F1E', fontFamily:'Tajawal', direction:'rtl', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', fontSize:'min(60vw,600px)', color:'rgba(212,175,55,.02)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontWeight:900, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>∞</div>

      {/* Header */}
      <div style={{ padding:'20px 5%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div onClick={()=>nav('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div style={{ width:36, height:36, border:`1.5px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', color:G }}>∞</div>
          <span style={{ fontWeight:900, color:'#fff', fontSize:'.95rem', letterSpacing:2 }}>دايم</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Steps */}
          {[1,2].map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', border:`2px solid ${step>=s?G:'rgba(255,255,255,.1)'}`, background:step===s?G:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:900, color:step===s?'#0C2540':step>s?G:'rgba(255,255,255,.3)', transition:'all .3s' }}>{s}</div>
              {s < 2 && <div style={{ width:32, height:1, background:step>1?G:'rgba(255,255,255,.1)', transition:'background .3s' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'20px 20px 60px' }}>

        {/* Step 1: Info */}
        {step === 1 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <h1 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(1.8rem,4vw,2.4rem)', fontWeight:700, color:'#fff', marginBottom:8 }}>
                ابدأ <em style={{ color:G, fontStyle:'italic' }}>متجرك</em>
              </h1>
              <p style={{ color:'rgba(255,255,255,.3)', fontSize:'.82rem' }}>متجر كامل في 5 دقايق بدون خبرة تقنية</p>
            </div>

            <div style={{ background:'rgba(255,255,255,.03)', border:`1px solid rgba(212,175,55,.12)`, padding:'32px 28px', position:'relative' }}>
              <div style={{ position:'absolute', top:-1, right:-1, width:20, height:20, borderTop:`2px solid ${G}`, borderRight:`2px solid ${G}` }} />
              <div style={{ position:'absolute', bottom:-1, left:-1, width:20, height:20, borderBottom:`2px solid ${G}`, borderLeft:`2px solid ${G}` }} />

              {/* Google OAuth */}
              <button onClick={()=>alert('قريباً')} style={{ width:'100%', padding:'12px', marginBottom:16, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', fontFamily:'Tajawal', fontWeight:700, cursor:'pointer', fontSize:'.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .25s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                التسجيل بـ Google
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
                <span style={{ fontSize:'.62rem', color:'rgba(255,255,255,.2)', letterSpacing:2 }}>أو بالبريد</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
              </div>

              {error && <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#FCA5A5', padding:'10px 14px', marginBottom:14, fontSize:'.8rem', fontWeight:600 }}>⚠️ {error}</div>}

              <form onSubmit={nextStep}>
                {[
                  { k:'name',      label:'الاسم الكامل',         ph:'محمد أحمد' },
                  { k:'storeName', label:'اسم المتجر',           ph:'متجر أحمد للأزياء' },
                  { k:'email',     label:'البريد الإلكتروني',   ph:'example@email.com', type:'email' },
                ].map(field => (
                  <div key={field.k} style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:'.62rem', fontWeight:700, color:'rgba(255,255,255,.3)', marginBottom:6, letterSpacing:1.5, textTransform:'uppercase' }}>{field.label}</label>
                    <input type={field.type||'text'} value={form[field.k]} onChange={f(field.k)} placeholder={field.ph} required
                      style={inp(form[field.k])}
                      onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.06)'}}
                      onBlur={e=>{e.target.style.borderColor=form[field.k]?'rgba(212,175,55,.25)':'rgba(255,255,255,.08)';e.target.style.background=form[field.k]?'rgba(212,175,55,.04)':'rgba(255,255,255,.04)'}}/>
                  </div>
                ))}

                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:'.62rem', fontWeight:700, color:'rgba(255,255,255,.3)', marginBottom:6, letterSpacing:1.5, textTransform:'uppercase' }}>كلمة المرور</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPass?'text':'password'} value={form.password} onChange={f('password')} placeholder="••••••••" required minLength={6}
                      style={{ ...inp(form.password), paddingLeft:44 }}
                      onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.06)'}}
                      onBlur={e=>{e.target.style.borderColor=form.password?'rgba(212,175,55,.25)':'rgba(255,255,255,.08)';e.target.style.background=form.password?'rgba(212,175,55,.04)':'rgba(255,255,255,.04)'}}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.3)', cursor:'pointer', fontSize:'.8rem', padding:0 }}>
                      {showPass?'◉':'◎'}
                    </button>
                  </div>
                </div>

                <button type="submit" style={{ width:'100%', padding:'13px', background:G, color:'#0C2540', border:'none', fontFamily:'Tajawal', fontSize:'.9rem', fontWeight:900, cursor:'pointer' }}>
                  التالي — اختار الخطة ←
                </button>
              </form>

              <p style={{ textAlign:'center', marginTop:16, fontSize:'.78rem', color:'rgba(255,255,255,.25)' }}>
                عندك حساب؟{' '}
                <span onClick={()=>nav('/login')} style={{ color:G, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>سجّل دخول</span>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.3)', cursor:'pointer', fontFamily:'Tajawal', fontSize:'.76rem', marginBottom:16 }}>→ رجوع</button>
              <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'1.8rem', fontWeight:700, color:'#fff', marginBottom:8 }}>اختار <em style={{ color:G, fontStyle:'italic' }}>خطتك</em></h2>
              <p style={{ color:'rgba(255,255,255,.3)', fontSize:'.82rem' }}>تقدر تغير الخطة في أي وقت</p>
            </div>

            {error && <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#FCA5A5', padding:'10px 14px', marginBottom:14, fontSize:'.8rem', fontWeight:600 }}>⚠️ {error}</div>}

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={()=>setPlan(p.id)}
                  style={{ padding:'18px 20px', border:`2px solid ${plan===p.id?p.color:'rgba(255,255,255,.07)'}`, background:plan===p.id?`${p.color}08`:'rgba(255,255,255,.02)', cursor:'pointer', position:'relative', transition:'all .25s' }}>
                  {p.popular && <div style={{ position:'absolute', top:-1, left:16, background:p.color, color:'#060F1E', fontSize:'.55rem', fontWeight:900, padding:'2px 10px', letterSpacing:1.5 }}>الأكثر شيوعاً</div>}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${p.color}`, background:plan===p.id?p.color:'transparent', transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {plan===p.id && <div style={{ width:6, height:6, borderRadius:'50%', background:'#060F1E' }} />}
                      </div>
                      <span style={{ fontWeight:900, color:'#fff', fontSize:'.95rem' }}>{p.name}</span>
                      <span style={{ fontSize:'.65rem', color:p.color, background:`${p.color}15`, padding:'2px 8px', fontWeight:700 }}>{p.products}</span>
                    </div>
                    <div style={{ textAlign:'left' }}>
                      <span style={{ fontFamily:'Playfair Display, serif', fontSize:'1.4rem', fontWeight:700, color:p.color }}>{p.price}</span>
                      <span style={{ fontSize:'.65rem', color:'rgba(255,255,255,.3)', marginRight:3 }}>ج/{p.period}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {p.features.map(feat => (
                      <span key={feat} style={{ fontSize:'.62rem', color:'rgba(255,255,255,.4)', display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ color:p.color, fontSize:'.55rem' }}>◆</span>{feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={submit} disabled={loading}
              style={{ width:'100%', padding:'14px', background:loading?'rgba(212,175,55,.4)':G, color:'#0C2540', border:'none', fontFamily:'Tajawal', fontSize:'.92rem', fontWeight:900, cursor:loading?'not-allowed':'pointer', transition:'all .2s' }}>
              {loading ? '⏳ جاري الإنشاء...' : `ابدأ متجرك — ${PLANS.find(p=>p.id===plan)?.price} ج/شهر ←`}
            </button>

            <p style={{ textAlign:'center', marginTop:12, fontSize:'.72rem', color:'rgba(255,255,255,.2)' }}>
              ✓ تقدر تدفع بعدين من الداشبورد
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
