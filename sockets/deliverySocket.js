/**
 * deliverySocket.js
 * -----------------------------------------
 * Real-time delivery partner events
 * - Secure order room join (matches socketRoomId)
 * - Partner live GPS streaming
 * - Customer + restaurant get updates
 * - Clean & production-ready
 */

const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

exports.deliverySocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🚚 Delivery socket connected:", socket.id);

    // -----------------------------------------------------
    // 1️⃣ SECURE JOIN ORDER ROOM
    // -----------------------------------------------------
    socket.on("join-order", async ({ orderId, partnerId }) => {
      try {
        if (!orderId || !partnerId) return;

        const order = await Order.findById(orderId);
        if (!order) {
          return socket.emit("error", { message: "Order not found" });
        }

        // Only assigned delivery partner can join room
        if (
          order.deliveryPartner &&
          order.deliveryPartner.toString() !== partnerId.toString()
        ) {
          return socket.emit("error", {
            message: "Not authorized to join this order",
          });
        }

        const room = order.socketRoomId;

        socket.join(room);

        socket.emit("order-joined", {
          success: true,
          room,
          orderId,
          message: `Partner joined order room ${room}`,
        });

        console.log(`🚚 Partner ${partnerId} joined room ${room}`);
      } catch (error) {
        console.error("join-order error:", error);
      }
    });

    // -----------------------------------------------------
    // 2️⃣ LIVE GPS LOCATION STREAM
    // -----------------------------------------------------
    socket.on("driver-location", async ({ orderId, lat, lng, partnerId }) => {
      try {
        if (!orderId || lat === undefined || lng === undefined) return;

        const order = await Order.findById(orderId);
        if (!order) return;

        const room = order.socketRoomId;

        io.to(room).emit("location-update", {
          orderId,
          lat,
          lng,
          partnerId,
          timestamp: new Date(),
        });

      } catch (error) {
        console.error("driver-location error:", error);
      }
    });

    // -----------------------------------------------------
    // 3️⃣ DELIVERY STATUS UPDATE (Accepted / Picked Up / Delivered)
    // -----------------------------------------------------
    socket.on("status-update", async ({ orderId, status, partnerId }) => {
      try {
        if (!orderId || !status) return;

        const order = await Order.findById(orderId);
        if (!order) return;

        const room = order.socketRoomId;

        io.to(room).emit("status-update", {
          orderId,
          status,
          partnerId,
          timestamp: new Date(),
        });

        console.log(`📦 Status update: Order ${orderId} → ${status}`);
      } catch (error) {
        console.error("status-update error:", error);
      }
    });

    // -----------------------------------------------------
    // 4️⃣ DISCONNECT
    // -----------------------------------------------------
    socket.on("disconnect", () => {
      console.log("❌ Delivery socket disconnected:", socket.id);
    });
  });
};






