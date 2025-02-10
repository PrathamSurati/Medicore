const express = require('express');
const router = express.Router();
const Prescription = require('../Models/Prescription');

// POST route to save prescription data
router.post('/', async (req, res) => {
    try {
        const prescriptionData = req.body;
        const newPrescription = new Prescription(prescriptionData);
        await newPrescription.save();
        res.status(201).json({ message: 'Prescription saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving prescription', error });
    }
});

// GET route to fetch saved prescriptions
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find();
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescriptions', error });
    }
});

module.exports = router;
