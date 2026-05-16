import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'

// ── Lazy load all pages (code splitting = faster load) ────
const Login            = lazy(() => import('./pages/merchant/Login'))
const Register         = lazy(() => import('./pages/merchant/Register'))
const Dashboard        = lazy(() => import('./pages/merchant/Dashboard'))
const Products         = lazy(() => import('./pages/merchant/Products'))
const Orders           = lazy(() => import('./pages/merchant/Orders'))
const Settings         = lazy(() => import('./pages/merchant/Settings'))
const Analytics        = lazy(() => import('./pages/merchant/Analytics'))
const Coupons          = lazy(() => import('./pages/merchant/Coupons'))
const CustomerStore    = lazy(() => import('./pages/store/CustomerStore'))
const Checkout         = lazy(() => import('./pages/store/Checkout'))
const OrderSuccess     = lazy(() => import('./pages/store/OrderSuccess'))
const CustomerLogin    = lazy(() => import('./pages/store/CustomerLogin'))
const CustomerDashboard= lazy(() => import('./pages/store/CustomerDashboard'))
const OrderTracker     = lazy(() => import('./pages/store/OrderTracker'))
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminLogin       = lazy(() => import('./pages/admin/AdminLogin'))
const Discovery        = lazy(() => import('./pages/Discovery'))

// ── Loading fallback ──────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight:'100vh', background:'#060F1E', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'2rem', color:'#D4AF37', marginBottom:12, animation:'spin 2s linear infinite' }}>∞</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  </div>
)

// ── Auth Guards ───────────────────────────────────────────
const Guard = ({ children }) => {
  const token = localStorage.getItem('dayem_token')
  if (!token) { window.location.href = '/login'; return null; }
  return children
}

const AdminGuard = ({ children }) => {
  const token = localStorage.getItem('dayem_admin_token')
  if (!token) { window.location.href = '/admin/login'; return null; }
  return children
}

// ── Landing redirect ──────────────────────────────────────
const Landing = () => {
  useEffect(() => { window.location.replace('/dayem-v5-final.html') }, [])
  return <PageLoader />
}

// ── SEO helper ────────────────────────────────────────────
const setMeta = (title, description) => {
  document.title = title
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', description)
}

// ── Store page with dynamic meta ─────────────────────────
const StoreWrapper = () => {
  useEffect(() => {
    const slug = window.location.pathname.split('/store/')[1]?.split('/')[0]
    if (slug) setMeta(`متجر ${slug} — دايم`, `تسوق الآن من متجر ${slug} على منصة دايم`)
  }, [])
  return <Suspense fallback={<PageLoader />}><CustomerStore /></Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"         element={<Landing />} />
          <Route path="/discover" element={<Discovery />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track"    element={<OrderTracker />} />

          {/* ── Merchant Dashboard ── */}
          <Route path="/dashboard"           element={<Guard><Dashboard /></Guard>} />
          <Route path="/dashboard/products"  element={<Guard><Products /></Guard>} />
          <Route path="/dashboard/orders"    element={<Guard><Orders /></Guard>} />
          <Route path="/dashboard/settings"  element={<Guard><Settings /></Guard>} />
          <Route path="/dashboard/analytics" element={<Guard><Analytics /></Guard>} />
          <Route path="/dashboard/coupons"   element={<Guard><Coupons /></Guard>} />

          {/* ── Store ── */}
          <Route path="/store/:slug"          element={<StoreWrapper />} />
          <Route path="/store/:slug/checkout" element={<Checkout />} />
          <Route path="/store/:slug/success"  element={<OrderSuccess />} />

          {/* ── Customer ── */}
          <Route path="/customer/login"     element={<CustomerLogin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />

          {/* ── Admin ── */}
          <Route path="/admin/login"     element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

          {/* ── 404 ── */}
          <Route path="*" element={
            <div style={{ minHeight:'100vh', background:'#060F1E', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:'Tajawal', direction:'rtl' }}>
              <div style={{ fontSize:'4rem', color:'rgba(212,175,55,.2)' }}>∞</div>
              <h1 style={{ color:'#fff', fontSize:'1.5rem', fontWeight:900 }}>الصفحة مش موجودة</h1>
              <a href="/" style={{ color:'#D4AF37', fontSize:'.85rem' }}>الرجوع للرئيسية ←</a>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
