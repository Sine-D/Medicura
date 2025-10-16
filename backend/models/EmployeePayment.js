import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const EmployeePaymentSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    role: {
      type: String,
      enum: ["Doctor", "Nurse", "Attendant", "Receptionist"],
      required: true,
    },
    baseSalary: { type: Number, required: true },
    attendanceDays: { type: Number, required: true },
    totalSalary: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmployeePayment", EmployeePaymentSchema);