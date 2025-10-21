const Restaurant = require('../models/Restaurent');
const Dish = require('../models/Dish');

// Add a new dish
exports.addDish = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image = req.file?.path; // Cloudinary URL

    const dish = await Dish.create({
      restaurant: req.user._id,
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json({ message: 'Dish added', dish });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add dish', error: error.message });
  }
};

// Edit dish
exports.editDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const { name, description, price, category } = req.body;

    const dish = await Dish.findOne({ _id: dishId, restaurant: req.user._id });
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    dish.name = name || dish.name;
    dish.description = description || dish.description;
    dish.price = price || dish.price;
    dish.category = category || dish.category;
    if (req.file) dish.image = req.file.path;

    await dish.save();
    res.status(200).json({ message: 'Dish updated', dish });
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit dish', error: error.message });
  }
};

// Delete dish
exports.deleteDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const dish = await Dish.findOneAndDelete({ _id: dishId, restaurant: req.user._id });
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    res.status(200).json({ message: 'Dish deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete dish', error: error.message });
  }
};

// Get all dishes for restaurant
exports.getRestaurantDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ restaurant: req.user._id });
    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dishes', error: error.message });
  }
};

// Get single restaurant menu (for customers)
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const dishes = await Dish.find({ restaurant: restaurantId });
    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu', error: error.message });
  }
};




