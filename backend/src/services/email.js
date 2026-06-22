// backend/src/services/email.js
const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  // Default: SMTP (works with any provider)
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   process.env.SMTP_PORT   || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
};

// ── Base email template ───────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; }
    .wrap { max-width:560px; margin:32px auto; background:#fff; border-radius:4px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
    .head { background:#060F1E; padding:28px 32px; text-align:center; }
    .head-logo { font-size:2rem; color:#D4AF37; margin-bottom:4px; }
    .head-sub  { font-size:.75rem; letter-spacing:4px; color:rgba(212,175,55,.6); text-transform:uppercase; }
    .body { padding:32px; color:#1a1a1a; }
    .body h2 { font-size:1.2rem; color:#060F1E; margin:0 0 16px; }
    .body p  { font-size:.9rem; line-height:1.8; color:#444; margin:0 0 14px; }
    .btn { display:inline-block; padding:13px 28px; background:#D4AF37; color:#0C2540; text-decoration:none; font-weight:700; font-size:.9rem; border-radius:2px; margin:16px 0; }
    .divider { height:1px; background:#f0f0f0; margin:20px 0; }
    .small { font-size:.75rem; color:#888; line-height:1.6; }
    .foot { background:#f9f9f9; padding:16px 32px; text-align:center; border-top:1px solid #eee; }
    .foot p { font-size:.72rem; color:#999; margin:0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div class="head-logo">∞</div>
      <div class="head-sub">DAYEM — Trade Without Restrictions</div>
    </div>
    <div class="body">${content}</div>
    <div class="foot">
      <p>© 2026 دايم — جميع الحقوق محفوظة</p>
      <p style="margin-top:4px"><a href="https://dayem.shop" style="color:#D4AF37;text-decoration:none;">dayem.shop</a></p>
    </div>
  </div>
</body>
</html>
`;

// ── Email templates ───────────────────────────────────────
const templates = {

  // 1. Email verification
  verify: ({ name, link }) => ({
    subject: 'دايم — تفعيل حسابك 🔐',
    html: baseTemplate(`
      <h2>أهلاً ${name}! 👋</h2>
      <p>شكراً لتسجيلك في دايم. اضغط على الزرار أدناه لتفعيل حسابك:</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">تفعيل الحساب ←</a>
      </div>
      <div class="divider"></div>
      <p class="small">الرابط صالح لـ ٢٤ ساعة فقط.<br>لو مش أنت اللي سجّل — تجاهل الإيميل ده.</p>
    `)
  }),

  // 2. Password reset
  resetPassword: ({ name, link }) => ({
    subject: 'دايم — إعادة تعيين كلمة المرور 🔑',
    html: baseTemplate(`
      <h2>إعادة تعيين كلمة المرور</h2>
      <p>أهلاً ${name}، طلبت إعادة تعيين كلمة المرور بتاعتك:</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">إعادة تعيين كلمة المرور ←</a>
      </div>
      <div class="divider"></div>
      <p class="small">الرابط صالح لـ ٣٠ دقيقة فقط.<br>لو مش أنت اللي طلب ده — تجاهل الإيميل وحسابك أمان.</p>
    `)
  }),

  // 3. New order notification to merchant
  newOrder: ({ merchantName, order, storeName }) => ({
    subject: `🔔 طلب جديد #${order.orderNumber} — ${storeName}`,
    html: baseTemplate(`
      <h2>طلب جديد وصلك! 🎉</h2>
      <p>أهلاً ${merchantName}، وصل طلب جديد لمتجرك <strong>${storeName}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f9f9f9">
          <td style="padding:10px;border:1px solid #eee;font-weight:700">رقم الطلب</td>
          <td style="padding:10px;border:1px solid #eee;color:#D4AF37;font-weight:700">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;font-weight:700">العميل</td>
          <td style="padding:10px;border:1px solid #eee">${order.customer?.name}</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:10px;border:1px solid #eee;font-weight:700">الموبايل</td>
          <td style="padding:10px;border:1px solid #eee">${order.customer?.phone}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;font-weight:700">المحافظة</td>
          <td style="padding:10px;border:1px solid #eee">${order.customer?.governorate}</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:10px;border:1px solid #eee;font-weight:700">الإجمالي</td>
          <td style="padding:10px;border:1px solid #eee;color:#060F1E;font-weight:700;font-size:1.1rem">${order.finalPrice} ج</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;font-weight:700">طريقة الدفع</td>
          <td style="padding:10px;border:1px solid #eee">${order.paymentMethod === 'cash' ? 'كاش عند الاستلام' : order.paymentMethod}</td>
        </tr>
      </table>
      <div style="text-align:center">
        <a href="https://dayem.shop/dashboard/orders" class="btn">إدارة الطلبات ←</a>
      </div>
    `)
  }),

  // 4. Order confirmation to customer
  orderConfirmed: ({ order, storeName }) => ({
    subject: `✅ تم تأكيد طلبك #${order.orderNumber} — ${storeName}`,
    html: baseTemplate(`
      <h2>تم استلام طلبك! ✅</h2>
      <p>أهلاً ${order.customer?.name}، تم استلام طلبك من <strong>${storeName}</strong> بنجاح.</p>
      <div style="background:#f9f9f9;padding:16px;border-right:3px solid #D4AF37;margin:16px 0">
        <p style="margin:0 0 6px"><strong>رقم الطلب:</strong> <span style="color:#D4AF37;font-weight:700">${order.orderNumber}</span></p>
        <p style="margin:0 0 6px"><strong>الإجمالي:</strong> ${order.finalPrice} ج</p>
        <p style="margin:0"><strong>طريقة الدفع:</strong> ${order.paymentMethod === 'cash' ? 'كاش عند الاستلام' : order.paymentMethod}</p>
      </div>
      <div style="text-align:center">
        <a href="https://dayem.shop/track?order=${order.orderNumber}" class="btn">تتبع طلبك ←</a>
      </div>
      <div class="divider"></div>
      <p class="small">لو عندك أي استفسار، تواصل مع المتجر مباشرة.</p>
    `)
  }),

  // 5. Order status update to customer
  orderStatus: ({ order, storeName, newStatus }) => {
    const statusMsg = {
      confirmed:  { title: 'تم تأكيد طلبك ✓',    msg: 'المتجر أكد طلبك وبيجهزه دلوقتي.' },
      processing: { title: 'طلبك بيتجهز ⚙️',     msg: 'المتجر بيجهز طلبك للشحن.' },
      shipped:    { title: 'طلبك في الطريق 🚚',   msg: 'طلبك اتشحن وفي الطريق إليك.' },
      delivered:  { title: 'تم التوصيل! 🎉',      msg: 'وصلك طلبك بنجاح. نورت!' },
      cancelled:  { title: 'تم إلغاء الطلب ❌',   msg: 'للأسف تم إلغاء طلبك. تواصل مع المتجر لمزيد من التفاصيل.' },
    };
    const s = statusMsg[newStatus] || { title: 'تحديث الطلب', msg: 'تم تحديث حالة طلبك.' };
    return {
      subject: `${s.title} — طلب #${order.orderNumber}`,
      html: baseTemplate(`
        <h2>${s.title}</h2>
        <p>أهلاً ${order.customer?.name}، ${s.msg}</p>
        <p><strong>رقم الطلب:</strong> <span style="color:#D4AF37;font-weight:700">${order.orderNumber}</span></p>
        <div style="text-align:center;margin-top:20px">
          <a href="https://dayem.shop/track?order=${order.orderNumber}" class="btn">تتبع طلبك ←</a>
        </div>
      `)
    };
  },

  // 6. Welcome merchant
  welcomeMerchant: ({ name, storeName, storeUrl }) => ({
    subject: `مرحباً في دايم يا ${name}! 🎉`,
    html: baseTemplate(`
      <h2>أهلاً وسهلاً يا ${name}! 🌟</h2>
      <p>متجرك <strong>${storeName}</strong> جاهز دلوقتي على دايم!</p>
      <div style="background:#060F1E;padding:20px;text-align:center;margin:20px 0">
        <p style="color:rgba(255,255,255,.6);font-size:.8rem;margin:0 0 8px">رابط متجرك</p>
        <a href="${storeUrl}" style="color:#D4AF37;font-weight:700;font-size:1rem;text-decoration:none;">${storeUrl}</a>
      </div>
      <p>ابدأ دلوقتي بـ:</p>
      <ul style="padding-right:20px;color:#444;line-height:2">
        <li>إضافة منتجاتك</li>
        <li>تخصيص بيانات المتجر</li>
        <li>مشاركة رابط متجرك مع عملائك</li>
      </ul>
      <div style="text-align:center">
        <a href="https://dayem.shop/dashboard" class="btn">الذهاب للداشبورد ←</a>
      </div>
    `)
  }),

};

// ── Send email function ───────────────────────────────────
const sendEmail = async ({ to, template, data }) => {
  // Skip if email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email not configured — skipping:', template);
    return;
  }

  try {
    const transporter = createTransporter();
    const { subject, html } = templates[template](data);

    await transporter.sendMail({
      from: `"دايم ∞" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent [${template}] → ${to}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed [${template}]:`, err.message);
    return false;
  }
};

module.exports = { sendEmail };
