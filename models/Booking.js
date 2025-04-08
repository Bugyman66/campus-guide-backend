const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    accommodation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accommodation",
        required: true
    },
    reference: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
