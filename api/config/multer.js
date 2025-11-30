const multer = require('multer');
const path = require('path')

const crypto = require('crypto');

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();

        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExts.includes(ext)) {
            return cb(new Error('Invalid file extension'));
        }

        cb(null, `${randomName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
        files: 10 
    },
    fileFilter
});

module.exports = upload;