const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: [String], // Array of image URLs
    features: [String], // Array of features/amenities
    roomType: String,
    availability: Boolean,
});

module.exports = mongoose.model('Accommodation', accommodationSchema);
