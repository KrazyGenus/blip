const app = require('./app');

const PORT = process.env.PORT || 3000; // Use port 3000 for Project IDX

// Make sure server binds to 0.0.0.0 for IDX
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Video upload endpoint available at: http://localhost:${PORT}/api/upload`);
    console.log(`Uploaded videos will be available at: http://localhost:${PORT}/uploads/[filename]`);
  });