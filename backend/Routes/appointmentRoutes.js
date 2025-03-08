const express = require('express');
const router = express.Router();
const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ startTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  try {
    console.log('Creating appointment with data:', req.body);
    
    // Ensure we have a patient ID
    if (!req.body.patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    // Get patient name if not provided
    let patientName = req.body.patientName;
    if (!patientName) {
      try {
        const patient = await Patient.findById(req.body.patientId);
        if (patient) {
          patientName = patient.name;
        }
      } catch (err) {
        console.warn('Could not fetch patient name:', err);
      }
    }
    
    // Create the appointment
    const appointment = new Appointment({
      ...req.body,
      patientName
    });
    
    const savedAppointment = await appointment.save();
    console.log('Appointment created successfully:', savedAppointment);
    res.status(201).json(savedAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      appointment[key] = req.body[key];
    });
    
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(400).json({ message: err.message });
  }
});

// Add PATCH endpoint to update appointment
router.patch('/:id', async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.remove();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .sort({ startTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
