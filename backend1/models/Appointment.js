import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  testType: { type: String, required: true },
  labLocation: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  customTime: { type: String },
  notes: { type: String },
  insuranceProvider: { type: String },
  insuranceId: { type: String },
  physician: { type: String },
  terms: { type: Boolean, required: true },
  referenceNumber: { type: String, required: true },
  status: { type: String, enum: ["Scheduled", "Completed"], default: "Scheduled" }
}, { timestamps: true });

// 🔹 Save to collection "lab-appointments"
const Appointment = mongoose.model("Appointment", appointmentSchema, "lab-appointments");

export default Appointment;
