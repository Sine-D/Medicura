const mongoose = require("mongoose");

const medicineItemSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      maxlength: [150, "Medicine name cannot exceed 150 characters"],
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: [150, "Manufacturer name cannot exceed 150 characters"],
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

const inventoryRequestSchema = new mongoose.Schema(
  {
    medicines: {
      type: [medicineItemSchema],
      required: [true, "At least one medicine item is required"],
      validate: {
        validator: function (medicines) {
          return medicines && medicines.length > 0;
        },
        message: "Request must contain at least one medicine item",
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["sent", "approved", "ignored"],
      default: "sent",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Indexes
inventoryRequestSchema.index({
  "medicines.medicineName": "text",
  "medicines.manufacturer": "text",
  message: "text",
});
inventoryRequestSchema.index({ status: 1, isDeleted: 1 });

// Pre-save middleware for integer quantities
inventoryRequestSchema.pre("save", function (next) {
  if (this.isModified("medicines")) {
    this.medicines.forEach((medicine) => {
      medicine.quantity = Math.floor(medicine.quantity);
    });
  }
  next();
});

module.exports = mongoose.model("InventoryRequest", inventoryRequestSchema);
