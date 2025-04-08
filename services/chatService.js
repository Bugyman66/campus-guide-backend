const ChatMessage = require('../models/Chat');

class ChatService {
    static async saveMessage(messageData) {
        try {
            const message = new ChatMessage(messageData);
            await message.save();
            return message;
        } catch (error) {
            console.error('Save message error:', error);
            throw error;
        }
    }

    static async getRecentMessages(limit = 50) {
        try {
            return await ChatMessage.find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    }
}

module.exports = ChatService;