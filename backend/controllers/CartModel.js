const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory", // Reference to your Inventory model
      required: [true, "Inventory item is required"],
      validate: {
        validator: async function (id) {
          const inventory = await mongoose.model("Inventory").findById(id);
          return !!inventory;
        },
        message: "Referenced inventory item does not exist",
      },
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

const cartSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    items: {
      type: [cartItemSchema],
      validate: {
        validator: function (items) {
          const ids = items.map((item) => item.inventoryItem.toString());
          return new Set(ids).size === ids.length;
        },
        message: "Cart cannot contain duplicate inventory items",
      },
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
      get: function (v) {
        return parseFloat(v.toFixed(2));
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

cartSchema.index({ userEmail: 1 });

cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.pre("save", async function (next) {
  if (this.isModified("items")) {
    let calculatedTotal = 0;
    for (const item of this.items) {
      const inventoryItem = await mongoose
        .model("Inventory")
        .findById(item.inventoryItem);
      if (inventoryItem) {
        calculatedTotal += inventoryItem.price * item.quantity;
      }
    }
    this.total = parseFloat(calculatedTotal.toFixed(2));
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
