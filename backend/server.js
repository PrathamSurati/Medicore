const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const AuthRouter = require("./Routes/AuthRouter");
const Patient = require("./Models/Patient");
const billRoutes = require("./routes/bills");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb+srv://prathamsurati27:LwAZmDepzLJxO1Gd@interndata.mc7mx.mongodb.net/internData",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", AuthRouter);
app.use("/prescriptions", require("./Routes/prescriptions"));
app.use("/api/bills", billRoutes);

// API Route to Fetch All Patients
app.get("/api/patients", async (req, res) => {
  try {
    console.log("Fetching patients...");
    const patients = await Patient.find(
      {},
      "name phone gender age dob city address pin createdAt"
    );
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
});

// API Route to Fetch Single Patient by ID
app.get("/api/patients/:id", async (req, res) => {
  console.log(`Fetching patient with ID: ${req.params.id}`);
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
    console.error('Error fetching patient by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new API endpoint for fetching prescription titles
app.get("/api/prescriptions", async (req, res) => {
  try {
    console.log("Fetching prescription titles...");
    const Prescription = mongoose.models.Prescription || require("./models/Prescription");
    const prescriptions = await Prescription.find({}, "title");
    console.log("Prescription titles fetched:", prescriptions);
    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescription titles:", err);
    res.status(500).json({ error: err.message });
  }
});

// API Route to Save Patient Details
app.post("/api/patients/:id/details", async (req, res) => {
  try {
    const patientId = req.params.id;
    const patientDetails = req.body;

    // Assuming you have a PatientDetails model
    const PatientDetails = require("./Models/PatientDetails");

    const newPatientDetails = new PatientDetails({
      ...patientDetails,
      patientId,
    });

    await newPatientDetails.save();
    res.status(201).json(newPatientDetails);
  } catch (error) {
    console.error("Error saving patient details:", error);
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Catch-All Route (404)
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
