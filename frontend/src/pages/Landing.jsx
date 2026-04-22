import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Landing() {
  const nav = useNavigate()
  useEffect(() => {
    if (localStorage.getItem('dayem_token')) nav('/dashboard')
  }, [])

  const N = '#113459', G = '#D4AF37', B = '#FAF7F2', W = '#fff', N2 = '#0C2540'

  return (
    <div style={{ fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800, background: 'rgba(12,37,64,.97)', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: `1.5px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, fontSize: '1.2rem' }}>∞</div>
          <div>
            <div style={{ color: W, fontWeight: 900, fontSize: '1.1rem', letterSpacing: 2 }}>دايم</div>
            <div style={{ color: G, fontSize: '.48rem', letterSpacing: 4, textTransform: 'uppercase' }}>DAYEM · Trade Without Restrictions</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => nav('/login')} style={{ background: 'transparent', color: 'rgba(255,255,255,.7)', border: `1.5px solid rgba(212,175,55,.3)`, padding: '9px 20px', fontFamily: 'Tajawal', fontWeight: 600, cursor: 'pointer', fontSize: '.8rem' }}>دخول</button>
          <button onClick={() => nav('/register')} style={{ background: G, color: N2, border: 'none', padding: '9px 20px', fontFamily: 'Tajawal', fontWeight: 800, cursor: 'pointer', fontSize: '.8rem' }}>ابدأ متجرك</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: B, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: N, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1px)', width: 2, background: `linear-gradient(180deg,transparent,${G} 20%,${G} 80%,transparent)`, zIndex: 4 }} />

        {/* Merchant side */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '140px 7% 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 24 }}>
            <div style={{ width: 28, height: 2, background: N }} />
            <span style={{ fontSize: '.55rem', letterSpacing: 4, color: N, textTransform: 'uppercase', fontWeight: 800 }}>منصة التجارة الإلكترونية المصرية</span>
          </div>
          <h1 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(2.4rem,3.8vw,3.8rem)', fontWeight: 900, color: N2, lineHeight: 1.1, marginBottom: 8 }}>التاجر المصري<br />يستحق</h1>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 700, fontStyle: 'italic', color: '#A88C2A', lineHeight: 1.05, marginBottom: 20 }}>منصة تليق به ∞</div>
          <div style={{ width: 52, height: 2, background: `linear-gradient(90deg,${N},${G})`, marginBottom: 18 }} />
          <p style={{ fontSize: '.9rem', fontWeight: 300, color: 'rgba(12,37,64,.56)', lineHeight: 1.9, maxWidth: 380, marginBottom: 36 }}>
            متجرك أونلاين كامل في <b style={{ color: N, fontWeight: 700 }}>٥ دقايق</b> — من واتساب فقط.<br />
            بدون خبرة تقنية. توصيل لكل <b style={{ color: N, fontWeight: 700 }}>٢٧ محافظة</b>.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => nav('/register')} style={{ background: N2, color: W, border: 'none', padding: '14px 28px', fontFamily: 'Tajawal', fontSize: '.8rem', fontWeight: 800, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase' }}>ابدأ متجرك دلوقتي</button>
            <button onClick={() => nav('/login')} style={{ background: 'transparent', color: 'rgba(12,37,64,.5)', border: 'none', padding: '14px 0', fontFamily: 'Tajawal', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4 }}>عندي حساب</button>
          </div>
          <div style={{ display: 'flex', gap: 0, marginTop: 44, paddingTop: 24, borderTop: '1px solid rgba(17,52,89,.1)' }}>
            {[{ n: '500+', l: 'تاجر نشط' }, { n: '27', l: 'محافظة' }, { n: '٥ د', l: 'للإنشاء' }, { n: '4891', l: 'طلب/شهر' }].map((s, i) => (
              <div key={i} style={{ flex: 1, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? '1px solid rgba(17,52,89,.08)' : 'none' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: N, display: 'block', lineHeight: 1, marginBottom: 4 }}>{s.n}</span>
                <span style={{ fontSize: '.54rem', letterSpacing: 2, color: 'rgba(12,37,64,.36)', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand side */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 7% 80px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ border: '1px solid rgba(212,175,55,.18)', padding: '44px 48px', background: 'rgba(255,255,255,.02)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 32, height: 32, borderTop: `2px solid ${G}`, borderRight: `2px solid ${G}` }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: 32, height: 32, borderBottom: `2px solid ${G}`, borderLeft: `2px solid ${G}` }} />
              <span style={{ fontFamily: 'Tajawal', fontSize: 'clamp(3.2rem,5.5vw,5.2rem)', fontWeight: 900, color: W, letterSpacing: 4, display: 'block', lineHeight: 1, marginBottom: 6 }}>دايم</span>
              <span style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(255,255,255,.26)', letterSpacing: 5, display: 'block', marginBottom: 24 }}>تجارتك بدون قيود</span>
              <span style={{ display: 'block', fontSize: 'clamp(3.5rem,6.5vw,6.5rem)', color: G, lineHeight: .85, marginBottom: 24, textShadow: '0 0 28px rgba(212,175,55,.32)' }}>∞</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', fontWeight: 700, color: W, letterSpacing: 8, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>DAYEM</span>
              <span style={{ fontSize: '.5rem', letterSpacing: 6, color: G, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Trade Without Restrictions</span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              {['$2.4B سوق', '38% نمو', '3M+ تاجر'].map((p, i) => (
                <span key={i} style={{ background: 'rgba(212,175,55,.09)', border: '1px solid rgba(212,175,55,.2)', padding: '4px 11px', fontSize: '.52rem', letterSpacing: 2, color: G, textTransform: 'uppercase', fontWeight: 700 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ background: N2, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 900, color: W }}>
              ابدأ بـ <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: G }}>100 جنيه</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,.4)', marginTop: 10, fontSize: '.88rem' }}>مفيش رسوم خفية. مفيش عقود.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(212,175,55,.09)' }}>
            {[
              { name: 'ستارتر', price: 100, features: ['متجر كامل', 'حتى ٥٠ منتج', 'رابط مخصص', 'كل طرق الدفع'], hot: false },
              { name: 'تاجر', price: 199, features: ['منتجات غير محدودة', 'تقارير كاملة', 'شحن مخفض ٣٠٪', 'دعم أولوية ٢٤/٧', 'كوبونات وخصومات'], hot: true },
              { name: 'برو', price: 349, features: ['كل مميزات تاجر', 'متاجر متعددة', 'API Integration', 'مدير حساب مخصص'], hot: false },
            ].map((p, i) => (
              <div key={i} style={{ background: p.hot ? 'rgba(212,175,55,.07)' : 'rgba(255,255,255,.02)', padding: '44px 32px', position: 'relative' }}>
                {p.hot && <div style={{ position: 'absolute', top: 0, right: '50%', transform: 'translateX(50%)', background: G, color: N2, fontSize: '.52rem', fontWeight: 800, padding: '4px 16px', letterSpacing: 2 }}>الأشهر ✦</div>}
                <div style={{ fontSize: '.54rem', letterSpacing: 4, color: 'rgba(255,255,255,.26)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12, marginTop: p.hot ? 14 : 0 }}>{p.name}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', fontWeight: 700, color: W, lineHeight: 1 }}>{p.price}<sub style={{ fontFamily: 'Tajawal', fontSize: '.75rem', fontWeight: 300, color: 'rgba(255,255,255,.26)' }}> ج/شهر</sub></div>
                <div style={{ height: 1, background: 'rgba(255,255,255,.055)', margin: '20px 0' }} />
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '.77rem', color: 'rgba(255,255,255,.46)', marginBottom: 9, fontWeight: 300 }}>
                    <div style={{ width: 12, height: 1, background: G, flexShrink: 0 }} />{f}
                  </div>
                ))}
                <button onClick={() => nav('/register')} style={{ width: '100%', padding: 12, fontFamily: 'Tajawal', fontSize: '.72rem', fontWeight: 800, letterSpacing: 2, cursor: 'pointer', marginTop: 20, border: 'none', background: p.hot ? G : 'transparent', color: p.hot ? N2 : 'rgba(255,255,255,.36)', ...(p.hot ? {} : { border: '1.5px solid rgba(212,175,55,.2)' }) }}>ابدأ دلوقتي</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(145deg,${N2},${N})`, padding: '120px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', fontSize: '46vw', color: 'rgba(212,175,55,.028)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', lineHeight: .8, fontFamily: 'serif' }}>∞</div>
        <span style={{ fontSize: '.52rem', letterSpacing: 5, color: G, textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 18, position: 'relative' }}>الخطوة التالية</span>
        <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(2.6rem,5.2vw,4.5rem)', fontWeight: 900, color: W, lineHeight: 1.1, marginBottom: 12, position: 'relative' }}>
          جاهز تبدأ<br /><span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: G }}>متجرك دلوقتي؟</span>
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative', marginTop: 32 }}>
          <button onClick={() => nav('/register')} style={{ background: G, color: N2, border: 'none', padding: '14px 36px', fontFamily: 'Tajawal', fontSize: '.78rem', fontWeight: 800, letterSpacing: 2, cursor: 'pointer' }}>ابدأ متجرك مجاناً</button>
          <a href="https://wa.me/201027360268" target="_blank" style={{ background: '#25D366', color: W, padding: '14px 36px', fontFamily: 'Tajawal', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>💬 تواصل معنا</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: N2, padding: '18px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTop: '1px solid rgba(212,175,55,.09)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem', color: G }}>∞</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '.9rem', color: W, letterSpacing: 3 }}>DAYEM</span>
        </div>
        <p style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.16)', letterSpacing: 1 }}>© 2025 دايم — كل الحقوق محفوظة</p>
        <span style={{ fontSize: '.47rem', letterSpacing: 4, color: G, textTransform: 'uppercase', fontWeight: 700 }}>Trade Without Restrictions</span>
      </footer>
    </div>
  )
}