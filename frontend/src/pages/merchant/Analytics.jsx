import React, { useState, useEffect, useMemo } from 'react'
import { analyticsAPI } from '../../services/api'
import Sidebar from '../../components/Sidebar'

const useW = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

const P = [
  { v: '7d', l: '٧ أيام', s: '7D' },
  { v: '30d', l: '٣٠ يوم', s: '30D' },
  { v: '90d', l: '٣ شهور', s: '90D' },
  { v: '1y', l: 'سنة', s: '1Y' },
]

const SC = {
  new:        { c: '#3B82F6', bg: 'rgba(59,130,246,.12)', l: 'جديد' },
  confirmed:  { c: '#10B981', bg: 'rgba(16,185,129,.12)', l: 'مؤكد' },
  processing: { c: '#8B5CF6', bg: 'rgba(139,92,246,.12)', l: 'جاري' },
  shipped:    { c: '#F59E0B', bg: 'rgba(245,158,11,.12)', l: 'شحن' },
  delivered:  { c: '#22C55E', bg: 'rgba(34,197,94,.12)', l: 'تم التوصيل' },
  cancelled:  { c: '#EF4444', bg: 'rgba(239,68,68,.12)', l: 'ملغي' },
}

const DAYS = ['أحد', 'إثنين', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
const fmt = n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n)
const ago = d => { if(!d)return''; const m=Math.floor((Date.now()-new Date(d))/6e4); if(m<1)return'الآن'; if(m<60)return m+' د'; const h=Math.floor(m/60); if(h<24)return h+' س'; return Math.floor(h/24)+' يوم' }

export default function Analytics() {
  const w = useW()
  const M = w < 768, T = w < 1024
  const [per, setPer] = useState('30d')
  const [ov, setOv] = useState(null)
  const [ch, setCh] = useState([])
  const [tp, setTp] = useState([])
  const [sd, setSd] = useState([])
  const [hm, setHm] = useState([])
  const [ro, setRo] = useState([])
  const [ld, setLd] = useState(true)

  useEffect(() => {
    setLd(true)
    Promise.all([
      analyticsAPI.overview(per),
      analyticsAPI.revenueChart(per),
      analyticsAPI.topProducts(per),
      analyticsAPI.ordersByStatus(per),
      analyticsAPI.hourlyHeatmap(per),
      analyticsAPI.recentOrders(),
    ]).then(([a,b,c,d,e,f]) => {
      if(a?.revenue) setOv(a)
      if(Array.isArray(b)) setCh(b)
      if(Array.isArray(c)) setTp(c)
      if(Array.isArray(d)) setSd(d)
      if(Array.isArray(e)) setHm(e)
      if(Array.isArray(f)) setRo(f)
      setLd(false)
    })
  }, [per])

  const maxR = useMemo(() => Math.max(...ch.map(c=>c.revenue),1), [ch])
  const maxH = useMemo(() => Math.max(...hm.map(c=>c.count),1), [hm])

  if(ld && !ov) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0A0E1A'}}>
      <Sidebar active="analytics"/>
      <div style={{flex:1,marginLeft:T?0:260,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:48,height:48,border:'3px solid rgba(212,175,55,.15)',borderTopColor:'#D4AF37',borderRadius:'50%',animation:'sp .7s linear infinite'}}/>
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const kpis = [
    { l:'الإيرادات', v:fmt(ov?.revenue?.value||0)+' ج', g:ov?.revenue?.growth, i:'💰', gc:'#D4AF37', gb:'rgba(212,175,55,.08)' },
    { l:'الطلبات', v:fmt(ov?.orders?.value||0), g:ov?.orders?.growth, i:'📦', gc:'#3B82F6', gb:'rgba(59,130,246,.08)' },
    { l:'جديدة', v:fmt(ov?.orders?.pending||0), i:'🔔', gc:'#F59E0B', gb:'rgba(245,158,11,.08)' },
    { l:'متوسط الطلب', v:fmt(ov?.avgOrderValue?.value||0)+' ج', i:'📊', gc:'#8B5CF6', gb:'rgba(139,92,246,.08)' },
    { l:'المنتجات', v:fmt(ov?.products?.value||0), i:'🏷️', gc:'#10B981', gb:'rgba(16,185,129,.08)' },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0A0E1A',fontFamily:'Tajawal',direction:'rtl'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .ac{background:linear-gradient(135deg,rgba(212,175,55,.06),rgba(212,175,55,.02));border:1px solid rgba(212,175,55,.1);backdrop-filter:blur(20px)}
        .ac:hover{border-color:rgba(212,175,55,.2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(212,175,55,.08)}
        .bar{transition:height .6s cubic-bezier(.4,0,.2,1)}
        .bar:hover{filter:brightness(1.2)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fu{animation:fadeUp .4s ease both}
        .fu:nth-child(1){animation-delay:.05s}.fu:nth-child(2){animation-delay:.1s}.fu:nth-child(3){animation-delay:.15s}.fu:nth-child(4){animation-delay:.2s}.fu:nth-child(5){animation-delay:.25s}
        .hcell{transition:all .15s}
        .hcell:hover{transform:scale(1.3);z-index:2;position:relative}
      `}</style>

      <Sidebar active="analytics"/>
      <div style={{flex:1,marginLeft:T?0:260,padding:M?'56px 12px 24px':T?'24px 20px':'28px 36px',overflowY:'auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:M?'flex-start':'center',flexDirection:M?'column':'row',gap:12,marginBottom:M?20:28}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#D4AF37,#A88C2A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.8rem'}}>📊</div>
              <h1 style={{color:'#fff',fontSize:M?'1.2rem':'1.6rem',fontWeight:900}}>التحليلات</h1>
            </div>
            <p style={{color:'rgba(255,255,255,.3)',fontSize:'.78rem',paddingRight:40}}>تتبع أداء متجرك في الوقت الحقيقي</p>
          </div>
          <div style={{display:'flex',gap:3,background:'rgba(255,255,255,.04)',borderRadius:10,padding:3,border:'1px solid rgba(255,255,255,.06)'}}>
            {P.map(p=>(
              <button key={p.v} onClick={()=>setPer(p.v)} style={{
                padding:M?'5px 10px':'7px 14px',borderRadius:8,border:'none',cursor:'pointer',
                background:per===p.v?'linear-gradient(135deg,#D4AF37,#B8962E)':'transparent',
                color:per===p.v?'#0A0E1A':'rgba(255,255,255,.35)',
                fontWeight:per===p.v?800:500,fontSize:M?'.7rem':'.78rem',fontFamily:'Tajawal',
                transition:'all .2s',letterSpacing:.5
              }}>{M?p.s:p.l}</button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{display:'grid',gridTemplateColumns:M?'repeat(2,1fr)':T?'repeat(3,1fr)':'repeat(5,1fr)',gap:M?8:12,marginBottom:M?16:24}}>
          {kpis.map((k,i)=>(
            <div key={i} className="ac fu" style={{
              borderRadius:14,padding:M?'14px 12px':'18px 16px',position:'relative',overflow:'hidden',
              transition:'all .3s',...(i===4&&M?{gridColumn:'span 2'}:{})
            }}>
              <div style={{position:'absolute',top:-20,left:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${k.gb},transparent)`}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <span style={{fontSize:'1.4rem',opacity:.8}}>{k.i}</span>
                {k.g!==undefined&&(
                  <span style={{fontSize:'.6rem',fontWeight:700,padding:'2px 6px',borderRadius:4,
                    color:Number(k.g)>=0?'#10B981':'#EF4444',
                    background:Number(k.g)>=0?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'
                  }}>{Number(k.g)>=0?'↑':'↓'} {Math.abs(Number(k.g))}%</span>
                )}
              </div>
              <div style={{color:'rgba(255,255,255,.4)',fontSize:M?'.6rem':'.68rem',fontWeight:500,marginBottom:2}}>{k.l}</div>
              <div style={{color:'#fff',fontSize:M?'1.1rem':'1.35rem',fontWeight:900,fontFamily:'Playfair Display,serif'}}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart - Premium */}
        <div className="ac fu" style={{borderRadius:16,padding:M?'16px 14px':'24px',marginBottom:M?16:24,animationDelay:'.3s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div>
              <h3 style={{color:'#fff',fontSize:M?'.88rem':'1rem',fontWeight:800}}>📈 نظرة عامة على الإيرادات</h3>
              <p style={{color:'rgba(255,255,255,.25)',fontSize:'.68rem',marginTop:3}}>الإيرادات خلال الفترة المحددة</p>
            </div>
            <div style={{background:'rgba(212,175,55,.1)',padding:'4px 10px',borderRadius:6}}>
              <span style={{color:'#D4AF37',fontSize:'.7rem',fontWeight:700}}>إجمالي: {fmt(ch.reduce((a,c)=>a+c.revenue,0))} ج</span>
            </div>
          </div>
          {ch.length>0?(
            <div style={{display:'flex',alignItems:'flex-end',gap:M?2:4,height:M?120:180,paddingBottom:20,position:'relative'}}>
              <div style={{position:'absolute',bottom:20,left:0,right:0,height:1,background:'rgba(255,255,255,.04)'}}/>
              {ch.map((c,i)=>{
                const pct=maxR>0?(c.revenue/maxR)*100:0
                return(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',height:'100%',justifyContent:'flex-end'}}>
                    <div className="bar" style={{
                      width:'100%',maxWidth:M?20:32,height:`${Math.max(pct,2)}%`,
                      background:pct>70?'linear-gradient(180deg,#D4AF37,#B8962E)':pct>30?'linear-gradient(180deg,#D4AF37,rgba(212,175,55,.5))':'linear-gradient(180deg,rgba(212,175,55,.6),rgba(212,175,55,.2))',
                      borderRadius:'4px 4px 0 0',cursor:'pointer',minHeight:2,position:'relative'
                    }} title={`${c.label}: ${c.revenue} ج`}>
                      {!M&&pct>15&&<div style={{position:'absolute',top:-18,left:'50%',transform:'translateX(-50%)',fontSize:'.5rem',color:'rgba(255,255,255,.4)',whiteSpace:'nowrap',fontWeight:600}}>{fmt(c.revenue)}</div>}
                    </div>
                    {(M?ch.length<=7:true)&&<span style={{fontSize:'.45rem',color:'rgba(255,255,255,.18)',marginTop:6,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'}}>{c.label?.slice(5)||c.label}</span>}
                  </div>
                )
              })}
            </div>
          ):<div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.12)',fontSize:'.85rem'}}>لا توجد بيانات</div>}
        </div>

        {/* Status + Top Products - Side by Side */}
        <div style={{display:'grid',gridTemplateColumns:M?'1fr':'1fr 1fr',gap:M?12:16,marginBottom:M?16:24}}>

          {/* Status Breakdown - Donut style */}
          <div className="ac fu" style={{borderRadius:16,padding:M?'16px 14px':'22px',animationDelay:'.35s'}}>
            <h3 style={{color:'#fff',fontSize:M?'.85rem':'.95rem',fontWeight:800,marginBottom:16}}>🎯 توزيع الطلبات</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {sd.length>0?sd.map((s,i)=>{
                const sc=SC[s.status]||{c:'#666',bg:'rgba(102,102,102,.12)',l:s.status}
                const total=sd.reduce((a,b)=>a+b.count,0)
                const pct=total>0?(s.count/total)*100:0
                return(
                  <div key={i}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:3,background:sc.c}}/>
                        <span style={{color:'rgba(255,255,255,.55)',fontSize:M?'.7rem':'.78rem'}}>{sc.l}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{color:'#fff',fontSize:M?'.8rem':'.85rem',fontWeight:800}}>{s.count}</span>
                        <span style={{color:'rgba(255,255,255,.2)',fontSize:'.6rem',background:'rgba(255,255,255,.04)',padding:'2px 6px',borderRadius:4}}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,.04)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${sc.c},${sc.c}88)`,borderRadius:3,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/>
                    </div>
                  </div>
                )
              }):<p style={{color:'rgba(255,255,255,.12)',textAlign:'center',padding:30}}>لا توجد بيانات</p>}
            </div>
          </div>

          {/* Top Products - Card style */}
          <div className="ac fu" style={{borderRadius:16,padding:M?'16px 14px':'22px',animationDelay:'.4s'}}>
            <h3 style={{color:'#fff',fontSize:M?'.85rem':'.95rem',fontWeight:800,marginBottom:16}}>🏆 أفضل المنتجات</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {tp.length>0?tp.map((p,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'rgba(255,255,255,.02)',borderRadius:10,border:'1px solid rgba(255,255,255,.04)',transition:'all .2s',cursor:'default'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(212,175,55,.04)';e.currentTarget.style.borderColor='rgba(212,175,55,.12)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.02)';e.currentTarget.style.borderColor='rgba(255,255,255,.04)'}}
                >
                  <div style={{width:42,height:42,borderRadius:10,overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,.04)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {p.image?<img src={p.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span>📦</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:'#fff',fontSize:M?'.76rem':'.82rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                    <p style={{color:'rgba(255,255,255,.25)',fontSize:'.6rem',marginTop:2}}>{p.totalSold} مبيعة</p>
                  </div>
                  <div style={{textAlign:'left'}}>
                    <div style={{color:'#D4AF37',fontSize:M?'.8rem':'.88rem',fontWeight:800,fontFamily:'Playfair Display,serif'}}>{fmt(p.totalRevenue)}</div>
                    <div style={{color:'rgba(255,255,255,.2)',fontSize:'.5rem'}}>جنيه</div>
                  </div>
                </div>
              )):<p style={{color:'rgba(255,255,255,.12)',textAlign:'center',padding:30}}>لا توجد بيانات</p>}
            </div>
          </div>
        </div>

        {/* Heatmap - Premium */}
        <div className="ac fu" style={{borderRadius:16,padding:M?'16px 14px':'22px',marginBottom:M?16:24,animationDelay:'.45s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <h3 style={{color:'#fff',fontSize:M?'.85rem':'.95rem',fontWeight:800}}>🔥 أنماط الطلبات</h3>
              <p style={{color:'rgba(255,255,255,.2)',fontSize:'.6rem',marginTop:2}}>أفضل أوقات المبيعات</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:'rgba(212,175,55,.15)'}}/>
              <span style={{fontSize:'.5rem',color:'rgba(255,255,255,.2)'}}>قليل</span>
              <div style={{width:10,height:10,borderRadius:2,background:'rgba(212,175,55,.5)'}}/>
              <div style={{width:10,height:10,borderRadius:2,background:'rgba(212,175,55,.8)'}}/>
              <span style={{fontSize:'.5rem',color:'rgba(255,255,255,.2)'}}>كثير</span>
            </div>
          </div>
          <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
            <div style={{display:'grid',gridTemplateColumns:'28px repeat(24,1fr)',gap:M?2:3,minWidth:460}}>
              <div/>
              {Array.from({length:24},(_,h)=>(
                <div key={h} style={{fontSize:'.45rem',color:'rgba(255,255,255,.18)',textAlign:'center',padding:'2px 0'}}>{h}</div>
              ))}
              {DAYS.map((day,d)=>(
                <React.Fragment key={d}>
                  <div style={{fontSize:'.52rem',color:'rgba(255,255,255,.2)',display:'flex',alignItems:'center'}}>{day.slice(0,3)}</div>
                  {Array.from({length:24},(_,h)=>{
                    const cell=hm.find(c=>c.day===d&&c.hour===h)
                    const count=cell?.count||0
                    const intensity=count/maxH
                    return(
                      <div key={h} className="hcell" style={{
                        aspectRatio:'1',borderRadius:2,minHeight:8,
                        background:count===0?'rgba(255,255,255,.02)':`rgba(212,175,55,${(.08+intensity*.82).toFixed(2)})`,
                        cursor:'pointer'
                      }} title={`${day} ${h}:00 — ${count} طلب`}/>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders - Premium Table/Cards */}
        <div className="ac fu" style={{borderRadius:16,padding:M?'16px 14px':'22px',animationDelay:'.5s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{color:'#fff',fontSize:M?'.85rem':'.95rem',fontWeight:800}}>🕐 آخر الطلبات</h3>
            <span style={{color:'rgba(255,255,255,.2)',fontSize:'.6rem'}}>{ro.length} طلب</span>
          </div>
          {ro.length>0?(
            M?(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {ro.map((o,i)=>{
                  const sc=SC[o.status]||{c:'#666',bg:'rgba(102,102,102,.12)',l:o.status}
                  return(
                    <div key={i} style={{padding:'12px',background:'rgba(255,255,255,.02)',borderRadius:10,border:'1px solid rgba(255,255,255,.04)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{color:'#D4AF37',fontSize:'.7rem',fontWeight:700,letterSpacing:.5}}>{o.orderNumber}</div>
                          <div style={{color:'#fff',fontSize:'.82rem',fontWeight:600,marginTop:2}}>{o.customerName}</div>
                        </div>
                        <div style={{textAlign:'left'}}>
                          <div style={{color:'#fff',fontSize:'.9rem',fontWeight:900,fontFamily:'Playfair Display,serif'}}>{fmt(o.total)} <span style={{fontSize:'.6rem',color:'rgba(255,255,255,.3)'}}>ج</span></div>
                          <span style={{display:'inline-block',padding:'2px 8px',borderRadius:6,background:sc.bg,color:sc.c,fontSize:'.58rem',fontWeight:700,marginTop:3}}>{sc.l}</span>
                        </div>
                      </div>
                      <div style={{color:'rgba(255,255,255,.2)',fontSize:'.55rem'}}>{ago(o.createdAt)}</div>
                    </div>
                  )
                })}
              </div>
            ):(
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
                  <thead>
                    <tr>
                      {['رقم الطلب','العميل','المبلغ','الحالة','التاريخ'].map(h=>(
                        <th key={h} style={{textAlign:'right',padding:'10px 14px',color:'rgba(255,255,255,.2)',fontSize:'.65rem',fontWeight:700,letterSpacing:1,textTransform:'uppercase',borderBottom:'1px solid rgba(255,255,255,.05)'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ro.map((o,i)=>{
                      const sc=SC[o.status]||{c:'#666',bg:'rgba(102,102,102,.12)',l:o.status}
                      return(
                        <tr key={i} style={{transition:'background .2s',cursor:'default'}}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,.03)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{padding:'12px 14px',color:'#D4AF37',fontWeight:700,fontSize:'.82rem',letterSpacing:.5}}>{o.orderNumber}</td>
                          <td style={{padding:'12px 14px',color:'rgba(255,255,255,.6)',fontSize:'.82rem'}}>{o.customerName}</td>
                          <td style={{padding:'12px 14px',color:'#fff',fontWeight:800,fontSize:'.85rem',fontFamily:'Playfair Display,serif'}}>{fmt(o.total)} <span style={{fontSize:'.6rem',color:'rgba(255,255,255,.25)'}}>ج</span></td>
                          <td style={{padding:'12px 14px'}}>
                            <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:8,background:sc.bg,color:sc.c,fontSize:'.7rem',fontWeight:700}}>
                              <span style={{width:5,height:5,borderRadius:'50%',background:sc.c}}/>
                              {sc.l}
                            </span>
                          </td>
                          <td style={{padding:'12px 14px',color:'rgba(255,255,255,.25)',fontSize:'.75rem'}}>{ago(o.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ):<p style={{color:'rgba(255,255,255,.12)',textAlign:'center',padding:40}}>لا توجد طلبات</p>}
        </div>

      </div>
    </div>
  )
}
