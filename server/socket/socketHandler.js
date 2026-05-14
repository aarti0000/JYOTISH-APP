const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Consultation = require('../models/Consultation');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // Join personal room for notifications
    socket.join(`user_${socket.userId}`);

    // ── Join consultation room ─────────────────────────────────
    socket.on('join_consultation', ({ consultationId }) => {
      socket.join(`consultation_${consultationId}`);
      socket.to(`consultation_${consultationId}`).emit('user_joined', { userId: socket.userId });
    });

    // ── Chat message ───────────────────────────────────────────
    socket.on('send_message', async ({ consultationId, content, type = 'text', fileUrl }) => {
      try {
        const message = { sender: socket.userId, content, type, fileUrl, createdAt: new Date() };

        // Save to DB
        await Consultation.findByIdAndUpdate(consultationId, { $push: { messages: message } });

        // Broadcast to room
        io.to(`consultation_${consultationId}`).emit('receive_message', { ...message, consultationId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── WebRTC Signalling ──────────────────────────────────────
    socket.on('webrtc_offer', ({ consultationId, offer }) => {
      socket.to(`consultation_${consultationId}`).emit('webrtc_offer', { offer, from: socket.userId });
    });

    socket.on('webrtc_answer', ({ consultationId, answer }) => {
      socket.to(`consultation_${consultationId}`).emit('webrtc_answer', { answer, from: socket.userId });
    });

    socket.on('webrtc_ice_candidate', ({ consultationId, candidate }) => {
      socket.to(`consultation_${consultationId}`).emit('webrtc_ice_candidate', { candidate, from: socket.userId });
    });

    socket.on('call_ended', ({ consultationId }) => {
      io.to(`consultation_${consultationId}`).emit('call_ended');
    });

    // ── Astrologer online status ───────────────────────────────
    socket.on('set_online', () => {
      socket.broadcast.emit('astrologer_online', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`);
      socket.broadcast.emit('astrologer_offline', { userId: socket.userId });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
