import mongoose from "mongoose";

// Custom validation for email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    inStockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be an integer",
      },
    },
    supplierEmail: {
      type: String,
      required: [true, "Supplier email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validateEmail,
        message: "Please provide a valid supplier email",
      },
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty URLs
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message:
          "Image URL must be a valid HTTPS URL ending with image extension",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      get: function (v) {
        return parseFloat(v.toFixed(2));
      },
    },
    expireDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > new Date(); // Allow null/undefined, otherwise must be future date
        },
        message: "Expiration date must be in the future",
      },
    },
    itemCode: {
      type: String,
      required: [true, "Item code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Item code must be at least 3 characters"],
      maxlength: [20, "Item code cannot exceed 20 characters"],
      match: [
        /^[A-Z0-9-_]+$/,
        "Item code can only contain uppercase letters, numbers, hyphens, and underscores",
      ],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexes
inventorySchema.index({
  itemName: "text",
  description: "text",
  itemCode: "text",
  category: "text",
});
inventorySchema.index({ expireDate: 1 });
inventorySchema.index({ supplierEmail: 1 });
inventorySchema.index({ inStockQuantity: 1, expireDate: 1 });

inventorySchema.virtual("isExpired").get(function () {
  return this.expireDate && this.expireDate < new Date();
});

inventorySchema.pre("save", function (next) {
  if (this.isModified("inStockQuantity")) {
    this.inStockQuantity = Math.floor(this.inStockQuantity);
  }
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
