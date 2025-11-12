const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn.connection.host; // ✅ Added return (so it won’t log undefined if used elsewhere)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    setTimeout(connectDB, 5000); // retry after 5 seconds
  }
};

module.exports = connectDB;




