const BASE = `http://${window.location.hostname}:5000/api`

const token = () => localStorage.getItem('dayem_token')
const headers = () => ({
  'Content-Type': 'application/json',
  ...(token() && { Authorization: `Bearer ${token()}` })
})

export const merchantAPI = {
  register: (d) => fetch(`${BASE}/merchant/register`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(r => r.json()),
  login: (d) => fetch(`${BASE}/merchant/login`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(r => r.json()),
  me: () => fetch(`${BASE}/merchant/me`, { headers: headers() }).then(r => r.json()),
  stats: () => fetch(`${BASE}/merchant/stats`, { headers: headers() }).then(r => r.json()),
  getProducts: () => fetch(`${BASE}/merchant/products`, { headers: headers() }).then(r => r.json()),
  addProduct: (d) => fetch(`${BASE}/merchant/products`, { method: 'POST', headers: headers(), body: JSON.stringify(d) }).then(r => r.json()),
  updateProduct: (id, d) => fetch(`${BASE}/merchant/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }).then(r => r.json()),
  deleteProduct: (id) => fetch(`${BASE}/merchant/products/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
  getOrders: () => fetch(`${BASE}/merchant/orders`, { headers: headers() }).then(r => r.json()),
  updateOrder: (id, status) => fetch(`${BASE}/merchant/orders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ orderStatus: status }) }).then(r => r.json()),
  updateStore: (d) => fetch(`${BASE}/merchant/store`, { method: 'PUT', headers: headers(), body: JSON.stringify(d) }).then(r => r.json()),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return fetch(`${BASE}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    }).then(r => r.json())
  }
}

export const storeAPI = {
  getStore: (slug) => fetch(`${BASE}/store/${slug}`).then(r => r.json()),
  getProducts: (slug) => fetch(`${BASE}/store/${slug}/products`).then(r => r.json()),
  placeOrder: (slug, d) => fetch(`${BASE}/store/${slug}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
}
