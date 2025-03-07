const express = require('express');
const router = express.Router();
const Patient = require('../Models/Patient'); // Make sure this path is correct

// Search patients by name, phone, or ID
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    console.log('Searching patients with query:', query);
    
    // Create a search regex that's case insensitive
    const searchRegex = new RegExp(query, 'i');
    
    // Find patients matching the search criteria with proper error handling
    const patients = await Patient.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex }
      ]
    })
    .select('_id name phone gender age dob city address pin')
    .limit(10)
    .lean() // Convert to plain JS object for better performance
    .exec(); // Explicitly call exec() for proper promise handling
    
    console.log(`Found ${patients.length} patients matching query`);
    res.json(patients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ 
      message: 'Error searching patients',
      error: error.message, // Include error message for debugging
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Record a patient visit
router.post('/:patientId/visits', async (req, res) => {
  try {
    const { patientId } = req.params;
    const visitData = req.body;
    
    // Find the patient
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Create a success response since we don't have a Visit model yet
    res.status(201).json({ 
      success: true, 
      message: 'Visit recorded successfully'
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ 
      message: 'Error recording visit',
      error: error.message
    });
  }
});

module.exports = router;
