require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes');
const assistantRoutes = require('./routes/assistant');
const http = require('http');
const { Server } = require('socket.io');
const ChatService = require('./services/chatService');
const corsMiddleware = require('./middleware/cors');

// Create server and socket instance
const app = express();
const server = http.createServer(app);

// Apply CORS middleware
app.use(corsMiddleware);

// Enable pre-flight requests for all routes
app.options('*', corsMiddleware);

// Socket.IO configuration with CORS
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (origin.match(/\.vercel\.app$/) || 
                origin.match(/\.render\.com$/) || 
                origin === 'http://localhost:3000') {
                callback(null, true);
            } else {
                console.log('Blocked socket origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/auth', require('./routes/authroutes'));
app.use('/api/accommodations', require('./routes/accommodationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/assistant', assistantRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Global error handler with improved CORS error handling
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Handle CORS errors specifically
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed',
            origin: req.headers.origin
        });
    }

    // Handle other errors
    res.status(500).json({
        error: 'Server Error',
        message: err.message,
        origin: req.headers.origin
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
