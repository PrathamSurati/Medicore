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
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  insurance: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date
  }
});

// Method to check if a bill is overdue
BillSchema.methods.isOverdue = function() {
  return this.status !== 'Paid' && new Date() > this.dueDate;
};

// Pre-save hook to update status to 'Overdue' if past due date
BillSchema.pre('save', function(next) {
  if (this.status !== 'Paid' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Bill', BillSchema);
