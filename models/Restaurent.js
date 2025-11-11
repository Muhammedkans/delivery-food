// backend/models/Restaurant.js
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    cuisineType: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      // for map & delivery tracking
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true, // [longitude, latitude]
      },
    },

    averageRating: {
      type: Number,
      default: 4.5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    estimatedDeliveryTime: {
      type: Number,
      default: 30, // minutes
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: ["Fast Delivery"],
    }
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);


