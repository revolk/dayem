const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.merchant = await User.findById(decoded.id);
    if (!req.merchant || req.merchant.role !== 'merchant') {
      return res.status(401).json({ message: 'غير مصرح' });
    }
    next();
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

// Analyze product image with AI
router.post('/analyze-product', protect, async (req, res) => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    const imageContent = imageBase64
      ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: 'image_url', image_url: { url: imageUrl } };

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            imageContent,
            {
              type: 'text',
              text: `أنت خبير في التجارة الإلكترونية المصرية. حلل الصورة دي واكتب بيانات المنتج.

رد بـ JSON فقط بالشكل ده:
{
  "nameAr": "اسم المنتج بالعربي",
  "name": "Product name in English",
  "description": "وصف تسويقي مقنع بالعربي من 2-3 جمل",
  "category": "فئة المنتج (مثل: ملابس، إلكترونيات، أكسسوارات، منزل، طعام)",
  "suggestedPrice": رقم السعر المقترح بالجنيه المصري,
  "tags": ["tag1", "tag2", "tag3"]
}`
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: 'فشل تحليل الصورة' });
    }

    const productData = JSON.parse(jsonMatch[0]);
    res.json({ success: true, product: productData });

  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ message: 'فشل تحليل الصورة: ' + err.message });
  }
});

// Generate store description
router.post('/store-description', protect, async (req, res) => {
  try {
    const { storeName, category } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: `اكتب وصف تسويقي قصير ومقنع لمتجر إلكتروني مصري اسمه "${storeName}" في مجال "${category}". الوصف من جملة أو جملتين بالعربي فقط. بدون أي مقدمات.`
      }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const description = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ success: true, description });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;