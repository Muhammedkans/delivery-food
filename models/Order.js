const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: [true, 'Menu item ID is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'on the way', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // driver may be assigned later
    },
    // Optional: AI/analytics fields
    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: Clean API response
orderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // remove internal fields if needed
  return obj;
};

module.exports = mongoose.model('Order', orderSchema);




