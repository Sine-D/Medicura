import express from "express";
import PatientForm from "../models/PatientForm.js";

const router = express.Router();

/**
 * ✅ Create new patient form entry
 */
router.post("/", async (req, res) => {
  try {
    console.log("📩 Received patient form data:", req.body); // log data sent from frontend

    // Create and save the document
    const entry = new PatientForm(req.body);
    const saved = await entry.save();

    console.log("✅ Patient form saved successfully:", saved._id);
    res.status(201).json({
      message: "Patient form submitted successfully",
      data: saved,
    });
  } catch (err) {
    console.error("❌ Error saving patient form:", err);
    res.status(400).json({
      message: "Error saving patient form",
      error: err.message,
      stack: err.stack,
    });
  }
});

/**
 * ✅ Get all patient forms
 */
router.get("/", async (req, res) => {
  try {
    const list = await PatientForm.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${list.length} patient records`);
    res.json(list);
  } catch (err) {
    console.error("❌ Error fetching patient forms:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ Delete patient form by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete patient record: ${id}`);

    const deleted = await PatientForm.findByIdAndDelete(id);
    if (!deleted) {
      console.warn(`⚠️ Patient record not found: ${id}`);
      return res.status(404).json({ message: "Patient form not found" });
    }

    console.log("✅ Patient record deleted successfully:", id);
    res.json({ success: true, message: "Patient form deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting patient form:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
