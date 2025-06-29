const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();

// Import configurations
const db = require('./config/database');
const logger = require('./utils/logger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const complaintRoutes = require('./routes/complaints');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');
const resourceRoutes = require('./routes/resources');

// Import utilities
const { cleanupExpiredData } = require('./utils/cleanup');

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time chat
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(limiter);

// Custom middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/resources', resourceRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join complaint room for real-time chat
  socket.on('join-complaint', (data) => {
    const { token } = data;
    if (token) {
      socket.join(`complaint-${token}`);
      logger.info(`User joined complaint room: ${token}`);
    }
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    try {
      const { token, message, senderType, senderId } = data;
      
      // Validate message data
      if (!token || !message || !senderType) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Broadcast message to complaint room
      io.to(`complaint-${token}`).emit('new-message', {
        message,
        senderType,
        senderId,
        timestamp: new Date().toISOString(),
        messageId: require('crypto').randomUUID()
      });
      
      logger.info(`Message sent in complaint: ${token}`);
    } catch (error) {
      logger.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle file sharing in chat
  socket.on('share-file', async (data) => {
    try {
      const { token, fileData, fileName, senderType, senderId } = data;
      
      // Validate file data
      if (!token || !fileData || !fileName || !senderType) {
        socket.emit('error', { message: 'Invalid file data' });
        return;
      }

      // Broadcast file to complaint room
      io.to(`complaint-${token}`).emit('new-file', {
        fileData,
        fileName,
        senderType,
        senderId,
        timestamp: new Date().toISOString(),
        fileId: require('crypto').randomUUID()
      });
      
      logger.info(`File shared in complaint: ${token}`);
    } catch (error) {
      logger.error('Error handling file share:', error);
      socket.emit('error', { message: 'Failed to share file' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { token, senderType, isTyping } = data;
    if (token) {
      socket.to(`complaint-${token}`).emit('user-typing', {
        senderType,
        isTyping
      });
    }
  });

  // Handle read receipts
  socket.on('mark-read', (data) => {
    const { token, messageId } = data;
    if (token && messageId) {
      io.to(`complaint-${token}`).emit('message-read', {
        messageId,
        readAt: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Scheduled cleanup tasks
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Starting scheduled cleanup...');
    await cleanupExpiredData();
    logger.info('Scheduled cleanup completed');
  } catch (error) {
    logger.error('Scheduled cleanup failed:', error);
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await db.raw('SELECT NOW()');
    logger.info('✅ Database connected successfully');

    server.listen(PORT, () => {
      logger.info(`🚀 CiviSafe Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API Base: http://localhost:${PORT}/api`);
      logger.info(`🔗 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

startServer();

module.exports = { app, server, io }; 