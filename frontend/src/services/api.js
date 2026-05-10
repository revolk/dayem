const getBase = () => {
  if (window.location.protocol === 'https:') {
    return `${window.location.origin}/api`
  }
  return `http://${window.location.hostname}:5000/api`
}

const BASE = getBase()
const token = () => localStorage.getItem('dayem_token')
const headers = () => ({
  'Content-Type': 'application/json',
  ...(token() && { Authorization: `Bearer ${token()}` })
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
  getOrders: () => safeFetch(`${BASE}/merchant/orders`, { headers: headers() }),
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
  }
}

export const storeAPI = {
  getStore: (slug) => safeFetch(`${BASE}/store/${slug}`),
  getProducts: (slug) => safeFetch(`${BASE}/store/${slug}/products`),
  placeOrder: (slug, d) => safeFetch(`${BASE}/store/${slug}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }),
}

export { BASE }