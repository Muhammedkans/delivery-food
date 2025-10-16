// backend/src/utils/calcOrder.js
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');

/**
 * Calculate total price of an order
 * @param {Array} items - array of { menuItemId, quantity }
 * @returns {Number} total price
 */
const calcTotalPrice = asyncHandler(async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('No items provided for price calculation');
  }

  const ids = items.map(i => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: ids } });

  if (menuItems.length === 0) {
    throw new Error('Menu items not found in database');
  }

  let total = 0;

  items.forEach(item => {
    const menuItem = menuItems.find(mi => mi._id.equals(item.menuItemId));
    if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);
    total += menuItem.price * item.quantity;
  });

  return total;
});

module.exports = calcTotalPrice;

