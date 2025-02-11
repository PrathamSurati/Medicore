const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  vitals: [{
    name: String,
    value: String
  }],
  complaints: [String],
  diagnosis: [String],
  medicines: [{
    name: String,
    dose: String,
    when: String,
    frequency: String,
    duration: String,
    Qty: String,
    Note: String
  }],
  nextVisit: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
