// backend/src/config/db.js
const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);

      console.log('MongoDB Connected ✅');

      // Connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...');
      });

    } catch (error) {
      console.error(`MongoDB connection failed (attempt ${retries + 1}):`, error.message);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying to connect in 3 seconds...`);
        setTimeout(connect, 3000);
      } else {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  };

  await connect();
};

module.exports = connectDB;


