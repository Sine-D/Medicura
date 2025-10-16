import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema(
  {
    id: { type: String, required: true },
    patientId: { type: String, required: true },
    date: { type: Date, required: true },
    items: [
      {
        service: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "paid", "pending", "cancelled"],
      default: "unpaid"
    },
    cashierId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
