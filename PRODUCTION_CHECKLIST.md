# دايم ∞ — Production Checklist

## 🔴 قبل الرفع — لازم تتعمل

### Security
- [ ] **غيّر JWT_SECRET** لـ random 64-char string
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **أضف PAYMOB_HMAC_SECRET** من Paymob Dashboard → Developers
- [ ] **شيل .env من GitHub** — تأكد إنه في .gitignore
- [ ] **غيّر MongoDB password** من Atlas dashboard
- [ ] **Rotate Cloudinary credentials** من Cloudinary console

### Infrastructure
- [ ] Set `NODE_ENV=production` على السيرفر
- [ ] Configure Paymob Webhook URL:
  `https://api.dayem.shop/api/payment/webhook`
- [ ] Test webhook with Paymob test mode first

### SEO
- [ ] حط `robots.txt` في `frontend/public/`
- [ ] حط `vercel.json` أو `_redirects` في root
- [ ] Add `<meta>` tags in `frontend/index.html`
- [ ] Submit sitemap to Google Search Console

### Performance
- [ ] `npm run build` وشوف الـ bundle size
- [ ] Enable Cloudinary image optimization (auto format + quality)
- [ ] MongoDB Atlas — enable index on: store.slug, orderNumber, customer.phone

### Monitoring
- [ ] Setup UptimeRobot على `https://api.dayem.shop/health`
- [ ] Setup MongoDB Atlas alerts for connections/disk

## ✅ الملفات الجديدة المطلوبة
- `backend/src/server.js` ← الملف الجديد
- `backend/src/routes/payment.js` ← مع HMAC verification
- `frontend/src/App.jsx` ← مع lazy loading
- `frontend/public/robots.txt`
- `vercel.json` أو `_redirects`
- `.gitignore` ← تأكد إن .env موجود فيه
