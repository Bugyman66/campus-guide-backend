const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://vces:Saeedabba3040@cluster0.7wa58.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
