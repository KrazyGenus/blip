const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Define where files go and how they are named
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id
        const userUploadDir = path.join(__dirname, 'uploads', `user_${userId}`);
            
        //create directory if not exist
        fs.mkdirSync(userUploadDir, { recursive: true });

        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()} - ${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });
module.exports = { upload };