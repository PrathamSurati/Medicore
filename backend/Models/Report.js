const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Define the structure of the report data
  // For example:
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  // Add other fields as needed
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 