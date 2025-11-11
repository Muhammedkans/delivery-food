// backend/models/DeliveryPartner.js
const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentLocation: {
      // Delivery partner real-time GPS location
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    vehicleNumber: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 4.7,
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

