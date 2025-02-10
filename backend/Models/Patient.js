const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the Patient Schema
const PatientSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    age: { type: Number, required: true, min: 1 },
    dob: { type: Date, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    pin: { type: String, required: true, match: /^\d{6}$/ }, // 6-digit pin validation
  },
  { timestamps: true } // Adds `createdAt` & `updatedAt` automatically
);

// Export the model
module.exports = mongoose.model("Patient", PatientSchema);
