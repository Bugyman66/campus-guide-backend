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
        } else if (lowerMessage.includes('how are you')) {
            response = "I'm doing well, thank you! How can I help you?";
        } else {
            response = `I received your message: "${message}". How can I help you?`;
        }

        // Log the response and send it
        console.log('Sending response:', response);
        
        // Make sure we're sending the response in the correct format
        res.json({
            success: true,
            reply: response
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;