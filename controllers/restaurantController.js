const Restaurant = require('../models/Restaurent');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('menu');
    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error fetching restaurants' });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('menu');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Server error fetching restaurant' });
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Admin / Restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, offers, cuisine, image } = req.body;

    if (!name || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: 'Name and location are required' });
    }

    const restaurant = await Restaurant.create({
      name,
      location,
      offers: offers || [],
      cuisine: cuisine || 'General',
      image:
        image ||
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Server error creating restaurant' });
  }
};

// @desc    Update a restaurant (admin/restaurant)
// @route   PUT /api/restaurants/:id
// @access  Admin / Restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, location, offers, cuisine, image, isActive } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.name = name || restaurant.name;
    restaurant.location = location || restaurant.location;
    restaurant.offers = offers || restaurant.offers;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.image = image || restaurant.image;
    if (typeof isActive === 'boolean') restaurant.isActive = isActive;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Server error updating restaurant' });
  }
};

// @desc    Delete a restaurant (soft delete recommended)
// @route   DELETE /api/restaurants/:id
// @access  Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Soft delete
    restaurant.isActive = false;
    await restaurant.save();

    res.json({ message: 'Restaurant deleted successfully (soft delete)' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ message: 'Server error deleting restaurant' });
  }
};

