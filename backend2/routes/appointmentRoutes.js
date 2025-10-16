import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ✅ Create new appointment
router.post("/", async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get only scheduled appointments
router.get("/scheduled", async (req, res) => {
  try {
    const scheduledAppointments = await Appointment.find({ status: "Scheduled" }).sort({ createdAt: -1 });
    res.json(scheduledAppointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get only completed appointments
router.get("/completed", async (req, res) => {
  try {
    const completedAppointments = await Appointment.find({ status: "Completed" }).sort({ createdAt: -1 });
    res.json(completedAppointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update appointment
router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
