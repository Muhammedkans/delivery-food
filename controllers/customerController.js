// backend/controllers/customerController.js
const User = require("../models/User");
const Dish = require("../models/Dish");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurent");

// --------------------------------------------------
// ✅ GET ALL RESTAURANTS (Homepage)
// --------------------------------------------------
exports.getHomepageRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({
      role: "restaurant",
      "restaurantDetails.isApproved": true,
      "restaurantDetails.isOpen": true,
    }).select("-password");

    res.status(200).json({ success: true, restaurants });
  } catch (err) {
    console.error("Homepage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET MENU OF A RESTAURANT
// --------------------------------------------------
exports.getMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const dishes = await Dish.find({ restaurant: restaurantId });

    res.status(200).json({ success: true, dishes });
  } catch (err) {
    console.error("Get Menu Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ ADD TO CART
// --------------------------------------------------
exports.addToCart = async (req, res) => {
  try {
    const { dishId, quantity } = req.body;

    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ success: false, message: "Dish not found" });

    let cart = await Cart.findOne({ user: req.user._id });

    // Create cart if empty
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if dish already in cart
    const itemIndex = cart.items.findIndex((i) => i.dish.toString() === dishId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        dish: dishId,
        quantity,
        price: dish.price,
      });
    }

    // Recalculate price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ UPDATE CART ITEM
// --------------------------------------------------
exports.updateCartItem = async (req, res) => {
  try {
    const { dishId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart empty" });

    const itemIndex = cart.items.findIndex((i) => i.dish.toString() === dishId);
    if (itemIndex < 0) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ REMOVE ITEM FROM CART
// --------------------------------------------------
exports.removeFromCart = async (req, res) => {
  try {
    const { dishId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart empty" });

    cart.items = cart.items.filter((i) => i.dish.toString() !== dishId);

    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("Remove From Cart Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ CLEAR CART
// --------------------------------------------------
exports.clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ user: req.user._id });

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET USER CART
// --------------------------------------------------
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.dish");

    res.status(200).json({ success: true, cart: cart || [] });
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ PLACE ORDER
// --------------------------------------------------
exports.placeOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.dish");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const order = await Order.create({
      customer: req.user._id,
      restaurant: cart.items[0].dish.restaurant,
      items: cart.items,
      totalAmount: cart.totalPrice,
      paymentMethod,
      deliveryAddress,
      status: "placed",
    });

    await Cart.deleteOne({ user: req.user._id });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET USER ORDERS
// --------------------------------------------------
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET ACTIVE ORDER (tracking)
// --------------------------------------------------
exports.getActiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      customer: req.user._id,
      status: { $in: ["placed", "accepted", "picked_up"] },
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Active Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

