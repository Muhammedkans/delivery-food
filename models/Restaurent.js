const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  address: String,
  image: String, // Cloudinary URL
  rating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);








