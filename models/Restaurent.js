const mongoose = require('mongoose');

// Restaurant Schema
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    menu: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    offers: [
      {
        type: String,
        trim: true,
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    // Optional: AI-related fields
    cuisine: {
      type: String,
      trim: true,
      default: 'General',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Hide internal fields in API responses
restaurantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // You can delete any internal fields if needed
  return obj;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);



