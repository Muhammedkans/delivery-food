// backend/models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String, // Cloudinary URLs
      }
    ],

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // only users who ordered can review
    }
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same order
reviewSchema.index({ customer: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);

