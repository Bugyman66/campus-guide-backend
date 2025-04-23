const cors = require('cors');

const allowedOrigins = [
    'http://localhost:3000',
    'https://campus-guide-gamma.vercel.app',
    'https://campus-guide-ir29ynidv-bugyman66s-projects.vercel.app',
    'https://campus-guide.vercel.app',
    'https://campus-guide-frontend.onrender.com',
    'https://campus-guide-9j7f2jv68-bugyman66s-projects.vercel.app',
    'https://campus-guide.onrender.com'
];

const corsMiddleware = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is allowed or matches render.com domain
        if (allowedOrigins.includes(origin) || 
            origin.match(/\.render\.com$/) || 
            origin.match(/\.vercel\.app$/)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

module.exports = corsMiddleware;