// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "FoodDeliveryApp",
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`.green
    );
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red);
    setTimeout(connectDB, 5000); // retry every 5 seconds
  }
};

module.exports = connectDB;



