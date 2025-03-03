const express = require('express');
const router = express.Router();
const Patient = require('../Models/Patient'); // Note the capital M in Models to match your folder structure
const Prescription = require('../Models/Prescription'); // Make sure this is imported

// Get single patient
router.get('/patients/:id', async (req, res) => {
  console.log(`GET request for patient with ID: ${req.params.id}`);
  try {
    const patient = await Patient.findById(req.params.id);
    console.log('Found patient:', patient ? 'Yes' : 'No');
    if (!patient) {
      console.log('Patient not found in database');
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.log('Sending patient data');
    res.json(patient);
  } catch (error) {
    console.error('Error in GET /patients/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get patient's prescriptions
router.get('/patients/:id/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Patient routes are working' });
});

module.exports = router; 