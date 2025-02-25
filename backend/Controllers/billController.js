const Bill = require('../models/Bill');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    // Filter options
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }
    
    // Sort options
    const sortField = req.query.sortBy || 'dueDate';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const bills = await Bill.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments(filter);

    res.json({
      data: bills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get billing statistics
exports.getBillingStats = async (req, res) => {
  try {
    const totalBills = await Bill.countDocuments();
    
    const paidBills = await Bill.find({ status: 'Paid' });
    const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const pendingBills = await Bill.find({ status: 'Pending' });
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const overdueBills = await Bill.countDocuments({
      status: { $in: ['Pending', 'Overdue'] },
      dueDate: { $lt: new Date() }
    });

    // Get monthly billing totals for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await Bill.aggregate([
      {
        $match: {
          createdDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdDate' },
            month: { $month: '$createdDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      totalBills,
      paidAmount,
      pendingAmount,
      overdueBills,
      monthlyData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const { 
      patientId, 
      patientName, 
      description, 
      amount, 
      status, 
      dueDate,
      insurance,
      paymentMethod 
    } = req.body;

    const bill = new Bill({
      patientId,
      patientName,
      description,
      amount,
      status,
      dueDate,
      insurance,
      paymentMethod
    });

    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a bill
exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const fieldsToUpdate = [
      'patientId',
      'patientName',
      'description',
      'amount',
      'status',
      'dueDate',
      'insurance',
      'paymentMethod'
    ];

    for (const field of fieldsToUpdate) {
      if (req.body[field] !== undefined) {
        bill[field] = req.body[field];
      }
    }

    // Set payment date when bill is marked as paid
    if (req.body.status === 'Paid' && !bill.paymentDate) {
      bill.paymentDate = new Date();
    }

    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    await bill.remove();
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate a PDF invoice for a bill
exports.generateInvoice = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Create a PDF invoice
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill._id}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add hospital logo
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });
    
    // Add title
    doc.font('Helvetica-Bold').fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Add invoice info
    doc.font('Helvetica').fontSize(12)
       .text(`Invoice #: ${bill._id}`, 50)
       .text(`Date: ${new Date().toLocaleDateString()}`, 50)
       .text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 50)
       .moveDown()
       .text('Bill To:', 50)
       .text(`Patient ID: ${bill.patientId}`, { indent: 20 })
       .text(`Name: ${bill.patientName}`, { indent: 20 })
       .moveDown(2);
    
    // Add bill details
    doc.font('Helvetica-Bold')
       .text('Description', 50, doc.y, { width: 250 })
       .text('Amount', 300, doc.y)
       .moveDown(0.5);
    
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(0.5);
    
    doc.font('Helvetica')
       .text(bill.description, 50, doc.y, { width: 250 })
       .text(`$${bill.amount.toFixed(2)}`, 300, doc.y)
       .moveDown(0.5);
    
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown();
    
    // Add total
    doc.font('Helvetica-Bold')
       .text('Total:', 300)
       .text(`$${bill.amount.toFixed(2)}`, 350)
       .moveDown(2);
    
    // Add payment status
    doc.font('Helvetica')
       .text(`Status: ${bill.status}`, 50)
       .moveDown(0.5);
    
    if (bill.paymentMethod) {
      doc.text(`Payment Method: ${bill.paymentMethod}`, 50);
    }
    
    if (bill.insurance) {
      doc.text(`Insurance: ${bill.insurance}`, 50);
    }
    
    doc.moveDown(2);
    
    // Add footer
    doc.font('Helvetica').fontSize(10)
       .text('Thank you for choosing our medical services.', 50, 700, { align: 'center' })
       .text('Please contact our billing department if you have any questions.', 50, 715, { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};