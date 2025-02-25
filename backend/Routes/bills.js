const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ dueDate: 1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get billing statistics
router.get('/stats', async (req, res) => {
  try {
    const totalBills = await Bill.countDocuments();
    
    const paidBills = await Bill.find({ status: 'Paid' });
    const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const pendingBills = await Bill.find({ status: 'Pending' });
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const overdueBills = await Bill.countDocuments({
      status: 'Overdue'
    });

    res.json({
      totalBills,
      paidAmount,
      pendingAmount,
      overdueBills
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific bill
router.get('/:id', getBill, (req, res) => {
  res.json(res.bill);
});

// Create a new bill
router.post('/', async (req, res) => {
  const bill = new Bill({
    patientId: req.body.patientId,
    patientName: req.body.patientName,
    description: req.body.description,
    amount: req.body.amount,
    status: req.body.status,
    dueDate: req.body.dueDate,
    insurance: req.body.insurance,
    paymentMethod: req.body.paymentMethod
  });

  try {
    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a bill
router.put('/:id', getBill, async (req, res) => {
  if (req.body.patientId != null) {
    res.bill.patientId = req.body.patientId;
  }
  if (req.body.patientName != null) {
    res.bill.patientName = req.body.patientName;
  }
  if (req.body.description != null) {
    res.bill.description = req.body.description;
  }
  if (req.body.amount != null) {
    res.bill.amount = req.body.amount;
  }
  if (req.body.status != null) {
    res.bill.status = req.body.status;
    if (req.body.status === 'Paid' && !res.bill.paymentDate) {
      res.bill.paymentDate = new Date();
    }
  }
  if (req.body.dueDate != null) {
    res.bill.dueDate = req.body.dueDate;
  }
  if (req.body.insurance != null) {
    res.bill.insurance = req.body.insurance;
  }
  if (req.body.paymentMethod != null) {
    res.bill.paymentMethod = req.body.paymentMethod;
  }

  try {
    const updatedBill = await res.bill.save();
    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a bill
router.delete('/:id', getBill, async (req, res) => {
  try {
    await res.bill.remove();
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get bill by ID
async function getBill(req, res, next) {
  let bill;
  try {
    bill = await Bill.findById(req.params.id);
    if (bill == null) {
      return res.status(404).json({ message: 'Bill not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.bill = bill;
  next();
}

module.exports = router;
