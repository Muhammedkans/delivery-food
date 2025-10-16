const mongoose = require('mongoose');

// Menu Item Schema
const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description must be less than 300 characters'],
      default: 'Delicious item from our restaurant',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    // Optional: AI-related field for popularity-based suggestions
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: Clean API response
menuItemSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // remove any internal fields if needed
  return obj;
};

module.exports = mongoose.model('MenuItem', menuItemSchema);



