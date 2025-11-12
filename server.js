// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

dotenv.config();

// -----------------------------------------
// ✅ Initialize Server
// -----------------------------------------
const app = express();
const server = http.createServer(app);

// -----------------------------------------
// ✅ Database Connection
// -----------------------------------------
connectDB();

// -----------------------------------------
// ✅ Middlewares
// -----------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ CORS for Frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// -----------------------------------------
// ✅ SOCKET.IO SETUP
// -----------------------------------------
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Attach io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -----------------------------------------
// ✅ Real-time Socket Logic
// -----------------------------------------
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // ✅ Join room (Order Chat)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`✅ Joined room: ${roomId}`);
  });

  // ✅ Leave room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`❌ Left room: ${roomId}`);
  });

  // ✅ Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// -----------------------------------------
// ✅ ROUTES
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
// ✅ ERROR HANDLER
// -----------------------------------------
app.use(errorHandler);

// -----------------------------------------
// ✅ START SERVER
// -----------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});







