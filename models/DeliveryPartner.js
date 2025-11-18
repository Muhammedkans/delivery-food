// backend/models/DeliveryPartner.js
const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // -------------------------
    // Personal Info
    // -------------------------
    name: {
      type: String,
      required: true, // required only for new partners; updates handled safely in controller
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true, // required for new partners
      trim: true,
    },
    vehicle: {
      type: String,
      enum: ["Bike", "Scooter", "Cycle", "Walk"],
      default: "Bike",
    },
    experience: {
      type: Number,
      default: 0, // months
      min: 0,
    },
    emergencyContact: {
      type: String,
      default: "",
      trim: true,
    },
    idProof: {
      type: String,
      default: "",
    },

    // -------------------------
    // Delivery Stats
    // -------------------------
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------
    // System Fields
    // -------------------------
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
deliveryPartnerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);







