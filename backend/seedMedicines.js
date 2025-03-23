const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Medicine = require("./Models/Medicine");

// Load environment variables
dotenv.config();

// Sample medicine data
const sampleMedicines = [
  {
    name: "Paracetamol",
    unitPrice: 5,
    stock: 100,
    manufacturer: "GSK",
    description: "Pain reliever and fever reducer"
  },
  {
    name: "Ibuprofen",
    unitPrice: 8,
    stock: 80,
    manufacturer: "Advil",
    description: "NSAID for pain and inflammation"
  },
  {
    name: "Amoxicillin",
    unitPrice: 15,
    stock: 50,
    manufacturer: "Pfizer",
    description: "Antibiotic"
  },
  {
    name: "Cetirizine",
    unitPrice: 10,
    stock: 70,
    manufacturer: "Zyrtec",
    description: "Antihistamine for allergies"
  },
  {
    name: "Omeprazole",
    unitPrice: 12,
    stock: 60,
    manufacturer: "Prilosec",
    description: "Proton pump inhibitor for acid reflux"
  }
];

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb+srv://prathamsurati27:LwAZmDepzLJxO1Gd@interndata.mc7mx.mongodb.net/internData",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(async () => {
    console.log("MongoDB connected");
    
    try {
      // Clear existing medicine data
      await Medicine.deleteMany({});
      console.log("Cleared existing medicines");
      
      // Insert sample medicines
      const result = await Medicine.insertMany(sampleMedicines);
      console.log(`Added ${result.length} sample medicines to database`);
      
      console.log("Seeding completed successfully!");
    } catch (error) {
      console.error("Error seeding medicines:", error);
    } finally {
      mongoose.connection.close();
      console.log("Database connection closed");
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
