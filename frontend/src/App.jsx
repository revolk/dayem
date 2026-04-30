import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/merchant/Login'
import Register from './pages/merchant/Register'
import Dashboard from './pages/merchant/Dashboard'
import Products from './pages/merchant/Products'
import Orders from './pages/merchant/Orders'
import Settings from './pages/merchant/Settings'
import Analytics from './pages/merchant/Analytics'
import Coupons from './pages/merchant/Coupons'
import CustomerStore from './pages/store/CustomerStore'
import Checkout from './pages/store/Checkout'
import OrderSuccess from './pages/store/OrderSuccess'
import CustomerLogin from './pages/store/CustomerLogin'
import CustomerDashboard from './pages/store/CustomerDashboard'
import OrderTracker from './pages/store/OrderTracker'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import Discovery from './pages/Discovery'

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

const Landing = () => {
  window.location.replace('/dayem-v5-final.html')
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Discovery />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Merchant Dashboard */}
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/dashboard/products" element={<Guard><Products /></Guard>} />
        <Route path="/dashboard/orders" element={<Guard><Orders /></Guard>} />
        <Route path="/dashboard/settings" element={<Guard><Settings /></Guard>} />
        <Route path="/dashboard/analytics" element={<Guard><Analytics /></Guard>} />
        <Route path="/dashboard/coupons" element={<Guard><Coupons /></Guard>} />

        {/* Store */}
        <Route path="/store/:slug" element={<CustomerStore />} />
        <Route path="/store/:slug/checkout" element={<Checkout />} />
        <Route path="/store/:slug/success" element={<OrderSuccess />} />

        {/* Customer */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/track" element={<OrderTracker />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      </Routes>
    </BrowserRouter>
  )
}
