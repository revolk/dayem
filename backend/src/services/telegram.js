// backend/src/services/telegram.js

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * بيبعت رسالة تليجرام للتاجر
 * @param {string} chatId  - الـ chat_id بتاع التاجر
 * @param {string} message - نص الرسالة
 */
async function sendTelegram(chatId, message) {
  if (!TELEGRAM_TOKEN || !chatId) return;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error('Telegram error:', data);
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
}

/**
 * رسالة طلب جديد — فاخرة تليق بـ DAYEM ∞
 */
function buildNewOrderMessage(order, storeName) {
  const items = order.items
    .map(i => `  • ${i.nameAr} × ${i.quantity} — ${i.price * i.quantity} ج`)
    .join('\n');

  const paymentMap = {
    cash:          '💵 كاش عند الاستلام',
    vodafone_cash: '📱 فودافون كاش',
    instapay:      '💳 إنستاباي',
    fawry:         '🏪 فوري',
  };

  return `
╔══════════════════════╗
   🛍️ <b>طلب جديد — دايم ∞</b>
╚══════════════════════╝

🏪 <b>المتجر:</b> ${storeName}
📋 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>

👤 <b>العميل:</b> ${order.customer.name}
📞 <b>الهاتف:</b> <code>${order.customer.phone}</code>
📍 <b>العنوان:</b> ${order.customer.address}، ${order.customer.governorate}

━━━━━━━━━━━━━━━━━━━━━━
🛒 <b>المنتجات:</b>
${items}
━━━━━━━━━━━━━━━━━━━━━━

💰 <b>المنتجات:</b> ${order.totalPrice} ج
🚚 <b>الشحن:</b> ${order.shippingPrice} ج
✅ <b>الإجمالي:</b> <b>${order.finalPrice} ج</b>

${paymentMap[order.paymentMethod] || order.paymentMethod}
${order.notes ? `\n📝 <b>ملاحظات:</b> ${order.notes}` : ''}

⏰ ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
`.trim();
}

module.exports = { sendTelegram, buildNewOrderMessage };
