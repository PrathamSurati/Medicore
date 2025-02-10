const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const AuthRouter = require("./Routes/AuthRouter");
const Patient = require("./Models/Patient"); // Import the model correctly

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Allow frontend URL
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://prathamsurati27:LwAZmDepzLJxO1Gd@interndata.mc7mx.mongodb.net/internData",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api", AuthRouter);
app.use("/prescriptions", require("./Routes/prescriptions"));
// API Route to Fetch Patients
app.get("/api/patients", async (req, res) => {
  try {
    console.log("Fetching patients...");
    const patients = await Patient.find(
      {},
      "name phone gender age dob city address pin createdAt"
    ); // Fetch all required fields
    console.log("✅ Patients fetched:", patients);
    res.json(patients);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
});

// Catch-All Route (404)
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
