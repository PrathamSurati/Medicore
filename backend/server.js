const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

mongoose.connect("mongodb+srv://prathamsurati27:LwAZmDepzLJxO1Gd@interndata.mc7mx.mongodb.net/?retryWrites=true&w=majority&appName=internData")
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const patientSchema = new mongoose.Schema({
  name: String,
  createdAt: Date,
});

const Patient = mongoose.model('Patient', patientSchema);

app.get('/api/patients', async (req, res) => {
  try {
    console.log('Fetching patients...');
    const patients = await Patient.find({}, 'name createdAt');
    console.log('Patients fetched:', patients);
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a catch-all route to handle unexpected requests
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
