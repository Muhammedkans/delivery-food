// backend/models/Dish.js
const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Dish name is required"],
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true, // Example: "Biryani", "Pizza", "Desserts"
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    spiceLevel: {
      type: Number, // 1 to 5
      default: 1,
    },

    image: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 4.2,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    available: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dish", dishSchema);




