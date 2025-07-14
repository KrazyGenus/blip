require('../env-loader');
const { appendFile } = require('fs/promises');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000; // Use port 3000 for Project IDX

const server = http.createServer(app);
const io = new Server(server, { origin: '*' });

io.on('connection', socket => {
  socket.on('join-room', (userId) => {
    socket.join(`user:${userId}`);
  });
});


// Make sure server binds to 0.0.0.0 for IDX
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Video upload endpoint available at: http://localhost:${PORT}/api/upload`);
    console.log(`Uploaded videos will be available at: http://localhost:${PORT}/uploads/[filename]`);
  });

module.exports = { io };