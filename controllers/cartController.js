const Cart = require('../models/Cart');
const Dish = require('../models/Dish');

// Get customer cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  res.status(200).json({ cart });
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const { dishId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ dish: dishId, quantity }] });
  } else {
    const itemIndex = cart.items.findIndex(i => i.dish.toString() === dishId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ dish: dishId, quantity });
    }
    await cart.save();
  }

  res.status(200).json({ message: 'Cart updated', cart });
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { dishId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(i => i.dish.toString() === dishId);
  if (!item) return res.status(404).json({ message: 'Dish not in cart' });

  item.quantity = quantity;
  await cart.save();
  res.status(200).json({ message: 'Cart updated', cart });
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { dishId } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(i => i.dish.toString() !== dishId);
  await cart.save();
  res.status(200).json({ message: 'Item removed', cart });
};
