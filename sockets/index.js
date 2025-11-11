let io;

const initSocket = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join user room for personalized updates
    socket.on("joinUser", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join restaurant room
    socket.on("joinRestaurant", (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Restaurant ${restaurantId} room joined`);
    });

    // Join delivery room
    socket.on("joinDelivery", (deliveryId) => {
      socket.join(`delivery_${deliveryId}`);
      console.log(`Delivery partner ${deliveryId} joined`);
    });

    // Join order room for real-time tracking
    socket.on("joinOrder", (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Order ${orderId} tracking room joined`);
    });

    // Order status update (from restaurant/delivery)
    socket.on("updateOrderStatus", ({ orderId, status, userId, restaurantId }) => {
      // Notify customer
      io.to(`order_${orderId}`).emit("orderStatusUpdated", {
        orderId,
        status,
        timestamp: new Date(),
      });

      // Notify restaurant
      if (restaurantId) {
        io.to(`restaurant_${restaurantId}`).emit("orderUpdate", {
          orderId,
          status,
        });
      }

      // Notify user
      if (userId) {
        io.to(`user_${userId}`).emit("orderUpdate", {
          orderId,
          status,
        });
      }
    });

    // Delivery location update
    socket.on("deliveryLocationUpdate", ({ orderId, location, deliveryPartnerId }) => {
      io.to(`order_${orderId}`).emit("deliveryLocation", {
        orderId,
        location,
        deliveryPartnerId,
        timestamp: new Date(),
      });
    });

    // New order notification (for restaurant)
    socket.on("newOrder", ({ restaurantId, order }) => {
      io.to(`restaurant_${restaurantId}`).emit("newOrderNotification", {
        order,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper function to emit events from controllers
const emitOrderUpdate = (orderId, status, userId, restaurantId) => {
  if (io) {
    io.to(`order_${orderId}`).emit("orderStatusUpdated", {
      orderId,
      status,
      timestamp: new Date(),
    });

    if (userId) {
      io.to(`user_${userId}`).emit("orderUpdate", {
        orderId,
        status,
      });
    }

    if (restaurantId) {
      io.to(`restaurant_${restaurantId}`).emit("orderUpdate", {
        orderId,
        status,
      });
    }
  }
};

module.exports = { initSocket, io, emitOrderUpdate };



