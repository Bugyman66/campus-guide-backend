const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);

        // Simple response system for testing
        let response;
        const lowerMessage = message.toLowerCase();

        // Basic response mapping
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = "Hello! How can I assist you today?";
        } else if (lowerMessage.includes('help')) {
            response = "I'm here to help! What would you like to know about?";
        } else if (lowerMessage.includes('campus')) {
            response = "I can help you with information about campus facilities, locations, and services.";
        } else {
            response = "I understand your question. Let me help you with that...";
        }

        console.log('Sending response:', response);
        
        // Send response in the correct format
        res.json({
            success: true,
            reply: response
        });

    } catch (error) {
        console.error('Assistant Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate response'
        });
    }
});

module.exports = router;