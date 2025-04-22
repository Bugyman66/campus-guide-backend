const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { emitWarning } = require('process');
require('dotenv').config();

const router = express.Router();

const allowedOrigins = [
    'http://localhost:3000',
    'https://campus-guide-gamma.vercel.app',
    'https://campus-guide-ir29ynidv-bugyman66s-projects.vercel.app'
];

// Ensure JWT Secret Key is loaded
if (!process.env.JWT_SECRET) {
    console.error("⚠️ JWT_SECRET is not defined in .env file");
    process.exit(1); // Stop server if missing
}

// ✅ Register User
router.post('/register', async (req, res) => {
    try {
        const origin = req.get('origin');
        if (allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
        } else {
            return res.status(403).json({ message: 'Origin not allowed' });
        }

        const { name, email, regNo, faculty, department, password } = req.body;

        // Validate input
        if (!name || !email || !regNo || !faculty || !department || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { regNo }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or registration number already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            regNo,
            faculty,
            department,
            password: hashedPassword
        });

        await newUser.save();

        // Create JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                faculty: newUser.faculty,
                department: newUser.department
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Email or registration number already exists' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const origin = req.get('origin');
        if (allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
        } else {
            return res.status(403).json({ message: 'Origin not allowed' });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

module.exports = router;
