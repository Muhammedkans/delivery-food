// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const { initSocket } = require("./sockets/index");

dotenv.config();

// -----------------------------------------
// ✅ Initialize Express & HTTP Server
// -----------------------------------------
const app = express();
const server = http.createServer(app);

// -----------------------------------------
// ✅ Connect to MongoDB
// -----------------------------------------
connectDB();

// -----------------------------------------
// ✅ Middlewares
// -----------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// -----------------------------------------
// ✅ Initialize Socket.IO BEFORE routes
// -----------------------------------------
const io = initSocket(server);

// Attach io to every request (controllers can emit)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -----------------------------------------
// ✅ API ROUTES
// -----------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/restaurant", require("./routes/restaurantRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// -----------------------------------------
// ✅ Global Error Handler
// -----------------------------------------
app.use(errorHandler);

// -----------------------------------------
// ✅ Start Server
// -----------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});










