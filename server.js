require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes');
const assistantRoutes = require('./routes/assistant');
const http = require('http');
const { Server } = require('socket.io');
const ChatService = require('./services/chatService');

// Create server and socket instance
const app = express();
const server = http.createServer(app);

// Middleware with specific CORS options
const allowedOrigins = [
    'http://localhost:3000',
    'https://campus-guide-gamma.vercel.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS not allowed'));
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests
app.options('*', cors());

// Socket.IO configuration with essential options
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// ✅ Connect to MongoDB
connectDB();

app.use(express.json());

// Track active users
const activeUsers = new Map();

io.on('connection', async (socket) => {
    console.log('🔌 New connection:', socket.id);

    socket.on('join_chat', async (userData) => {
        try {
            // Add user to active users
            activeUsers.set(socket.id, userData);
            socket.join('campus_chat');

            // Send recent messages to new user
            const recentMessages = await ChatService.getRecentMessages();
            socket.emit('load_messages', recentMessages);

            // Notify others
            io.to('campus_chat').emit('active_users', Array.from(activeUsers.values()));
            console.log(`✅ User connected: ${userData.name}`);
        } catch (error) {
            console.error('Join chat error:', error);
        }
    });

    socket.on('send_message', async (messageData) => {
        try {
            // Save message to MongoDB
            const savedMessage = await ChatService.saveMessage({
                sender: messageData.senderId,
                senderName: messageData.sender,
                text: messageData.text
            });

            // Broadcast to all users
            io.to('campus_chat').emit('receive_message', {
                ...messageData,
                _id: savedMessage._id,
                timestamp: savedMessage.timestamp
            });
        } catch (error) {
            console.error('Message error:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        const userData = activeUsers.get(socket.id);
        if (userData) {
            activeUsers.delete(socket.id);
            io.to('campus_chat').emit('active_users', Array.from(activeUsers.values()));
            console.log(`👋 User disconnected: ${userData.name}`);
        }
    });
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accommodations', require('./routes/accommodationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/assistant', assistantRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
