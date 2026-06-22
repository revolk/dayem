// frontend/src/pages/store/Checkout.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { BASE } from '../../services/api'

/* ─── Constants ───────────────────────────────────────── */
const GOVS = ['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج','البحر الأحمر','الشرقية']

const METHODS = [
  { v:'vodafone_cash', l:'فودافون كاش', icon:'📱', color:'#E8092A', desc:'تحويل فوري على الرقم' },
  { v:'instapay',      l:'انستاباي',    icon:'⚡', color:'#6C47FF', desc:'تحويل بنكي فوري'     },
  { v:'fawry',         l:'فوري',        icon:'🏪', color:'#F7931E', desc:'من أي فرع أو My Fawry'},
  { v:'cash',          l:'كاش عند الاستلام', icon:'💵', color:'#2DD4AA', desc:'ادفع لما يوصلك' },
]

/* ─── CSS ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.co{
  min-height:100vh;
  background:#060F1E !important;
  font-family:'Tajawal',sans-serif;
  direction:rtl;color:#EDE8DD !important;
  position:relative;overflow-x:hidden;
  isolation:isolate;
}
.co::before{
  content:'';position:fixed;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(212,175,55,.02) 1px,transparent 1px),
    linear-gradient(90deg,rgba(212,175,55,.02) 1px,transparent 1px);
  background-size:60px 60px;
}

/* Header */
.co-header{
  background:rgba(6,15,30,.97);
  border-bottom:1px solid rgba(212,175,55,.1);
  position:sticky;top:0;z-index:100;
}
.co-header-line{
  height:2px;
  background:linear-gradient(90deg,transparent,#D4AF37,transparent);
}
.co-header-inner{
  padding:0 5%;height:60px;
  display:flex;align-items:center;justify-content:space-between;
  max-width:1200px;margin:0 auto;
}
@media(max-width:768px){.co-header-inner{padding:0 14px;height:52px}}

/* Steps */
.co-steps{display:flex;align-items:center;gap:6px}
.co-step-dot{height:6px;border-radius:3px;transition:all .3s}

/* Main layout */
.co-main{
  max-width:1100px;margin:0 auto;
  padding:32px 5% 80px;
  display:grid;grid-template-columns:1fr 340px;gap:24px;
  align-items:start;
}
@media(max-width:900px){.co-main{grid-template-columns:1fr;padding:20px 14px 60px}}

/* Card */
.co-card{
  background:rgba(255,255,255,.028);
  border:1px solid rgba(255,255,255,.07);
  padding:24px;position:relative;overflow:hidden;
  margin-bottom:14px;
}
.co-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent);
}
.co-card-title{
  font-size:.55rem;letter-spacing:4px;color:#D4AF37;
  text-transform:uppercase;font-weight:800;margin-bottom:18px;
  font-family:'Space Mono',monospace;
}

/* Input */
.co-input{
  width:100%;padding:12px 14px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  font-family:'Tajawal',sans-serif;font-size:16px;
  color:#fff;outline:none;transition:all .2s;
  appearance:none;-webkit-appearance:none;
}
.co-input:focus{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.05);box-shadow:0 0 0 3px rgba(212,175,55,.05)}
.co-input::placeholder{color:rgba(255,255,255,.2)}
.co-input.filled{border-color:rgba(212,175,55,.25);background:rgba(212,175,55,.04)}
.co-input.error{border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.04)}
select.co-input{cursor:pointer;color:#fff;font-size:16px !important;}
select.co-input option{background:#0C1525;color:#fff}

/* iOS keyboard & touch fixes */
.co input, .co textarea, .co select {
  font-size: 16px !important;
  -webkit-appearance: none;
  border-radius: 0;
  transform: translateZ(0);
}
.co input:focus, .co textarea:focus, .co select:focus {
  outline: none;
  -webkit-tap-highlight-color: transparent;
}


.co-label{
  display:block;font-size:.58rem;font-weight:700;
  color:rgba(255,255,255,.3);margin-bottom:6px;
  letter-spacing:2px;text-transform:uppercase;font-family:'Tajawal',sans-serif;
  transition:color .2s;
}
.co-label.active{color:rgba(212,175,55,.8)}

.co-field-err{font-size:.68rem;color:#F87171;margin-top:5px}

/* Payment method cards */
.co-method{
  padding:14px 16px;
  border:1px solid rgba(255,255,255,.07);
  cursor:pointer;transition:all .2s;
  background:rgba(255,255,255,.02);
  position:relative;overflow:hidden;
}
.co-method:hover{border-color:rgba(212,175,55,.25);background:rgba(212,175,55,.04)}
.co-method.selected{border-color:rgba(212,175,55,.45);background:rgba(212,175,55,.07)}
.co-method.selected::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--mc,#D4AF37);
}
.co-method-check{
  width:18px;height:18px;border-radius:50%;
  border:2px solid rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .2s;
  font-size:9px;
}
.co-method.selected .co-method-check{
  background:#D4AF37;border-color:#D4AF37;color:#0C2540;font-weight:900;
}

/* Payment detail box */
.co-pay-box{
  background:rgba(212,175,55,.05);
  border:1px solid rgba(212,175,55,.18);
  padding:18px;margin-bottom:16px;
  position:relative;
}
.co-pay-box::before{
  content:'';position:absolute;top:-1px;right:-1px;width:12px;height:12px;
  border-top:1.5px solid #D4AF37;border-right:1.5px solid #D4AF37;
}
.co-pay-box::after{
  content:'';position:absolute;bottom:-1px;left:-1px;width:12px;height:12px;
  border-bottom:1.5px solid #D4AF37;border-left:1.5px solid #D4AF37;
}

/* Copy button */
.co-copy{
  background:rgba(212,175,55,.1);
  border:1px solid rgba(212,175,55,.3);
  color:#D4AF37;font-family:'Tajawal',sans-serif;
  font-size:.7rem;font-weight:700;padding:6px 14px;
  cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;
}
.co-copy.copied{background:#D4AF37;color:#0C2540}
.co-copy:hover:not(.copied){background:rgba(212,175,55,.2)}

/* Step list */
.co-step-list{display:flex;flex-direction:column;gap:0}
.co-step-item{
  display:flex;align-items:flex-start;gap:12px;
  padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);
}
.co-step-item:last-child{border-bottom:none}
.co-step-num{
  width:22px;height:22px;flex-shrink:0;
  background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);
  display:flex;align-items:center;justify-content:center;
  font-size:.6rem;font-weight:900;color:#D4AF37;
  font-family:'Space Mono',monospace;margin-top:1px;
}

/* Submit button */
.co-submit{
  width:100%;padding:15px;background:#D4AF37;border:none;
  color:#0C2540;font-family:'Tajawal',sans-serif;
  font-size:.95rem;font-weight:900;cursor:pointer;
  transition:all .25s;display:flex;align-items:center;justify-content:center;gap:10px;
  letter-spacing:.5px;
}
.co-submit:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,175,55,.3)}
.co-submit:active:not(:disabled){transform:translateY(0)}
.co-submit:disabled{background:rgba(212,175,55,.25);color:rgba(12,37,64,.5);cursor:not-allowed;transform:none}

/* Error */
.co-error{
  background:rgba(248,113,113,.07);
  border:1px solid rgba(248,113,113,.2);
  border-right:3px solid #F87171;
  color:#FCA5A5;padding:10px 14px;
  font-size:.8rem;margin-bottom:16px;
}

/* Summary */
.co-summary{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(212,175,55,.12);
  position:sticky;top:84px;
  overflow:hidden;
}
.co-summary::before{
  content:'';position:absolute;top:-1px;right:-1px;width:18px;height:18px;
  border-top:1.5px solid #D4AF37;border-right:1.5px solid #D4AF37;
}
.co-summary::after{
  content:'';position:absolute;bottom:-1px;left:-1px;width:18px;height:18px;
  border-bottom:1.5px solid #D4AF37;border-left:1.5px solid #D4AF37;
}

/* Timer */
.co-timer{
  display:flex;align-items:center;gap:8px;
  background:rgba(212,175,55,.06);
  border:1px solid rgba(212,175,55,.15);
  padding:10px 14px;margin-bottom:14px;
}
.co-timer-dot{width:6px;height:6px;border-radius:50%;background:#D4AF37;animation:td 1s ease infinite}
@keyframes td{0%,100%{opacity:1}50%{opacity:.3}}

/* Mobile summary toggle */
.co-mob-summary{
  background:rgba(212,175,55,.06);
  border:1px solid rgba(212,175,55,.15);
  padding:12px 16px;margin-bottom:16px;
  display:flex;justify-content:space-between;align-items:center;
  cursor:pointer;
}

/* Spinner */
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:16px;height:16px;border:2px solid rgba(12,37,64,.3);border-top-color:#0C2540;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}

/* Grid */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){.g2{grid-template-columns:1fr}}

/* Fade */
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.fu{animation:fadeUp .35s ease both}

::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2)}
`

function injectCSS() {
  if (document.getElementById('co-styles')) return
  const el = document.createElement('style')
  el.id = 'co-styles'; el.textContent = CSS
  document.head.appendChild(el)
}

/* ─── Hooks ───────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

/* ─── CopyButton ──────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta)
      ta.select(); document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button className={`co-copy${copied ? ' copied' : ''}`} onClick={copy}>
      {copied ? '✓ تم النسخ' : 'نسخ'}
    </button>
  )
}

/* ─── Timer ───────────────────────────────────────────── */
function Timer({ seconds = 900 }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const m = String(Math.floor(left / 60)).padStart(2, '0')
  const s = String(left % 60).padStart(2, '0')
  const urgent = left < 120
  return (
    <div className="co-timer">
      <div className="co-timer-dot" style={{ background: urgent ? '#F87171' : '#D4AF37' }} />
      <span style={{ flex: 1, fontSize: '.75rem', color: 'rgba(255,255,255,.4)', fontFamily: 'Tajawal' }}>
        {left <= 0 ? 'انتهى وقت الحجز' : 'الطلب محجوز لمدة'}
      </span>
      <span style={{
        fontFamily: 'Space Mono, monospace', fontSize: '.9rem', fontWeight: 700,
        color: urgent ? '#F87171' : '#D4AF37',
        direction: 'ltr'
      }}>
        {m}:{s}
      </span>
    </div>
  )
}

/* ─── Payment method detail panels ───────────────────── */
function VodafonePanel({ store, final, onConfirm, loading, error }) {
  const [ref, setRef] = useState('')
  const num = store?.vodafoneCash || store?.phone || ''
  const valid = ref.trim().length >= 6

  return (
    <div className="fu">
      <div className="co-pay-box">
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Space Mono, monospace' }}>رقم فودافون كاش</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '1.3rem', color: '#fff', fontWeight: 700, letterSpacing: 3, direction: 'ltr' }}>
            {num || <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '.85rem' }}>لم يُضف التاجر رقمه بعد</span>}
          </div>
          {num && <CopyBtn text={num} />}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>

      <div className="co-step-list" style={{ marginBottom: 18 }}>
        {[
          'افتح تطبيق فودافون كاش',
          `اختر "تحويل" وحوّل ${final} ج على الرقم أعلاه`,
          'انسخ رقم المرجع (Reference Number) من رسالة التأكيد',
          'الصقه في الخانة أدناه'
        ].map((s, i) => (
          <div key={i} className="co-step-item">
            <div className="co-step-num">{i + 1}</div>
            <span style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="co-label">رقم المرجع — Reference Number <span style={{ color: '#F87171' }}>*</span></label>
        <input
          className={`co-input${ref ? ' filled' : ''}`}
          value={ref} onChange={e => setRef(e.target.value)}
          placeholder="مثال: 1234567890"
          style={{ direction: 'ltr', letterSpacing: 2 }}
        />
        {ref && !valid && <div className="co-field-err">الرقم يجب أن يكون 6 أرقام على الأقل</div>}
      </div>

      {error && <div className="co-error">⚠️ {error}</div>}

      <button className="co-submit" onClick={() => onConfirm({ paymentRef: ref.trim() })} disabled={loading || !valid || !num}>
        {loading ? <><div className="spinner" /> جاري التأكيد...</> : <>تأكيد التحويل ←</>}
      </button>

      {!num && <div style={{ textAlign: 'center', marginTop: 10, fontSize: '.72rem', color: '#F87171' }}>⚠️ هذا المتجر لم يضف رقم فودافون كاش بعد</div>}
    </div>
  )
}

function InstapayPanel({ store, final, onConfirm, loading, error }) {
  const [ref, setRef] = useState('')
  const num = store?.instapay || store?.phone || ''
  const valid = ref.trim().length >= 4

  return (
    <div className="fu">
      <div className="co-pay-box">
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Space Mono, monospace' }}>رقم IPA / انستاباي</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '1.1rem', color: '#fff', fontWeight: 700, direction: 'ltr' }}>
            {num || <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '.85rem' }}>لم يُضف التاجر رقمه بعد</span>}
          </div>
          {num && <CopyBtn text={num} />}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>

      <div className="co-step-list" style={{ marginBottom: 18 }}>
        {[
          'افتح تطبيق البنك الخاص بيك',
          `اختر "انستاباي" أو "تحويل فوري"`,
          `حوّل ${final} ج على الرقم / الـ IPA أعلاه`,
          'انسخ رقم العملية من إشعار التحويل وادخله أدناه'
        ].map((s, i) => (
          <div key={i} className="co-step-item">
            <div className="co-step-num">{i + 1}</div>
            <span style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="co-label">رقم العملية — Transaction ID <span style={{ color: '#F87171' }}>*</span></label>
        <input
          className={`co-input${ref ? ' filled' : ''}`}
          value={ref} onChange={e => setRef(e.target.value)}
          placeholder="Transaction ID"
          style={{ direction: 'ltr', letterSpacing: 1 }}
        />
        {ref && !valid && <div className="co-field-err">الرقم يجب أن يكون 4 أرقام على الأقل</div>}
      </div>

      {error && <div className="co-error">⚠️ {error}</div>}

      <button className="co-submit" onClick={() => onConfirm({ paymentRef: ref.trim() })} disabled={loading || !valid || !num}>
        {loading ? <><div className="spinner" /> جاري التأكيد...</> : <>تأكيد التحويل ←</>}
      </button>

      {!num && <div style={{ textAlign: 'center', marginTop: 10, fontSize: '.72rem', color: '#F87171' }}>⚠️ هذا المتجر لم يضف رقم انستاباي بعد</div>}
    </div>
  )
}

function FawryPanel({ store, final, onConfirm, loading, error }) {
  const code = store?.fawryCode || ''

  return (
    <div className="fu">
      {code && (
        <div className="co-pay-box">
          <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Space Mono, monospace' }}>رقم موبايل فوري</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '1.5rem', color: '#D4AF37', fontWeight: 700, letterSpacing: 4, direction: 'ltr' }}>{code}</div>
            <CopyBtn text={code} />
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem' }}>المبلغ المطلوب</span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</span>
      </div>

      <div className="co-step-list" style={{ marginBottom: 20 }}>
        {[
          'افتح تطبيق My Fawry',
          code ? `اختر "ادفع لشخص" وادخل الرقم: ${code}` : 'اختر "ادفع لشخص"',
          `ادفع مبلغ ${final} ج`,
          'أو روح أي فرع فوري وطلب دفع للرقم أعلاه',
          'احتفظ بصورة الإيصال'
        ].map((s, i) => (
          <div key={i} className="co-step-item">
            <div className="co-step-num">{i + 1}</div>
            <span style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>

      {error && <div className="co-error">⚠️ {error}</div>}

      <button className="co-submit" onClick={() => onConfirm({})} disabled={loading}>
        {loading ? <><div className="spinner" /> جاري التأكيد...</> : <>أكدت الدفع، سجّل طلبي ←</>}
      </button>
    </div>
  )
}

function CashPanel({ final, onConfirm, loading, error }) {
  return (
    <div className="fu" style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>💵</div>
      <h3 style={{ fontWeight: 900, color: '#fff', fontSize: '1.15rem', marginBottom: 8 }}>الدفع عند الاستلام</h3>
      <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.82rem', lineHeight: 1.7, marginBottom: 24 }}>
        هتدفع المبلغ لما يوصلك الطلب<br />
        <span style={{ fontSize: '.72rem' }}>جهّز المبلغ المطلوب عند الاستلام</span>
      </p>

      <div className="co-pay-box" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '.58rem', letterSpacing: 2, color: 'rgba(212,175,55,.5)', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Space Mono, monospace' }}>المبلغ المطلوب</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', fontWeight: 700, color: '#D4AF37' }}>{final} ج</div>
      </div>

      {error && <div className="co-error" style={{ textAlign: 'right' }}>⚠️ {error}</div>}

      <button className="co-submit" onClick={() => onConfirm({})} disabled={loading}>
        {loading ? <><div className="spinner" /> جاري التأكيد...</> : <>تأكيد الطلب ←</>}
      </button>
    </div>
  )
}

/* ─── Order Summary ───────────────────────────────────── */
function Summary({ cart, totalPrice, shippingPrice, discount, finalPrice }) {
  return (
    <div className="co-summary">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontSize: '.55rem', letterSpacing: 3, color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', marginBottom: 2 }}>ملخص الطلب</div>
        <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)' }}>{cart.length} منتج</div>
      </div>

      <div style={{ padding: '8px 16px', maxHeight: 240, overflowY: 'auto' }}>
        {cart.map(i => (
          <div key={i._id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {i.images?.[0]?.url
                ? <img src={i.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ color: 'rgba(212,175,55,.15)', fontSize: '1.1rem' }}>◆</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.76rem', color: '#fff', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.nameAr || i.name}</div>
              <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.25)' }}>× {i.qty}</div>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '.82rem', flexShrink: 0 }}>{i.price * i.qty} ج</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: '.74rem', color: 'rgba(255,255,255,.3)' }}>
          <span>المنتجات</span><span>{totalPrice} ج</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: '.74rem' }}>
          <span style={{ color: 'rgba(255,255,255,.3)' }}>الشحن</span>
          <span style={{ color: shippingPrice === 0 ? '#2DD4AA' : 'rgba(255,255,255,.3)', fontWeight: shippingPrice === 0 ? 700 : 400 }}>
            {shippingPrice === 0 ? '✓ مجاني' : `${shippingPrice} ج`}
          </span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: '.74rem', color: '#2DD4AA' }}>
            <span>خصم الكوبون</span><span>- {discount} ج</span>
          </div>
        )}
        {shippingPrice > 0 && (
          <div style={{ background: 'rgba(212,175,55,.05)', border: '1px solid rgba(212,175,55,.1)', padding: '6px 10px', marginBottom: 10, fontSize: '.63rem', color: '#D4AF37' }}>
            أضف {500 - totalPrice} ج للشحن المجاني
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(212,175,55,.1)', marginTop: 6 }}>
          <span style={{ fontWeight: 900, color: '#fff', fontSize: '.95rem' }}>الإجمالي</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37', fontSize: '1.15rem' }}>{finalPrice} ج</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────── */
export default function Checkout() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const w = useWindowWidth()
  const mob = w < 900

  // cart can arrive as object {id:{id,name,price,qty}} from iframe or array from direct nav
  const rawCart = state?.cart || []
  const cart = Array.isArray(rawCart)
    ? rawCart
    : Object.values(rawCart).map(i => ({
        _id: i.id, name: i.name, nameAr: i.name,
        price: i.price, qty: i.qty,
        images: i.img ? [{ url: i.img }] : []
      }))
  const store = state?.store
  const couponCode = state?.couponCode || null

  const [step, setStep]       = useState(1)
  const [focused, setFocused] = useState('')
  const [form, setForm]       = useState({
    name: '', phone: '', address: '', governorate: '',
    paymentMethod: 'vodafone_cash', notes: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const [couponInput, setCouponInput]   = useState(couponCode || '')
  const [couponData, setCouponData]     = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError]   = useState('')

  useEffect(() => { injectCSS() }, [])

  // Pre-fill from saved customer
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dayem_customer') || '{}')
      if (saved.name || saved.phone) {
        setForm(f => ({
          ...f,
          name:        saved.name        || f.name,
          phone:       saved.phone       || f.phone,
          address:     saved.address     || f.address,
          governorate: saved.governorate || f.governorate,
        }))
      }
    } catch {}
  }, [])

  // Redirect if no cart
  useEffect(() => {
    if (!cart.length) nav(`/store/${slug}`, { replace: true })
  }, [])

  /* Totals */
  const totalPrice    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingPrice = totalPrice >= 500 ? 0 : 60
  const discount      = couponData?.discount || 0
  const finalPrice    = Math.max(0, totalPrice - discount + shippingPrice)

  /* Coupon */
  const validateCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true); setCouponError('')
    try {
      const res = await fetch(`${BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), merchantId: store?.merchantId, orderTotal: totalPrice })
      }).then(r => r.json())
      if (res.success) { setCouponData(res.coupon); setCouponError('') }
      else { setCouponData(null); setCouponError(res.message || 'كوبون غير صحيح') }
    } catch { setCouponError('حدث خطأ، حاول تاني') }
    setCouponLoading(false)
  }

  /* Validation */
  const validate = () => {
    const errs = {}
    if (!form.name.trim())        errs.name        = 'الاسم مطلوب'
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = 'رقم موبايل غير صحيح'
    if (!form.governorate)        errs.governorate = 'اختر المحافظة'
    if (!form.address.trim())     errs.address     = 'العنوان مطلوب'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goToPayment = e => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* Place order */
  const placeOrder = async (extra = {}) => {
    setLoading(true); setError('')
    try {
      const body = {
        customer: { name: form.name, phone: form.phone, address: form.address, governorate: form.governorate, notes: form.notes },
        items: cart.map(i => ({ product: i._id, nameAr: i.nameAr || i.name, price: i.price, quantity: i.qty, image: i.images?.[0]?.url })),
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        couponCode: couponData?.code || undefined,
        ...extra
      }
      const res = await fetch(`${BASE}/store/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(r => r.json())

      if (res.success) {
        // Save customer info for next time
        localStorage.setItem('dayem_customer', JSON.stringify({
          name: form.name, phone: form.phone,
          address: form.address, governorate: form.governorate
        }))
        nav(`/store/${slug}/success`, { state: { order: res.order, store } })
      } else {
        setError(res.message || 'حدث خطأ، حاول تاني')
      }
    } catch {
      setError('تعذر الاتصال بالسيرفر، تأكد من الإنترنت')
    }
    setLoading(false)
  }

  const selectedMethod = METHODS.find(m => m.v === form.paymentMethod)

  const Field = ({ name, label, placeholder, type = 'text', dir = 'rtl', required = true }) => (
    <div>
      <label className={`co-label${focused === name ? ' active' : ''}`}>
        {label}{required && <span style={{ color: '#F87171', marginRight: 3 }}>*</span>}
      </label>
      <input
        className={`co-input${form[name] ? ' filled' : ''}${fieldErrors[name] ? ' error' : ''}`}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); if (fieldErrors[name]) setFieldErrors(fe => ({ ...fe, [name]: '' })) }}
        placeholder={placeholder}
        type={type}
        style={{ direction: dir }}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused('')}
      />
      {fieldErrors[name] && <div className="co-field-err">⚠ {fieldErrors[name]}</div>}
    </div>
  )

  return (
    <div className="co">

      {/* Header */}
      <header className="co-header">
        <div className="co-header-line" />
        <div className="co-header-inner">
          <button
            onClick={() => step === 2 ? setStep(1) : nav(-1)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'Tajawal', display: 'flex', alignItems: 'center', gap: 5 }}>
            → {step === 2 ? 'رجوع' : 'المتجر'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {store?.logo && (
              <div style={{ width: 28, height: 28, background: '#fff', padding: 2, overflow: 'hidden' }}>
                <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <span style={{ fontWeight: 900, color: '#fff', fontSize: '.9rem' }}>{store?.name}</span>
          </div>

          <div className="co-steps">
            {[1, 2].map(s => (
              <div key={s} className="co-step-dot" style={{
                width: s === step ? 22 : 7,
                background: s === step ? '#D4AF37' : s < step ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.1)'
              }} />
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="co-main">
        <div>

          {/* Mobile summary toggle */}
          {mob && (
            <>
              <div className="co-mob-summary" onClick={() => setShowSummary(v => !v)}>
                <span style={{ fontSize: '.8rem', color: '#D4AF37', fontWeight: 700 }}>
                  ملخص الطلب ({cart.length} منتج)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D4AF37' }}>{finalPrice} ج</span>
                  <span style={{ color: '#D4AF37', fontSize: '.8rem' }}>{showSummary ? '▲' : '▼'}</span>
                </div>
              </div>
              {showSummary && (
                <div style={{ marginBottom: 16 }}>
                  <Summary cart={cart} totalPrice={totalPrice} shippingPrice={shippingPrice} discount={discount} finalPrice={finalPrice} />
                </div>
              )}
            </>
          )}

          {/* ── STEP 1: Delivery & Payment method ── */}
          {step === 1 && (
            <form onSubmit={goToPayment} className="fu">

              {/* Delivery */}
              <div className="co-card">
                <div className="co-card-title">بيانات التوصيل</div>
                <div className="g2" style={{ marginBottom: 12 }}>
                  <Field name="name"  label="الاسم الكامل"  placeholder="محمد أحمد" />
                  <Field name="phone" label="رقم الموبايل"  placeholder="01xxxxxxxxx" dir="ltr" />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className={`co-label${focused === 'gov' ? ' active' : ''}`}>المحافظة <span style={{ color: '#F87171' }}>*</span></label>
                  <select
                    className={`co-input${form.governorate ? ' filled' : ''}${fieldErrors.governorate ? ' error' : ''}`}
                    value={form.governorate}
                    onChange={e => { setForm(f => ({ ...f, governorate: e.target.value })); setFieldErrors(fe => ({ ...fe, governorate: '' })) }}
                    onFocus={() => setFocused('gov')} onBlur={() => setFocused('')}>
                    <option value="">اختر المحافظة</option>
                    {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {fieldErrors.governorate && <div className="co-field-err">⚠ {fieldErrors.governorate}</div>}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Field name="address" label="العنوان التفصيلي" placeholder="الشارع، رقم المبنى، الدور..." />
                </div>
                <div>
                  <label className={`co-label${focused === 'notes' ? ' active' : ''}`}>ملاحظات (اختياري)</label>
                  <textarea
                    className={`co-input${form.notes ? ' filled' : ''}`}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="أي تعليمات خاصة للمندوب..."
                    rows={2}
                    style={{ resize: 'none' }}
                    onFocus={() => setFocused('notes')} onBlur={() => setFocused('')}
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="co-card">
                <div className="co-card-title">طريقة الدفع</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {METHODS.map(m => (
                    <div
                      key={m.v}
                      className={`co-method${form.paymentMethod === m.v ? ' selected' : ''}`}
                      style={{ '--mc': m.color }}
                      onClick={() => setForm(f => ({ ...f, paymentMethod: m.v }))}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="co-method-check">
                          {form.paymentMethod === m.v && '✓'}
                        </div>
                        <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '.88rem', fontWeight: form.paymentMethod === m.v ? 800 : 500, color: form.paymentMethod === m.v ? '#fff' : 'rgba(255,255,255,.5)', transition: 'color .2s' }}>{m.l}</div>
                          <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.2)', marginTop: 2 }}>{m.desc}</div>
                        </div>
                        {form.paymentMethod === m.v && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, boxShadow: `0 0 8px ${m.color}`, flexShrink: 0 }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="co-card">
                <div className="co-card-title">كوبون الخصم</div>
                {couponData ? (
                  <div style={{ background: 'rgba(45,212,170,.06)', border: '1px solid rgba(45,212,170,.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#2DD4AA', fontWeight: 700, fontSize: '.85rem', marginBottom: 2 }}>✓ تم تطبيق الكوبون</div>
                      <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.75rem' }}>{couponData.code} · وفّرت <span style={{ color: '#2DD4AA', fontWeight: 700 }}>{couponData.discount} ج</span></div>
                    </div>
                    <button type="button" onClick={() => { setCouponData(null); setCouponInput('') }}
                      style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,.5)', cursor: 'pointer', fontSize: '.75rem' }}>إزالة</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className={`co-input${couponInput ? ' filled' : ''}`}
                        style={{ flex: 1, direction: 'ltr', letterSpacing: 2 }}
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="PROMO2025"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), validateCoupon())}
                      />
                      <button type="button" onClick={validateCoupon} disabled={couponLoading || !couponInput.trim()}
                        style={{ padding: '0 18px', background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.25)', color: '#D4AF37', fontFamily: 'Tajawal', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem', flexShrink: 0, transition: 'all .2s' }}>
                        {couponLoading ? '...' : 'تطبيق'}
                      </button>
                    </div>
                    {couponError && <div className="co-field-err" style={{ marginTop: 8 }}>⚠ {couponError}</div>}
                  </div>
                )}
              </div>

              <button type="submit" className="co-submit">
                متابعة للدفع · {finalPrice} ج ←
              </button>
            </form>
          )}

          {/* ── STEP 2: Payment detail ── */}
          {step === 2 && (
            <div className="fu">
              <Timer seconds={900} />

              <div className="co-card">
                {/* Method indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span style={{ fontSize: '1.4rem' }}>{selectedMethod?.icon}</span>
                  <div>
                    <div style={{ fontSize: '.55rem', letterSpacing: 3, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', marginBottom: 3 }}>طريقة الدفع</div>
                    <div style={{ fontWeight: 900, color: '#fff', fontSize: '.95rem' }}>{selectedMethod?.l}</div>
                  </div>
                </div>

                {form.paymentMethod === 'vodafone_cash' && <VodafonePanel store={store} final={finalPrice} onConfirm={placeOrder} loading={loading} error={error} />}
                {form.paymentMethod === 'instapay'      && <InstapayPanel  store={store} final={finalPrice} onConfirm={placeOrder} loading={loading} error={error} />}
                {form.paymentMethod === 'fawry'         && <FawryPanel     store={store} final={finalPrice} onConfirm={placeOrder} loading={loading} error={error} />}
                {form.paymentMethod === 'cash'          && <CashPanel               final={finalPrice} onConfirm={placeOrder} loading={loading} error={error} />}
              </div>

              {/* Customer info recap */}
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '.58rem', letterSpacing: 2, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Space Mono, monospace' }}>بيانات التوصيل</div>
                  <div style={{ fontSize: '.82rem', color: '#fff', fontWeight: 600 }}>{form.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>{form.phone} · {form.governorate}</div>
                </div>
                <button onClick={() => setStep(1)}
                  style={{ background: 'none', border: '1px solid rgba(212,175,55,.2)', color: '#D4AF37', fontFamily: 'Tajawal', fontSize: '.72rem', padding: '6px 14px', cursor: 'pointer', alignSelf: 'center' }}>
                  تعديل
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary — desktop only */}
        {!mob && (
          <Summary cart={cart} totalPrice={totalPrice} shippingPrice={shippingPrice} discount={discount} finalPrice={finalPrice} />
        )}
      </div>
    </div>
  )
}
