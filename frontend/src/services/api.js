const getBase = () => {
  if (window.location.protocol === 'https:') {
    return `${window.location.origin}/api`
  }
  return `http://${window.location.hostname}:5000/api`
}

const BASE = getBase()
const token = () => localStorage.getItem('dayem_token')
const adminToken = () => localStorage.getItem('dayem_admin_token')
const customerToken = () => localStorage.getItem('dayem_customer_token')

const headers = (customToken) => ({
  'Content-Type': 'application/json',
  ...((customToken || token()) && { Authorization: `Bearer ${customToken || token()}` })
})

const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('API Error:', err)
    return { success: false, message: 'خطأ في الاتصال بالسيرفر' }
  }
}

export const merchantAPI = {
  register: (d) => safeFetch(`${BASE}/merchant/register`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  login: (d) => safeFetch(`${BASE}/merchant/login`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  me: () => safeFetch(`${BASE}/merchant/me`, { headers: headers() }),
  stats: () => safeFetch(`${BASE}/merchant/stats`, { headers: headers() }),
  getProducts: () => safeFetch(`${BASE}/merchant/products`, { headers: headers() }),
  addProduct: (d) => safeFetch(`${BASE}/merchant/products`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  updateProduct: (id, d) => safeFetch(`${BASE}/merchant/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }),
  deleteProduct: (id) => safeFetch(`${BASE}/merchant/products/${id}`, { method: 'DELETE', headers: headers() }),
  getOrders: (params = '') => safeFetch(`${BASE}/merchant/orders${params ? '?' + params : ''}`, { headers: headers() }),
  updateOrder: (id, status) => safeFetch(`${BASE}/merchant/orders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ orderStatus: status }) }),
  updateStore: (d) => safeFetch(`${BASE}/merchant/store`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return safeFetch(`${BASE}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    })
  },
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach(f => formData.append('images', f))
    return safeFetch(`${BASE}/upload/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    })
  },
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    return safeFetch(`${BASE}/upload/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    })
  },
  forgotPassword: (d) => safeFetch(`${BASE}/merchant/forgot-password`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  resetPassword: (d) => safeFetch(`${BASE}/merchant/reset-password`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
}

export const analyticsAPI = {
  overview: (period = '30d') => safeFetch(`${BASE}/analytics/overview?period=${period}`, { headers: headers() }),
  revenueChart: (period = '30d') => safeFetch(`${BASE}/analytics/revenue-chart?period=${period}`, { headers: headers() }),
  topProducts: (period = '30d') => safeFetch(`${BASE}/analytics/top-products?period=${period}`, { headers: headers() }),
  ordersByStatus: (period = '30d') => safeFetch(`${BASE}/analytics/orders-by-status?period=${period}`, { headers: headers() }),
  hourlyHeatmap: (period = '30d') => safeFetch(`${BASE}/analytics/hourly-heatmap?period=${period}`, { headers: headers() }),
  recentOrders: () => safeFetch(`${BASE}/analytics/recent-orders`, { headers: headers() }),
}

export const couponsAPI = {
  getAll: () => safeFetch(`${BASE}/coupons`, { headers: headers() }),
  create: (d) => safeFetch(`${BASE}/coupons`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  update: (id, d) => safeFetch(`${BASE}/coupons/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }),
  delete: (id) => safeFetch(`${BASE}/coupons/${id}`, { method: 'DELETE', headers: headers() }),
  validate: (d) => safeFetch(`${BASE}/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
}

export const storeAPI = {
  getStore: (slug) => safeFetch(`${BASE}/store/${slug}`),
  getProducts: (slug, params = '') => safeFetch(`${BASE}/store/${slug}/products${params ? '?' + params : ''}`),
  getFeaturedCoupon: (slug) => safeFetch(`${BASE}/store/${slug}/featured-coupon`),
  placeOrder: (slug, d) => safeFetch(`${BASE}/store/${slug}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }),
  discover: (params = '') => safeFetch(`${BASE}/store?${params}`),
}

export const customerAPI = {
  login: (d) => safeFetch(`${BASE}/customer/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
  me: () => safeFetch(`${BASE}/customer/me`, { headers: headers(customerToken()) }),
  updateMe: (d) => safeFetch(`${BASE}/customer/me`, { method: 'PUT', headers: headers(customerToken()), body: JSON.stringify(d) }),
  orders: (params = '') => safeFetch(`${BASE}/customer/orders${params ? '?' + params : ''}`, { headers: headers(customerToken()) }),
  track: (orderNumber) => safeFetch(`${BASE}/customer/track/${orderNumber}`),
  reviews: (merchantId, params = '') => safeFetch(`${BASE}/customer/reviews/${merchantId}${params ? '?' + params : ''}`),
  addReview: (d) => safeFetch(`${BASE}/customer/reviews`, { method: 'POST', headers: headers(customerToken()), body: JSON.stringify(d) }),
}

export const reviewsAPI = {
  getStoreReviews: (slug, params = '') => safeFetch(`${BASE}/reviews/${slug}${params ? '?' + params : ''}`),
  addReview: (slug, d) => safeFetch(`${BASE}/reviews/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
  reply: (id, d) => safeFetch(`${BASE}/reviews/${id}/reply`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }),
  merchantReviews: (params = '') => safeFetch(`${BASE}/reviews/merchant/all${params ? '?' + params : ''}`, { headers: headers() }),
}

export const adminAPI = {
  login: (d) => safeFetch(`${BASE}/admin/login`, { method: 'POST', headers: headers(adminToken()), body: JSON.stringify(d) }),
  stats: () => safeFetch(`${BASE}/admin/stats`, { headers: headers(adminToken()) }),
  merchants: (params = '') => safeFetch(`${BASE}/admin/merchants?${params}`, { headers: headers(adminToken()) }),
  getMerchant: (id) => safeFetch(`${BASE}/admin/merchants/${id}`, { headers: headers(adminToken()) }),
  updateMerchant: (id, d) => safeFetch(`${BASE}/admin/merchants/${id}`, { method: 'PUT', headers: headers(adminToken()), body: JSON.stringify(d) }),
  deleteMerchant: (id) => safeFetch(`${BASE}/admin/merchants/${id}`, { method: 'DELETE', headers: headers(adminToken()) }),
  orders: (params = '') => safeFetch(`${BASE}/admin/orders?${params}`, { headers: headers(adminToken()) }),
}

export const paymentAPI = {
  plans: () => safeFetch(`${BASE}/payment/plans`),
  initiate: (d) => safeFetch(`${BASE}/payment/initiate`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  status: () => safeFetch(`${BASE}/payment/status`, { headers: headers() }),
}

export const aiAPI = {
  analyzeProduct: (d) => safeFetch(`${BASE}/ai/analyze-product`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
  storeDescription: (d) => safeFetch(`${BASE}/ai/store-description`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }),
}

export { BASE }
