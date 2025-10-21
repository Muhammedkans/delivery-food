let io;

const initSocket = (server) => {
  io = require('socket.io')(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('✅ Delivery socket connected:', socket.id);

    // Join delivery room
    socket.on('joinDelivery', (deliveryId) => {
      socket.join(`delivery_${deliveryId}`);
    });

    // Join customer room for tracking
    socket.on('joinCustomer', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Order status update
    socket.on('updateOrderStatus', ({ orderId, status }) => {
      io.to(`order_${orderId}`).emit('orderStatusUpdated', status);
    });

    socket.on('disconnect', () => {
      console.log('❌ Delivery socket disconnected:', socket.id);
    });
  });
};

module.exports = { initSocket, io };



