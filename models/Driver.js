const mongoose = require('mongoose');

// Driver Schema
const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
      maxlength: [50, 'Name must be less than 50 characters'],
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null, // may not have an order assigned yet
    },
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
    },
    // Optional: AI / Analytics fields
    completedOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: Clean API response
driverSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // remove sensitive/internal fields if needed
  return obj;
};

module.exports = mongoose.model('Driver', driverSchema);

