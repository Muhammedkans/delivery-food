// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      }
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    deliveryLocation: {
      // Customer live location (lat/lng)
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentMode: {
      type: String,
      enum: ["COD", "Online"],
      default: "Online",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Preparing",
        "Ready for Pickup",
        "On the Way",
        "Delivered",
        "Cancelled"
      ],
      default: "Placed",
    },

    timeline: [
      {
        status: String,
        timestamp: Date,
      }
    ],

    socketRoomId: {
      type: String, // Used for live tracking
      required: true,
    },

    deliveryTimeEstimate: {
      type: Number,
      default: 30, // minutes
    }
  },
  { timestamps: true }
);

orderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", orderSchema);

