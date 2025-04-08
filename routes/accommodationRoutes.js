const express = require("express");
const router = express.Router();
const Accommodation = require("../models/Accommodation"); // Ensure you have this model

// Route to add an accommodation
router.post("/add", async (req, res) => {
    try {
        const { name, location, price, description } = req.body;
        if (!name || !location || !price || !description) {
            return res.status(400).json({ msg: "Please provide all fields" });
        }

        const newAccommodation = new Accommodation({ name, location, price, description });
        await newAccommodation.save();

        res.status(201).json({ msg: "Accommodation added successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});
// Route to get all accommodations
router.get("/", async (req, res) => {
    try {
        const accommodations = await Accommodation.find();
        res.json(accommodations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;
