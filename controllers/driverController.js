const Driver = require('../models/Driver');
const Order = require('../models/Order');

let io; // socket instance

// Allow socket instance to be set from server.js
exports.setSocketIO = (ioInstance) => {
  io = ioInstance;
};

// @desc    Update driver location + emit to order room
// @route   PUT /api/drivers/location
// @access  Driver
exports.updateLocation = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Forbidden: Only drivers can update location' });
    }

    const driver = await Driver.findById(req.user._id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const { lat, lng, orderId } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Update driver location
    driver.location = { lat, lng };
    await driver.save();

    // Emit location update to frontend (specific order tracking room)
    if (io && orderId) {
      io.to(orderId).emit('deliveryLocationUpdate', { lat, lng });
    }

    res.json({ message: 'Driver location updated successfully', driver });
  } catch (error) {
    console.error('Update Driver Location Error:', error);
    res.status(500).json({ message: 'Server error updating driver location', error: error.message });
  }
};

// @desc    Get all available drivers
// @route   GET /api/drivers/available
// @access  Admin / Restaurant
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'available' });
    res.json(drivers);
  } catch (error) {
    console.error('Get Available Drivers Error:', error);
    res.status(500).json({ message: 'Server error fetching available drivers', error: error.message });
  }
};

// @desc    Assign order to driver
// @route   PUT /api/drivers/assign
// @access  Admin / Restaurant
exports.assignOrder = async (req, res) => {
  try {
    const { driverId, orderId } = req.body;
    if (!driverId || !orderId) {
      return res.status(400).json({ message: 'Driver ID and Order ID are required' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    driver.currentOrderId = orderId;
    driver.status = 'busy';
    await driver.save();

    order.deliveryBoyId = driverId;
    await order.save();

    // Emit assignment update
    if (io) {
      io.to(orderId).emit('driverAssigned', {
        driverId: driver._id,
        driverName: driver.name,
      });
    }

    res.json({ message: 'Driver assigned successfully', driver, order });
  } catch (error) {
    console.error('Assign Driver Error:', error);
    res.status(500).json({ message: 'Server error assigning driver', error: error.message });
  }
};




