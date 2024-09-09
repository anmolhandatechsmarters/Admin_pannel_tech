const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Setup multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure parent directories are created
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const filename = `${Date.now()}${fileExtension}`; // Use timestamp for unique filenames
      cb(null, filename);
    }
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2 MB
    }
  });
  

module.exports = upload;
