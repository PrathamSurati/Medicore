const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const AuthRouter = require("./Routes/AuthRouter");
const Patient = require("./Models/Patient"); // Import the model correctly
const billRoutes = require("./routes/bills");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Allow frontend URL
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

app.use("/api", AuthRouter);
app.use("/prescriptions", require("./Routes/prescriptions"));
app.use("/api/bills", billRoutes);

// Add new API endpoint for fetching prescription titles
app.get("/api/prescriptions", async (req, res) => {
  try {
    console.log("Fetching prescription titles...");
    const prescriptions = await require("./Models/Prescription").find({}, "title");
    console.log("Prescription titles fetched:", prescriptions);
    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescription titles:", err);
    res.status(500).json({ error: err.message });
  }
});

// API Route to Fetch Patients
app.get("/api/patients", async (req, res) => {
  try {
    console.log("Fetching patients...");
    const patients = await Patient.find(
      {},
      "name phone gender age dob city address pin createdAt"
    ); // Fetch all required fields
    // console.log("Patients fetched:", patients);
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: err.message });
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
