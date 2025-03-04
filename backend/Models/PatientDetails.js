const mongoose = require("mongoose");

const PatientDetailsSchema = new mongoose.Schema({
  vitals: Array,
  complaints: Array,
  diagnosis: Array,
  medicines: Array,
  nextVisit: String,
  title: String,
  patientId: String,
  patientName: String,
  date: Date,
});

module.exports = mongoose.model("PatientDetails", PatientDetailsSchema);
