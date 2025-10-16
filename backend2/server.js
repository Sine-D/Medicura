import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import patientRoutes from "./routes/patientRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();

const app = express();

// ===============================
// 🌐 Middleware
// ===============================
// Configure CORS to accept requests from local dev frontends (Vite default ports)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json());

// ===============================
// 🧭 Routes
// ===============================
app.use("/api/patient-forms", patientRoutes);
app.use("/api", emailRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Medicura2 backend is running and connected to MongoDB Atlas 🚀");
});

// ===============================
// ⚙️ MongoDB Connection
// ===============================
mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB Atlas:", err.message);
    process.exit(1); // stop server if DB connection fails
  });

// ===============================
// 🛠️ MongoDB Connection Events
// ===============================
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});
