const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ["Bike", "Car"], required: true },
  brand: { type: String, trim: true, default: "" },
  location: { type: String, required: true, trim: true },
  pricePerDay: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
