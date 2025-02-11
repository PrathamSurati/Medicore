const express = require("express");
const Prescription = require("../Models/Prescription"); // Ensure the correct path
const router = express.Router();

// Fetch prescriptions with only title and createdAt
router.get("/", async (req, res) => {
  try {
    console.log("Fetching prescriptions...");
    const prescriptions = await Prescription.find({}, "title createdAt"); // Fetch only title and createdAt
    console.log("✅ Prescriptions fetched:", prescriptions);
    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST route to save prescription
router.post('/', async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    await newPrescription.save();
    res.status(201).json({ 
      message: 'Prescription saved successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
