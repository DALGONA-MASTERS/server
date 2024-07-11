// middleware/uploadAudio.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const mimetypes = /audio\/mpeg|audio\/wav|audio\/ogg|audio\/webm/;
        const extensions = /\.(mp3|wav|ogg|webm)$/;
        
        const mimetype = mimetypes.test(file.mimetype);
        const extname = extensions.test(file.originalname.toLowerCase());

        console.log('File MIME type:', file.mimetype);
        console.log('File original name:', file.originalname);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});

module.exports = upload;