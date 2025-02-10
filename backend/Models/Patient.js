const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the Patient Schema
const PatientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    dob: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
      match: /^\d{6}$/, // Validates a 6-digit pin code
    },
    // Reference to the User model (e.g., referring to a doctor who treats the patient)
    //   doctor: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users', // Reference to the User model
    //     required: false, // Optional: If every patient is not associated with a specific doctor
    //   },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt` fields
  }
);

// Create the Patient model
const PatientModel = mongoose.model("patients", PatientSchema);

module.exports = PatientModel;
