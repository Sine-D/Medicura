import mongoose from "mongoose";

const patientFormSchema = new mongoose.Schema({
  firstName:     { type: String, required: true },
  lastName:      { type: String, required: true },
  email:         { type: String, required: true },
  phoneNumber:   { type: String, required: true },
  dateOfBirth:   { type: Date,   required: true },
  gender:        { type: String, required: true },
  preferredDate: { type: Date,   required: true },
  preferredTime: { type: String, required: true },
  customTime:    { type: String },
  testType:      { type: String, required: true },
  urgencyLevel:  { type: String, enum: ["Normal","High","Urgent"], default: "Normal" },
  referringDoctor:{ type: String },
  insuranceProvider:{ type: String },
  specialRequirements:{ type: String },
  contactPreference: [{ type: String }]
}, {
  collection: "patient-form",
  timestamps: true
});

const PatientForm = mongoose.model("PatientForm", patientFormSchema);
export default PatientForm;
