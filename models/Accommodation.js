const mongoose = require("mongoose");

const AccommodationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String }
});

module.exports = mongoose.model("Accommodation", AccommodationSchema);
