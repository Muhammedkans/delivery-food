// ==========================
// IMPORTS
// ==========================
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const restaurantRoutes = require('./routes/restaurant');
const deliveryRoutes = require('./routes/delivery');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const cartRoutes = require('./routes/cart');

// Middlewares
const  errorHandler  = require('./middleware/error');

// Socket
const { initSocket } = require('./sockets/index');

// Configs
dotenv.config();
require('./config/db')(); // MongoDB connection
require('./config/cloudinaryConfig'); // Cloudinary setup

// ==========================
// EXPRESS SETUP
// ==========================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev')); // logging

// ==========================
// ROUTES
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);

// ==========================
// ERROR HANDLING
// ==========================
app.use(errorHandler);

// ==========================
// SERVER + SOCKET.IO
// ==========================
const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});








