import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, default: '' },
    speciality: { type: String, default: '' },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked' },
    notes: { type: String, default: '' },
    fees: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;


