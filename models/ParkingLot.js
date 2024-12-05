const mongoose = require("mongoose");

const ParkingLotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    day: { type: String, required: true },
    availability: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ParkingLot", ParkingLotSchema);