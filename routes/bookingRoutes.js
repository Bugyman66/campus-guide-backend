const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Accommodation = require("../models/Accommodation");
const authMiddleware = require("../middleware/auth");
const axios = require("axios");
require("dotenv").config();
const config = require("../config/env");

// Book an accommodation (Step 1: Save booking)
router.post("/book", authMiddleware, async (req, res) => {
    try {
        const { accommodationId } = req.body;

        // Check if the accommodation exists
        const accommodation = await Accommodation.findById(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ msg: "Accommodation not found" });
        }

        const booking = new Booking({
            student: req.user.id,
            accommodation: accommodationId,
            status: "Pending",
        });

        await booking.save();
        res.status(201).json({ msg: "Booking request submitted", booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Get a student's bookings
router.get("/my-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user.id }).populate("accommodation");
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Initiate Payment (Step 2: Redirect to Paystack)
router.post("/pay", authMiddleware, async (req, res) => {
    try {
        const { accommodationId, userEmail } = req.body;

        if (!userEmail) {
            return res.status(400).json({ msg: "User email is required" });
        }

        // Get callback URL based on environment
        const callback_url = process.env.NODE_ENV === 'production'
            ? 'https://campus-guide-gamma.vercel.app/payment-success'
            : 'http://localhost:3000/payment-success';

        const amount = 50000 * 100; // 50,000 NGN in Kobo

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: userEmail,
                amount: amount,
                callback_url,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const { authorization_url, reference } = response.data.data;

        // Save booking with reference
        const booking = new Booking({
            student: req.user.id,
            accommodation: accommodationId,
            reference,
            status: "Pending",
        });

        await booking.save();

        res.json({ authorization_url, reference });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Payment initiation failed" });
    }
});

// Verify Payment (Step 3: After Paystack callback)
router.get("/verify/:reference", async (req, res) => {
    const { reference } = req.params;

    if (!reference) {
        return res.status(400).json({ success: false, msg: "Reference is required" });
    }

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const paymentData = response.data;

        if (paymentData.data.status === "success") {
            const updatedBooking = await Booking.findOneAndUpdate(
                { reference },
                { status: "Paid" },
                { new: true }
            );

            return res.json({ msg: "Payment successful", booking: updatedBooking });
        } else {
            return res.status(400).json({ msg: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
