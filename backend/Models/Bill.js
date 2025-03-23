const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    trim: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  reportId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }
  ],
  consultationFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Bill', BillSchema);
