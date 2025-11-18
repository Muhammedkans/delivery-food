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

    // Delivery partner reference
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
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
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    address: {
      type: String,
      required: true,
    },

    // Customer delivery location
    deliveryLocation: {
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

    // 🚀 Main order status system
    status: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Preparing",
        "Ready for Pickup",
        "On the Way",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    // Timeline (history)
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Socket room id
    socketRoomId: {
      type: String,
      required: true,
    },

    // Delivery time (estimate minutes)
    deliveryTimeEstimate: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: true }
);

// Geo index
orderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", orderSchema);




