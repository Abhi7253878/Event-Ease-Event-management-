const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const dir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
  destination: dir,
  filename: (_r, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
});
const upload = multer({
  storage, limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_r, file, cb) => (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images allowed'), { status: 400 }))),
});
// Returns public URL: Cloudinary if configured, else local /uploads
async function saveImage(file) {
  if (!file) return undefined;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    const r = await cloudinary.uploader.upload(file.path, { folder: 'eventease' });
    fs.unlink(file.path, () => {});
    return r.secure_url;
  }
  return `/uploads/${file.filename}`;
}
module.exports = { upload, saveImage };
