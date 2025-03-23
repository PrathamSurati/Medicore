const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  manufacturer: {
    type: String
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model("Medicine", MedicineSchema);
