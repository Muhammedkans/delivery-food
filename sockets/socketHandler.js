// backend/src/sockets/socketHandler.js

/**
 * Socket.io Handler
 * Handles live order tracking and driver location updates
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🚀 New client connected:', socket.id);

    /**
     * Join a specific order room
     * Frontend emits: socket.emit('joinOrder', orderId)
     */
    socket.on('joinOrder', (orderId) => {
      if (!orderId) return;
      socket.join(orderId);
      console.log(`✅ Socket ${socket.id} joined order room: ${orderId}`);
    });

    /**
     * Driver shares live location
     * Frontend emits: socket.emit('driverLocation', { orderId, lat, lng })
     */
    socket.on('driverLocation', (data) => {
      try {
        const { orderId, lat, lng } = data;
        if (!orderId || lat === undefined || lng === undefined) return;

        // Broadcast to all users watching this order
        io.to(orderId).emit('deliveryLocationUpdate', { lat, lng });
        console.log(`📍 Updated driver location for order ${orderId}:`, lat, lng);
      } catch (err) {
        console.error('❌ Error in driverLocation event:', err.message);
      }
    });

    /**
     * Update order status
     * Frontend emits: socket.emit('orderStatus', { orderId, status })
     */
    socket.on('orderStatus', (data) => {
      try {
        const { orderId, status } = data;
        if (!orderId || !status) return;

        io.to(orderId).emit('orderStatusUpdate', status);
        console.log(`🔔 Order ${orderId} status updated: ${status}`);
      } catch (err) {
        console.error('❌ Error in orderStatus event:', err.message);
      }
    });

    /**
     * Handle client disconnect
     */
    socket.on('disconnect', () => {
      console.log('❎ Client disconnected:', socket.id);
    });
  });
};


