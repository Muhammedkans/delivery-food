// backend/models/Restaurant.js
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    // -------------------------------------------------------------
    // Owner (Restaurant Owner → USER MODEL)
    // -------------------------------------------------------------
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // -------------------------------------------------------------
    // Basic Details
    // -------------------------------------------------------------
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    cuisineType: {
      type: String,
      required: [true, "Cuisine type is required"],
      trim: true,
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
      required: [true, "Address is required"],
    },

    // -------------------------------------------------------------
    // Map / GEO Location
    // -------------------------------------------------------------
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // -------------------------------------------------------------
    // Ratings & Reviews
    // -------------------------------------------------------------
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // -------------------------------------------------------------
    // Delivery Time Estimate
    // -------------------------------------------------------------
    estimatedDeliveryTime: {
      type: Number,
      default: 30,
    },

    // -------------------------------------------------------------
    // Restaurant Status
    // -------------------------------------------------------------
    isOpen: {
      type: Boolean,
      default: true,
    },

    // Optional future upgrade (for auto-open/close)
    timings: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },

    // -------------------------------------------------------------
    // Tags / Badges
    // -------------------------------------------------------------
    tags: {
      type: [String],
      default: ["Fast Delivery"],
    },

    // -------------------------------------------------------------
    // Admin Approval (IMPORTANT)
    // -------------------------------------------------------------
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// GeoJSON index for fast delivery partner + restaurant distance queries
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);



