const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Dish = require("../models/Dish");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.dish",
    select: "name price image available restaurant category",
    populate: {
      path: "restaurant",
      select: "name image",
    },
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    if (item.dish && item.dish.available) {
      return sum + item.dish.price * item.quantity;
    }
    return sum;
  }, 0);

  const deliveryFee = 50; // Default delivery fee
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + deliveryFee + tax;

  res.status(200).json({
    success: true,
    cart: {
      ...cart.toObject(),
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      tax: Math.round(tax * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      itemCount: cart.items.length,
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { dishId, quantity = 1 } = req.body;

  if (!dishId) {
    return res.status(400).json({
      success: false,
      message: "Dish ID is required",
    });
  }

  const dish = await Dish.findById(dishId).populate("restaurant");
  if (!dish) {
    return res.status(404).json({
      success: false,
      message: "Dish not found",
    });
  }

  if (!dish.available) {
    return res.status(400).json({
      success: false,
      message: "Dish is not available",
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ dish: dishId, quantity }],
    });
  } else {
    // Check if dish is from same restaurant
    const existingItem = cart.items.find(
      (item) => item.dish.toString() === dishId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Check if cart has items from different restaurant
      if (cart.items.length > 0) {
        const firstItem = await Dish.findById(cart.items[0].dish);
        if (firstItem && firstItem.restaurant.toString() !== dish.restaurant._id.toString()) {
          return res.status(400).json({
            success: false,
            message: "Cannot add items from different restaurants. Please clear cart first.",
          });
        }
      }
      cart.items.push({ dish: dishId, quantity });
    }

    await cart.save();
  }

  await cart.populate({
    path: "items.dish",
    select: "name price image available restaurant category",
    populate: {
      path: "restaurant",
      select: "name image",
    },
  });

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:dishId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.dish.toString() === dishId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  await cart.populate({
    path: "items.dish",
    select: "name price image available restaurant category",
    populate: {
      path: "restaurant",
      select: "name image",
    },
  });

  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:dishId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.dish.toString() !== dishId
  );

  await cart.save();

  await cart.populate({
    path: "items.dish",
    select: "name price image available restaurant category",
    populate: {
      path: "restaurant",
      select: "name image",
    },
  });

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: "Cart cleared",
    cart: cart || { items: [] },
  });
});
