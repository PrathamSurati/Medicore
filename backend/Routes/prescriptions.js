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

// Get a single prescription by ID
router.get("/:id", async (req, res) => {
  try {
    console.log(`Fetching prescription with ID: ${req.params.id}`);
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      console.log('Prescription not found in database');
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    console.log('Sending prescription data');
    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
