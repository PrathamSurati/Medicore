const express = require("express");
const router = express.Router();
const Bill = require("../Models/Bill");
const Medicine = require("../Models/Medicine");

// Generate a new bill
router.post("/generate", async (req, res) => {
  try {
    console.log("Received bill generation request:", req.body);
    const { patientId, patientName, medicines, date, consultationFee, reportId } = req.body;
    
    // Validate required fields
    if (!patientId || !patientName || !medicines || !reportId) {
      console.error("Missing required fields for bill generation");
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Array to store bill items
    const billItems = [];
    let totalAmount = consultationFee || 0;
    
    console.log(`Processing ${medicines.length} medicines`);
    
    // Process each medicine
    for (const medicine of medicines) {
      console.log("Processing medicine:", medicine.name);
      
      // Check if medicine exists in database
      let medicineData = null;
      try {
        medicineData = await Medicine.findOne({ name: medicine.name });
      } catch (err) {
        console.error("Error finding medicine:", err);
      }
      
      // Set default price if medicine not found
      const unitPrice = medicineData ? medicineData.unitPrice : 10;
      const quantity = medicine.Qty ? parseInt(medicine.Qty) : 1;
      const itemTotal = unitPrice * quantity;
      
      console.log(`Medicine: ${medicine.name}, Unit Price: ${unitPrice}, Quantity: ${quantity}, Total: ${itemTotal}`);
      
      billItems.push({
        name: medicine.name,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: itemTotal
      });
      
      totalAmount += itemTotal;
    }
    
    console.log(`Total bill amount: ${totalAmount} with consultation fee: ${consultationFee || 0}`);
    
    // Create new bill
    const newBill = new Bill({
      patientId,
      patientName,
      reportId,
      date: date || new Date(),
      items: billItems,
      consultationFee: consultationFee || 0,
      totalAmount,
      status: 'pending'
    });
    
    const savedBill = await newBill.save();
    console.log("Bill saved successfully with ID:", savedBill._id);
    
    res.status(201).json(savedBill);
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ message: "Error generating bill", error: error.message });
  }
});

// Get all bills
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bills", error: error.message });
  }
});

// Get bills for a specific patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const bills = await Bill.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient bills", error: error.message });
  }
});

// Update bill status (e.g., mark as paid)
router.patch("/:id", async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ message: "Error updating bill", error: error.message });
  }
});

module.exports = router;
