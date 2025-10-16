const MenuItem = require('../models/MenuItem');

// @desc    Add Menu Item (for restaurant owners)
// @route   POST /api/menu
// @access  Restaurant/Admin
exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, price, category, image, isRecommended } = req.body;

    // Validation
    if (!restaurantId || !name || price == null) {
      return res.status(400).json({ message: 'Restaurant, name, and price are required' });
    }

    const menuItem = await MenuItem.create({
      restaurantId,
      name,
      description: description || 'Delicious item from our restaurant',
      price,
      category: category || 'General',
      image:
        image ||
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
      isRecommended: isRecommended || false,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Add Menu Item Error:', error);
    res.status(500).json({ message: 'Server error adding menu item', error: error.message });
  }
};

// @desc    Get Menu Items (with filters, search, sort, pagination)
// @route   GET /api/menu
// @access  Public
exports.getMenu = async (req, res) => {
  try {
    const { category, search, sort, restaurantId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    // Sorting logic
    let sortOption = {};
    if (sort === 'price_low_high') sortOption.price = 1;
    else if (sort === 'price_high_low') sortOption.price = -1;
    else sortOption.createdAt = -1; // newest first

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await MenuItem.find(query).sort(sortOption).skip(skip).limit(parseInt(limit));
    const totalItems = await MenuItem.countDocuments(query);

    res.json({
      totalItems,
      page: parseInt(page),
      limit: parseInt(limit),
      items,
    });
  } catch (error) {
    console.error('Get Menu Error:', error);
    res.status(500).json({ message: 'Server error fetching menu items', error: error.message });
  }
};

// @desc    Get Menu Items by Restaurant (for restaurant dashboard)
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Restaurant/Admin
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json(items);
  } catch (error) {
    console.error('Get Menu By Restaurant Error:', error);
    res.status(500).json({ message: 'Server error fetching menu for restaurant', error: error.message });
  }
};

// @desc    Get Recommended Items (for AI / Popular Section)
// @route   GET /api/menu/recommended
// @access  Public
exports.getRecommendedItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const items = await MenuItem.find({ isRecommended: true }).limit(limit);
    res.json(items);
  } catch (error) {
    console.error('Get Recommended Items Error:', error);
    res.status(500).json({ message: 'Server error fetching recommended items', error: error.message });
  }
};

// @desc    Get Unique Categories
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json(categories.filter(Boolean)); // remove empty/null values
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Server error fetching categories', error: error.message });
  }
};


