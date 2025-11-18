// backend/socket/index.js
const { Server } = require("socket.io");

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // --------------------------------------------------
    // JOIN ROOMS
    // --------------------------------------------------
    socket.on("joinUser", (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      console.log(`➡️ User joined: user_${userId}`);
    });

    socket.on("joinRestaurant", (restaurantId) => {
      if (!restaurantId) return;
      socket.join(`restaurant_${restaurantId}`);
      console.log(`➡️ Restaurant joined: restaurant_${restaurantId}`);
    });

    socket.on("joinDelivery", (deliveryId) => {
      if (!deliveryId) return;
      socket.join(`delivery_${deliveryId}`);
      console.log(`➡️ Delivery joined: delivery_${deliveryId}`);
    });

    socket.on("joinOrder", (orderId) => {
      if (!orderId) return;
      socket.join(`order_${orderId}`);
      console.log(`➡️ Order tracking joined: order_${orderId}`);
    });

    // --------------------------------------------------
    // ORDER STATUS UPDATE (Frontend / Controller triggered)
    // --------------------------------------------------
    socket.on("updateOrderStatus", ({ orderId, status, userId, restaurantId }) => {
      if (!orderId || !status) return;

      emitToOrderRoom(orderId, { orderId, status });

      if (userId) emitToUser(userId, { orderId, status });
      if (restaurantId) emitToRestaurant(restaurantId, { orderId, status });

      console.log(`📦 Order ${orderId} updated to ${status}`);
    });

    // --------------------------------------------------
    // DELIVERY PARTNER LIVE LOCATION
    // --------------------------------------------------
    socket.on("deliveryLocationUpdate", ({ orderId, location, deliveryPartnerId }) => {
      if (!orderId || !location) return;

      io.to(`order_${orderId}`).emit("deliveryLocation", {
        orderId,
        location,
        deliveryPartnerId,
        timestamp: new Date(),
      });

      console.log(`📍 Live location for order ${orderId}`);
    });

    // --------------------------------------------------
    // NEW ORDER FOR RESTAURANT
    // --------------------------------------------------
    socket.on("newOrder", ({ restaurantId, order }) => {
      if (!restaurantId || !order) return;

      io.to(`restaurant_${restaurantId}`).emit("newOrderNotification", {
        order,
        timestamp: new Date(),
      });

      console.log(`🛎️ New order sent to restaurant_${restaurantId}`);
    });

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/* ===========================================================
   🔥 HELPER EMIT FUNCTIONS — Used inside Controllers
   =========================================================== */

const emitToOrderRoom = (orderId, payload) => {
  if (io) {
    io.to(`order_${orderId}`).emit("orderStatusUpdated", {
      ...payload,
      timestamp: new Date(),
    });
  }
};

const emitToUser = (userId, payload) => {
  if (io) {
    io.to(`user_${userId}`).emit("orderUpdate", {
      ...payload,
      timestamp: new Date(),
    });
  }
};

const emitToRestaurant = (restaurantId, payload) => {
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit("orderUpdate", {
      ...payload,
      timestamp: new Date(),
    });
  }
};

/**
 * Universal emit function called from controllers
 */
const emitOrderUpdate = (orderId, status, userId, restaurantId) => {
  emitToOrderRoom(orderId, { orderId, status });

  if (userId) emitToUser(userId, { orderId, status });
  if (restaurantId) emitToRestaurant(restaurantId, { orderId, status });
};

module.exports = {
  initSocket,
  emitOrderUpdate,
};







