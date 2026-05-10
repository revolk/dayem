import { useState, useEffect, useRef } from 'react'
import { merchantAPI, BASE } from '../../services/api'
import Sidebar from '../../components/Sidebar'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dayem_token')}`
})

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const G = '#D4AF37'

const Toast = ({ msg, type }) => (
  <div style={{
    position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',
    background:'#070D1A',
    border:`1px solid ${type==='success'?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,
    padding:'12px 20px',zIndex:9999,display:'flex',alignItems:'center',gap:10,
    boxShadow:'0 8px 32px rgba(0,0,0,.5)',minWidth:240,
    animation:'toastIn .3s ease both',
  }}>
    <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    <span style={{fontSize:'.9rem'}}>{type==='success'?'✓':'⚠'}</span>
    <span style={{fontFamily:'Tajawal',fontSize:'.82rem',fontWeight:600,color:'#fff'}}>{msg}</span>
  </div>
)

const Section = ({ title, icon, children, gold }) => (
  <div style={{
    background: gold?'rgba(212,175,55,.04)':'rgba(255,255,255,.025)',
    border:`1px solid ${gold?'rgba(212,175,55,.15)':'rgba(255,255,255,.06)'}`,
    position:'relative',overflow:'hidden',marginBottom:14
  }}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(212,175,55,.2),transparent)'}}/>
    {gold && <div style={{position:'absolute',top:-1,right:-1,width:16,height:16,borderTop:`2px solid ${G}`,borderRight:`2px solid ${G}`}}/>}
    <div style={{padding:'18px 20px'}}>
      {title && (
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          {icon && <span style={{fontSize:'.9rem'}}>{icon}</span>}
          <span style={{fontSize:'.55rem',letterSpacing:3,color:G,textTransform:'uppercase',fontWeight:800}}>{title}</span>
        </div>
      )}
      {children}
    </div>
  </div>
)

const inp = (val) => ({
  width:'100%',padding:'11px 14px',boxSizing:'border-box',
  background:val?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)',
  border:`1px solid ${val?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}`,
  fontFamily:'Tajawal',fontSize:'.88rem',color:'#fff',outline:'none',transition:'all .2s'
})

const GOVS=['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']
const CATS=['ملابس وأزياء','إلكترونيات','أغذية ومشروبات','مستلزمات منزلية','مستحضرات تجميل','رياضة ولياقة','كتب وتعليم','هدايا وتذكارات','أخرى']
const PLAN_L={starter:'ستارتر — ٥ منتجات',tajer:'تاجر — ٢٠ منتج',merchant:'تاجر — ٢٠ منتج',pro:'برو — غير محدود'}

export default function Settings() {
  const w = useW()
  const mob = w < 1024
  const [merchant,setMerchant]   = useState(null)
  const [form,setForm]           = useState({name:'',description:'',phone:'',address:'',category:'',governorate:'',vodafoneCash:'',instapay:'',fawryCode:''})
  const [logoPreview,setLogo]    = useState(null)
  const [saving,setSaving]       = useState(false)
  const [uploading,setUploading] = useState(false)
  const [toast,setToast]         = useState(null)
  const [tab,setTab]             = useState('store')
  const logoRef = useRef(null)
  const [tgChatId,setTgChatId]       = useState('')
  const [tgConnected,setTgConnected] = useState(false)
  const [tgSaving,setTgSaving]       = useState(false)
  const [tgStep,setTgStep]           = useState(1)

  const toast$ = (msg,type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  useEffect(()=>{
    const m=JSON.parse(localStorage.getItem('dayem_merchant')||'{}')
    setMerchant(m)
    setForm({
      name:m?.store?.name||'',description:m?.store?.description||'',
      phone:m?.store?.phone||m?.phone||'',address:m?.store?.address||'',
      category:m?.store?.category||'',governorate:m?.store?.governorate||'',
      vodafoneCash:m?.store?.vodafoneCash||'',instapay:m?.store?.instapay||'',fawryCode:m?.store?.fawryCode||''
    })
    setLogo(m?.store?.logo||null)
    fetch(`${BASE}/merchant/telegram`,{headers:authHeaders()}).then(r=>r.json()).then(res=>{
      if(res.success){setTgConnected(res.connected);if(res.chatId)setTgChatId(res.chatId)}
    }).catch(()=>{})
  },[])

  const handleLogo = async(e)=>{
    const file=e.target.files[0]; if(!file)return
    setLogo(URL.createObjectURL(file)); setUploading(true)
    const res=await merchantAPI.uploadImage(file)
    if(res.success)logoRef.current=res.url; else toast$('فشل رفع الصورة','error')
    setUploading(false)
  }

  const save=async(e)=>{
    e.preventDefault(); if(!form.name)return toast$('اسم المتجر مطلوب','error')
    setSaving(true)
    const data={...form}; if(logoRef.current)data.logo=logoRef.current
    const res=await merchantAPI.updateStore(data)
    if(res.success){
      const m=JSON.parse(localStorage.getItem('dayem_merchant')||'{}')
      m.store={...m.store,...data}; localStorage.setItem('dayem_merchant',JSON.stringify(m))
      toast$('✓ تم حفظ الإعدادات بنجاح')
    } else toast$(res.message||'حدث خطأ','error')
    setSaving(false)
  }

  const connectTg=async()=>{
    if(!tgChatId.trim())return; setTgSaving(true)
    try{
      const res=await fetch(`${BASE}/merchant/telegram`,{method:'PUT',headers:authHeaders(),body:JSON.stringify({chatId:tgChatId.trim()})}).then(r=>r.json())
      if(res.success){setTgConnected(true);setTgStep(1);toast$('✓ تم ربط تليجرام بنجاح')}
      else toast$(res.message||'حصل خطأ','error')
    }catch{toast$('تأكد إن الـ backend شغال','error')}
    setTgSaving(false)
  }

  const disconnectTg=async()=>{
    setTgSaving(true)
    try{
      await fetch(`${BASE}/merchant/telegram`,{method:'PUT',headers:authHeaders(),body:JSON.stringify({chatId:''})})
      setTgConnected(false);setTgChatId('');toast$('تم إلغاء ربط تليجرام')
    }catch{}
    setTgSaving(false)
  }

  const storeUrl=`${window.location.origin}/store/${merchant?.store?.slug}`
  const selStyle={width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',fontFamily:'Tajawal',fontSize:'.88rem',color:'#fff',outline:'none',cursor:'pointer',boxSizing:'border-box'}
  const TABS=[{id:'store',label:'المتجر',icon:'🏪'},{id:'payment',label:'الدفع',icon:'💳'},{id:'notifications',label:'الإشعارات',icon:'🔔'}]

  return (
    <div style={{minHeight:'100vh',background:'#060F1E',fontFamily:'Tajawal',direction:'rtl'}}>
      <style>{`::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2)}select option{background:#0C2540}`}</style>
      <Sidebar active="settings"/>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
      <div style={{marginRight:mob?0:240,paddingTop:mob?52:0}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:mob?'16px 14px':'32px 40px'}}>

          {/* Header */}
          <div style={{marginBottom:28}}>
            <div style={{fontSize:'.48rem',letterSpacing:4,color:`${G}66`,textTransform:'uppercase',fontWeight:800,marginBottom:6}}>إدارة</div>
            <h1 style={{fontSize:mob?'1.3rem':'1.6rem',fontWeight:900,color:'#fff',letterSpacing:-0.5}}>الإعدادات</h1>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:2,marginBottom:24,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',padding:4}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1,padding:mob?'9px 8px':'10px 16px',border:'none',fontFamily:'Tajawal',fontSize:mob?'.72rem':'.78rem',fontWeight:700,cursor:'pointer',transition:'all .2s',
                display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                background:tab===t.id?G:'transparent',color:tab===t.id?'#0C2540':'rgba(255,255,255,.3)'
              }}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 280px',gap:14}}>

            {/* MAIN */}
            <div>

              {/* TAB: المتجر */}
              {tab==='store' && (
                <form onSubmit={save}>
                  <Section title="شعار المتجر" icon="🖼">
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <div onClick={()=>document.getElementById('logo-inp').click()}
                        style={{width:72,height:72,flexShrink:0,background:logoPreview?'transparent':'rgba(255,255,255,.04)',border:`2px dashed ${logoPreview?G:'rgba(255,255,255,.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',transition:'all .2s'}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=G}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=logoPreview?G:'rgba(255,255,255,.1)'}
                      >
                        {uploading?<span style={{fontSize:'.7rem',color:`${G}66`}}>⏳</span>
                          :logoPreview?<img src={logoPreview} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                          :<div style={{textAlign:'center'}}><div style={{fontSize:'1.2rem'}}>📷</div><div style={{fontSize:'.5rem',color:'rgba(255,255,255,.25)'}}>رفع</div></div>
                        }
                      </div>
                      <div>
                        <div style={{fontSize:'.78rem',fontWeight:700,color:'#fff',marginBottom:4}}>صورة المتجر</div>
                        <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.28)',lineHeight:1.6,marginBottom:10}}>PNG أو JPG — موصى بـ 400×400px</div>
                        <button type="button" onClick={()=>document.getElementById('logo-inp').click()}
                          style={{padding:'7px 14px',background:'transparent',border:`1px solid ${G}33`,color:`${G}88`,fontFamily:'Tajawal',fontSize:'.72rem',cursor:'pointer'}}>
                          {logoPreview?'تغيير الصورة':'رفع صورة'} ←
                        </button>
                      </div>
                    </div>
                    <input id="logo-inp" type="file" accept="image/*" onChange={handleLogo} style={{display:'none'}}/>
                  </Section>

                  <Section title="بيانات المتجر" icon="📝">
                    <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:'0 16px'}}>
                      <div style={{marginBottom:14}}>
                        <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>اسم المتجر *</label>
                        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="متجر أحمد للأزياء" style={inp(form.name)} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=form.name?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=form.name?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                      </div>
                      <div style={{marginBottom:14}}>
                        <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>رقم الواتساب</label>
                        <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="201xxxxxxxxx" dir="ltr" style={inp(form.phone)} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=form.phone?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=form.phone?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                      </div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>وصف المتجر</label>
                      <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="اكتب وصف قصير عن متجرك..." rows={3}
                        style={{width:'100%',padding:'11px 14px',background:form.description?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)',border:`1px solid ${form.description?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}`,fontFamily:'Tajawal',fontSize:'.88rem',color:'#fff',outline:'none',resize:'vertical',boxSizing:'border-box'}}
                        onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor=form.description?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)'}
                      />
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:'0 16px'}}>
                      <div style={{marginBottom:14}}>
                        <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>المحافظة</label>
                        <select value={form.governorate} onChange={e=>setForm({...form,governorate:e.target.value})} style={selStyle}>
                          <option value="">اختر المحافظة</option>
                          {GOVS.map(g=><option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div style={{marginBottom:14}}>
                        <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>التخصص</label>
                        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={selStyle}>
                          <option value="">اختر التخصص</option>
                          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>العنوان التفصيلي</label>
                      <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="الشارع، الحي، المدينة" style={inp(form.address)} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=form.address?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=form.address?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                    </div>
                  </Section>

                  <button type="submit" disabled={saving} style={{width:'100%',padding:'13px',background:saving?'rgba(212,175,55,.4)':G,border:'none',color:'#0C2540',fontFamily:'Tajawal',fontWeight:900,fontSize:'.88rem',cursor:saving?'not-allowed':'pointer',transition:'all .2s'}}>
                    {saving?'⏳ جاري الحفظ...':'✓ حفظ التغييرات'}
                  </button>
                </form>
              )}

              {/* TAB: الدفع */}
              {tab==='payment' && (
                <form onSubmit={save}>
                  <Section title="طرق الدفع" icon="💳">
                    <div style={{background:'rgba(212,175,55,.04)',border:'1px solid rgba(212,175,55,.1)',padding:'10px 14px',marginBottom:18,fontSize:'.76rem',color:'rgba(255,255,255,.45)',lineHeight:1.7}}>
                      💡 الأرقام دي بتظهر للعملاء في صفحة الدفع — تأكد إنها صح عشان تستلم فلوسك
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:'0 16px'}}>
                      {[
                        {label:'📱 فودافون كاش',key:'vodafoneCash',ph:'01xxxxxxxxx'},
                        {label:'🏦 انستاباي',key:'instapay',ph:'رقم الهاتف أو IPA address'},
                      ].map(f=>(
                        <div key={f.key} style={{marginBottom:14}}>
                          <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>{f.label}</label>
                          <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} dir="ltr" style={inp(form[f.key])} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=form[f.key]?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=form[f.key]?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{marginBottom:16}}>
                      <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>🟠 كود فوري (Fawry)</label>
                      <input value={form.fawryCode} onChange={e=>setForm({...form,fawryCode:e.target.value})} placeholder="كود الفوري الخاص بيك" dir="ltr" style={inp(form.fawryCode)} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=form.fawryCode?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=form.fawryCode?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {[{l:'فودافون كاش',a:!!form.vodafoneCash},{l:'انستاباي',a:!!form.instapay},{l:'فوري',a:!!form.fawryCode},{l:'كارت بنكي',a:true},{l:'كاش عند الاستلام',a:true}].map(m=>(
                        <div key={m.l} style={{padding:'3px 10px',fontSize:'.6rem',fontWeight:700,background:m.a?'rgba(34,197,94,.08)':'rgba(255,255,255,.04)',border:`1px solid ${m.a?'rgba(34,197,94,.2)':'rgba(255,255,255,.08)'}`,color:m.a?'#86EFAC':'rgba(255,255,255,.2)'}}>
                          {m.a?'✓':'○'} {m.l}
                        </div>
                      ))}
                    </div>
                  </Section>
                  <button type="submit" disabled={saving} style={{width:'100%',padding:'13px',background:saving?'rgba(212,175,55,.4)':G,border:'none',color:'#0C2540',fontFamily:'Tajawal',fontWeight:900,fontSize:'.88rem',cursor:saving?'not-allowed':'pointer'}}>
                    {saving?'⏳ جاري الحفظ...':'✓ حفظ بيانات الدفع'}
                  </button>
                </form>
              )}

              {/* TAB: الإشعارات */}
              {tab==='notifications' && (
                <Section title="تليجرام" icon="📨">
                  {tgConnected?(
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',marginBottom:16}}>
                        <div style={{width:8,height:8,background:'#22C55E',borderRadius:'50%',flexShrink:0,boxShadow:'0 0 8px #22C55E'}}/>
                        <span style={{fontSize:'.78rem',color:'#86EFAC',fontWeight:700}}>تليجرام مربوط ✓</span>
                        <span style={{fontSize:'.7rem',color:'rgba(255,255,255,.3)',marginRight:'auto'}}>ID: {tgChatId}</span>
                      </div>
                      <div style={{fontSize:'.76rem',color:'rgba(255,255,255,.35)',marginBottom:16,lineHeight:1.7}}>هتوصلك إشعارات فورية على تليجرام مع كل طلب جديد.</div>
                      <button onClick={disconnectTg} disabled={tgSaving} style={{padding:'10px 20px',background:'transparent',border:'1px solid rgba(239,68,68,.25)',color:'#FCA5A5',fontFamily:'Tajawal',fontWeight:700,cursor:'pointer',fontSize:'.78rem'}}>
                        {tgSaving?'...':'✕ إلغاء الربط'}
                      </button>
                    </div>
                  ):tgStep===1?(
                    <div>
                      <div style={{fontSize:'.78rem',color:'rgba(255,255,255,.45)',lineHeight:1.7,marginBottom:20}}>ربّط متجرك بتليجرام عشان توصلك إشعارات فورية مع كل طلب جديد.</div>
                      {[
                        {n:'01',text:'افتح تليجرام وابحث عن',link:'@dayem_notify_bot',href:'https://t.me/dayem_notify_bot'},
                        {n:'02',text:'اضغط Start وابعت أي رسالة للبوت'},
                        {n:'03',text:'افتح اللينك ده وانسخ الـ Chat ID',link:'getUpdates ←',href:`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN||'...'}/getUpdates`},
                      ].map((s,i)=>(
                        <div key={i} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:i<2?'1px solid rgba(255,255,255,.04)':'none'}}>
                          <div style={{width:28,height:28,flexShrink:0,border:'1px solid rgba(212,175,55,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',fontWeight:900,color:G,fontFamily:'monospace'}}>{s.n}</div>
                          <div style={{fontSize:'.78rem',color:'rgba(255,255,255,.45)',lineHeight:1.6,paddingTop:4}}>
                            {s.text} {s.link&&<a href={s.href} target="_blank" rel="noreferrer" style={{color:G,fontWeight:700,textDecoration:'none'}}>{s.link}</a>}
                          </div>
                        </div>
                      ))}
                      <button onClick={()=>setTgStep(2)} style={{marginTop:18,width:'100%',padding:'12px',background:G,border:'none',color:'#0C2540',fontFamily:'Tajawal',fontWeight:900,cursor:'pointer',fontSize:'.85rem'}}>
                        عندي الـ Chat ID — ربط الآن ←
                      </button>
                    </div>
                  ):(
                    <div>
                      <button onClick={()=>setTgStep(1)} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontFamily:'Tajawal',fontSize:'.72rem',cursor:'pointer',marginBottom:16,padding:0}}>→ رجوع</button>
                      <label style={{display:'block',fontSize:'.55rem',fontWeight:700,color:`${G}88`,marginBottom:6,letterSpacing:2,textTransform:'uppercase'}}>Chat ID</label>
                      <input type="text" placeholder="مثال: 7097105353" value={tgChatId} onChange={e=>setTgChatId(e.target.value)} dir="ltr" style={{...inp(tgChatId),marginBottom:14}} onFocus={e=>{e.target.style.borderColor=G;e.target.style.background='rgba(212,175,55,.05)'}} onBlur={e=>{e.target.style.borderColor=tgChatId?'rgba(212,175,55,.2)':'rgba(255,255,255,.07)';e.target.style.background=tgChatId?'rgba(212,175,55,.04)':'rgba(255,255,255,.03)'}}/>
                      <button onClick={connectTg} disabled={tgSaving||!tgChatId.trim()} style={{width:'100%',padding:'12px',background:tgSaving||!tgChatId.trim()?'rgba(212,175,55,.3)':G,border:'none',color:'#0C2540',fontFamily:'Tajawal',fontWeight:900,cursor:tgSaving||!tgChatId.trim()?'not-allowed':'pointer',fontSize:'.85rem'}}>
                        {tgSaving?'⏳ جاري الربط...':'✓ ربط تليجرام'}
                      </button>
                    </div>
                  )}
                </Section>
              )}
            </div>

            {/* SIDEBAR */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Section title="معاينة المتجر" icon="👁">
                <div style={{background:'#0C2540',padding:'12px',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,background:logoPreview?'transparent':`linear-gradient(135deg,${G},#A88C2A)`,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                      {logoPreview?<img src={logoPreview} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:'.75rem',fontWeight:900,color:'#0C2540'}}>{form.name?.charAt(0)||'∞'}</span>}
                    </div>
                    <div style={{fontSize:'.8rem',fontWeight:700,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{form.name||'اسم المتجر'}</div>
                  </div>
                </div>
                <div style={{fontSize:'.58rem',color:'rgba(255,255,255,.2)',marginBottom:6}}>رابط المتجر</div>
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',padding:'8px 10px',fontSize:'.62rem',color:`${G}80`,direction:'ltr',wordBreak:'break-all',marginBottom:10}}>{storeUrl}</div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>window.open(storeUrl,'_blank')} style={{flex:1,padding:'8px',background:'transparent',border:`1px solid ${G}30`,color:`${G}80`,fontFamily:'Tajawal',fontWeight:700,cursor:'pointer',fontSize:'.72rem'}}>فتح ←</button>
                  <button onClick={()=>{navigator.clipboard.writeText(storeUrl);toast$('تم نسخ الرابط')}} style={{padding:'8px 12px',background:'rgba(212,175,55,.08)',border:`1px solid ${G}20`,color:`${G}80`,fontFamily:'Tajawal',fontWeight:700,cursor:'pointer',fontSize:'.72rem'}}>نسخ</button>
                </div>
              </Section>

              <Section title="بيانات الحساب" icon="👤">
                {[['الاسم',merchant?.name],['البريد',merchant?.email],['الخطة',PLAN_L[merchant?.store?.plan]||'ستارتر']].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,fontSize:'.76rem'}}>
                    <span style={{color:'rgba(255,255,255,.28)'}}>{l}</span>
                    <span style={{color:'#fff',fontWeight:600,maxWidth:'60%',textAlign:'left',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</span>
                  </div>
                ))}
              </Section>

              <Section title="ترقية الخطة" icon="⭐" gold>
                <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.38)',marginBottom:14,lineHeight:1.7}}>منتجات غير محدودة، تقارير متقدمة، وأدوات AI إضافية</div>
                <button onClick={()=>window.location.href='/register?plan=pro'} style={{width:'100%',padding:'10px',background:G,border:'none',color:'#0C2540',fontFamily:'Tajawal',fontWeight:800,cursor:'pointer',fontSize:'.76rem'}}>ترقي للبرو ←</button>
              </Section>
            </div>
          </div>

          <div style={{marginTop:32,textAlign:'center'}}>
            <span style={{fontSize:'.48rem',letterSpacing:4,color:'rgba(255,255,255,.08)',textTransform:'uppercase'}}>DAYEM ∞ — Trade Without Restrictions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
