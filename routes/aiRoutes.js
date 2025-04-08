// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai'); // Fix: Destructure OpenAI
const auth = require('../middleware/auth');

// Initialize OpenAI with error handling
let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} catch (error) {
    console.error('OpenAI initialization error:', error);
}

router.post('/', auth, async (req, res) => {
    try {
        console.log('Request received:', req.body); // Debug log
        const { message } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not found');
            return res.status(500).json({ message: 'OpenAI API key not configured' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        console.log('Sending request to OpenAI...'); // Debug log

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful campus assistant that helps students navigate university life."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        console.log('OpenAI response:', completion.choices[0].message); // Debug log

        if (!completion.choices || !completion.choices[0]) {
            throw new Error('Invalid response from OpenAI');
        }

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error details:', error); // Detailed error log
        res.status(500).json({ 
            message: 'Failed to get AI response',
            error: error.message 
        });
    }
});

module.exports = router;
