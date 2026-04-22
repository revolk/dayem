# دايم ∞ DAYEM

> منصة التجارة الإلكترونية المصرية — تجارتك بدون قيود

---

## ما هو دايم؟

دايم منصة SaaS تخلي أي تاجر مصري يعمل متجر أونلاين احترافي في 5 دقايق — بدون خبرة تقنية، من واتساب بس.

---

## المميزات

- ✦ متجر أونلاين كامل لكل تاجر برابط مخصص
- ✦ إضافة منتجات بالذكاء الاصطناعي — ارفع صورة والـ AI يكتب البيانات
- ✦ إدارة الطلبات والتوصيل لـ 27 محافظة
- ✦ كل طرق الدفع — كاش / فودافون كاش / انستاباي / فوري
- ✦ داشبورد احترافي Real-time
- ✦ رفع الصور على Cloudinary

---

## التقنيات

### Backend
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Cloudinary (رفع الصور)
- Groq API / llama-4 (الذكاء الاصطناعي)

### Frontend
- React + Vite
- React Router
- CSS-in-JS (inline styles)
- Tajawal + Playfair Display

---

## تشغيل المشروع محلياً

### المتطلبات
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Groq API key

### Backend
```bash
cd backend
npm install
# أنشئ ملف .env وأضف المتغيرات المطلوبة
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### متغيرات البيئة (backend/.env)
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## هيكل المشروع

```
dayem/
├── backend/
│   ├── server.js
│   └── src/
│       ├── models/
│       │   ├── User.js
│       │   ├── Product.js
│       │   └── Order.js
│       └── routes/
│           ├── merchant.js
│           ├── store.js
│           ├── ai.js
│           └── upload.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── services/api.js
        ├── components/Sidebar.jsx
        └── pages/
            ├── merchant/
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   ├── Dashboard.jsx
            │   ├── Products.jsx
            │   ├── Orders.jsx
            │   └── Settings.jsx
            └── store/
                ├── CustomerStore.jsx
                ├── Checkout.jsx
                └── OrderSuccess.jsx
```

---

## خطط الأسعار

| الخطة | السعر | المميزات |
|-------|-------|----------|
| ستارتر | 100 ج/شهر | حتى 50 منتج |
| تاجر | 199 ج/شهر | منتجات غير محدودة + تقارير |
| برو | 349 ج/شهر | كل المميزات + متاجر متعددة |

---

## التواصل

- واتساب: +201027360268
- الموقع: dayem.shop

---

<div align="center">
  <strong>DAYEM ∞ — Trade Without Restrictions</strong>
</div>
