import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, default: "General", trim: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, default: "" },
  addedBy: { type: String, default: null },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online', 'other'], default: 'cash' },
  receiptNumber: { type: String, default: '' },
  attachments: [{ type: String }],
  tags: [{ type: String }],
  
  // Payment tracking fields
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'pending', 'paid', 'failed'], 
    default: 'unpaid' 
  },
  paymentOrderId: { type: String, default: null },
  paymentId: { type: String, default: null },
  paymentDate: { type: Date, default: null },
  paymentAmount: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model('Expense', ExpenseSchema);