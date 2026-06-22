const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt      = require('jsonwebtoken');

// ── Cloudinary config ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Auth middleware ───────────────────────────────────────
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

// ── Multer: memory storage ────────────────────────────────
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('يسمح فقط بصور JPG/PNG/WebP'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});

// ── Upload helper ─────────────────────────────────────────
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `dayem/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }  // auto WebP
        ],
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── POST /api/upload/image — single image ─────────────────
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم إرسال صورة' });

    const result = await uploadToCloudinary(req.file.buffer, 'products');
    res.json({
      success:  true,
      url:      result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'فشل رفع الصورة' });
  }
});

// ── POST /api/upload/images — multiple images (up to 5) ───
router.post('/images', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'لم يتم إرسال صور' });

    const uploads = await Promise.all(
      req.files.map((file, index) =>
        uploadToCloudinary(file.buffer, 'products').then(result => ({
          url:       result.secure_url,
          publicId:  result.public_id,
          isPrimary: index === 0,
        }))
      )
    );

    res.json({ success: true, images: uploads });
  } catch (err) {
    console.error('Multi-upload error:', err.message);
    res.status(500).json({ message: 'فشل رفع الصور' });
  }
});

// ── POST /api/upload/logo — store logo ────────────────────
router.post('/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم إرسال صورة' });

    const result = await uploadToCloudinary(req.file.buffer, 'logos', {
      transformation: [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ message: 'فشل رفع الشعار' });
  }
});

// ── DELETE /api/upload/image — delete from Cloudinary ─────
router.delete('/image', auth, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId مطلوب' });

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'فشل حذف الصورة' });
  }
});

// ── Error handler for multer ──────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')  return res.status(400).json({ message: 'الصورة أكبر من 5MB' });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'أقصى عدد 5 صور' });
  }
  res.status(400).json({ message: err.message });
});

module.exports = router;
