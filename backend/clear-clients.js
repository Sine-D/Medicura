require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    
    // Drop the clients collection
    await mongoose.connection.db.collection('clients').drop();
    console.log("Clients collection dropped successfully");
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
