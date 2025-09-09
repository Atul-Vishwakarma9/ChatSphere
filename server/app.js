const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Import routers
const authRouter = require('./controllers/authController');
const userRouter = require('./controllers/userController');
const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://chatsphere-client-pl8u.onrender.com', // ✅ Add this line
    'https://chatsphere-client-kops.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIO(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://chatsphere-client-kops.onrender.com'  // Add your frontend URL
    ],
    methods: ['GET', 'POST'],
  },
});

// Track online users
let onlineUsers = [];

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
  });

  socket.on('send-message', (message) => {
    message.members.forEach((memberId) => {
      io.to(memberId).emit('receive-message', message);
      io.to(memberId).emit('set-message-count', message);
    });
  });

  socket.on('clear-unread-messages', (data) => {
    data.members.forEach((memberId) => {
      io.to(memberId).emit('message-count-cleared', data);
    });
  });

  socket.on('user-typing', (data) => {
    data.members.forEach((memberId) => {
      io.to(memberId).emit('started-typing', data);
    });
  });

  socket.on('user-login', (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    socket.emit('online-users', onlineUsers);
  });

  socket.on('user-offline', (userId) => {
    onlineUsers = onlineUsers.filter((id) => id !== userId);
    io.emit('online-users-updated', onlineUsers);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = server;
