const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String, // Cloudinary URL
  category: String,
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Dish', dishSchema);

