const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // This already creates an index automatically
    },
    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ❌ Remove this duplicate index line
// cartSchema.index({ user: 1 });

module.exports = mongoose.model("Cart", cartSchema);
