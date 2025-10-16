const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "PENDING", "INACTIVE"], default: "ACTIVE" },
    clientType: {
      type: String,
      enum: [
        "Independent Pharmacy",
        "Pharmacy Chain",
        "Hospital",
        "Medical Center",
      ],
      default: "Independent Pharmacy",
    },
    address: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    totalOrders: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    rating: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ClientSchema.index({ email: 1 });
ClientSchema.index({ name: 1 });

module.exports = mongoose.model("Client", ClientSchema);


