// backend/src/index.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();
const server = http.createServer(app);

// CORS configuration (allow frontend + cookies)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middlewares
app.use(express.json());       // Body parser
app.use(cookieParser());       // Cookie parser

// Static folder for uploads (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------
// Routes
// -------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/ai', require('./routes/ai'));

// -------------------
// Socket.io setup
// -------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach socket.io event handlers
require('./sockets/socketHandler')(io);

// Connect driverController with Socket.io
const { setSocketIO } = require('./controllers/driverController');
setSocketIO(io);

// -------------------
// Global error handling middleware
// -------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// -------------------
// Start server
// -------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));






