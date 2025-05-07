const multer = require('multer');
const path = require('path');



// configure extension checker
// const fileFilter = (req, file, cb) => {
//     const validVideoExtensions = {
//         png: 'image/png',
//         mp4: 'video/mp4',
//         webm: 'video/webm',
//         ogg: 'video/ogg',
//         avi: 'video/x-msvideo',
//         mov: 'video/quicktime',
//         wmv: 'video/x-ms-wmv',
//         flv: 'video/x-flv',
//         mkv: 'video/x-matroska',
//         m4v: 'video/x-m4v',
//         mpeg: 'video/mpeg'
//       };
//     console.log(`The file extension is: ${path.extname(file.originalname).replace('.', '')}`)
//     if (validVideoExtensions[path.extname(file.originalname).replace('.', '').toLowerCase()] === file.mimetype){
//         cb(null, true);
//     } else {
//         cb(new Error('Unsupported file type'), false);
//     }
// }


// configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/home/user/blip/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.round() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
})


// create multer upload middleware
const upload = multer({storage})
module.exports = upload;