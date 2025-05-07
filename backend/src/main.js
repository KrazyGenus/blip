const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 for Project IDX

// Configure CORS for Project IDX
app.use(cors());


app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/home/user/blip/uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Define file filter to only accept video files
const fileFilter = (req, file, cb) => {
  // Accept only video files
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// Set up multer with the storage configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB file size limit
  }
});

// Routes
// Notice the route is /api/upload to match what we're using in the frontend
app.post('/api/upload', upload.array('video', 5), (req, res) => {
  try {
    console.log('File upload request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file);
    
    // Return success response with file information
    res.status(200).json({ 
      success: true, 
      message: 'Video uploaded successfully', 
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get list of all uploaded videos
app.get('/api/videos', (req, res) => {
  try {
    const uploadDir = 'uploads';
    
    // Check if directory exists
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ videos: [] });
    }
    
    // Read all files from the uploads directory
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('Error reading upload directory:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      // Filter to ensure we only get video files
      const videoFiles = files.filter(file => {
        const extension = path.extname(file).toLowerCase();
        return ['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(extension);
      });
      
      // Format response
      const videos = videoFiles.map(filename => ({
        filename,
        url: `/uploads/${filename}`
      }));
      
      res.status(200).json({ videos });
    });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size is too large. Maximum size is 100MB.' 
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // Unknown error
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
  next();
});

// Make sure server binds to 0.0.0.0 for IDX
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Video upload endpoint available at: http://localhost:${PORT}/api/upload`);
  console.log(`Uploaded videos will be available at: http://localhost:${PORT}/uploads/[filename]`);
});