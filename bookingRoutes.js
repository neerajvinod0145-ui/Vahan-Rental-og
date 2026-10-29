const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("vehicle", "name type brand location pricePerDay")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!vehicleId || !startDate || !endDate || Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: "Choose a vehicle and a valid start/end date range." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return res.status(400).json({ message: "Start date cannot be in the past." });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.available) {
      return res.status(404).json({ message: "This vehicle is not available." });
    }

    const conflict = await Booking.findOne({
      vehicle: vehicle._id,
      status: "Confirmed",
      startDate: { $lt: end },
      endDate: { $gt: start }
    });
    if (conflict) return res.status(409).json({ message: "This vehicle is already booked for part of those dates." });

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicle._id,
      startDate: start,
      endDate: end,
      totalPrice: days * vehicle.pricePerDay
    });

    const populated = await booking.populate("vehicle", "name type brand location pricePerDay");
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid vehicle ID." });
    next(error);
  }
});

module.exports = router;
