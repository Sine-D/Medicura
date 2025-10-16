const mongoose = require("mongoose");

const medicineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      maxlength: [150, "Medicine name cannot exceed 150 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      get: (v) => parseFloat(v.toFixed(2)),
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
  },
  { _id: false }
);

const inventoryInvoiceSchema = new mongoose.Schema(
  {
    items: {
      type: [medicineItemSchema],
      required: [true, "Invoice must contain at least one medicine item"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Invoice must contain at least one medicine item",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Optional: virtual for total price
inventoryInvoiceSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

module.exports = mongoose.model("InventoryInvoice", inventoryInvoiceSchema);
