const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid format' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Token is invalid', error: error.message });
    }
};

module.exports = auth;
