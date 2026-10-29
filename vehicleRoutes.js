const express = require("express");
const Vehicle = require("../models/Vehicle");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (["Bike", "Car"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 80);
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, type, brand, location, pricePerDay, imageUrl, description } = req.body;
    if (!name || !["Bike", "Car"].includes(type) || !location ||
        !Number.isFinite(Number(pricePerDay)) || Number(pricePerDay) < 1) {
      return res.status(400).json({ message: "Name, type, location, and a positive daily price are required." });
    }

    const vehicle = await Vehicle.create({
      name, type, brand, location, pricePerDay: Number(pricePerDay), imageUrl, description
    });
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
