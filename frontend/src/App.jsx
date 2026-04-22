import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/merchant/Login'
import Register from './pages/merchant/Register'
import Dashboard from './pages/merchant/Dashboard'
import Products from './pages/merchant/Products'
import Orders from './pages/merchant/Orders'
import Settings from './pages/merchant/Settings'
import CustomerStore from './pages/store/CustomerStore'
import Checkout from './pages/store/Checkout'
import OrderSuccess from './pages/store/OrderSuccess'

const Guard = ({ children }) => {
  const token = localStorage.getItem('dayem_token')
  if (!token) { window.location.href = '/login'; return null; }
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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/dashboard/products" element={<Guard><Products /></Guard>} />
        <Route path="/dashboard/orders" element={<Guard><Orders /></Guard>} />
        <Route path="/dashboard/settings" element={<Guard><Settings /></Guard>} />
        <Route path="/store/:slug" element={<CustomerStore />} />
        <Route path="/store/:slug/checkout" element={<Checkout />} />
        <Route path="/store/:slug/success" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  )
}
