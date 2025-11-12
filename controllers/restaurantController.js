// backend/controllers/restaurantController.js
const User = require("../models/User");
const Dish = require("../models/Dish");
const cloudinary = require("../config/cloudinaryConfig");
const mongoose = require("mongoose");
const Restaurent = require("../models/Restaurent");

// --------------------------------------------------
// ✅ GET RESTAURANT PROFILE
// --------------------------------------------------
exports.getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await User.findById(req.user._id).select("-password");

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    console.error("Get Restaurant Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ UPDATE RESTAURANT PROFILE
// --------------------------------------------------
exports.updateRestaurantProfile = async (req, res) => {
  try {
    const { name, phone, address, cuisines, deliveryTime } = req.body;

    const restaurant = await User.findById(req.user._id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    restaurant.name = name || restaurant.name;
    restaurant.phone = phone || restaurant.phone;
    restaurant.address = address || restaurant.address;
    restaurant.cuisines = cuisines || restaurant.cuisines;
    restaurant.deliveryTime = deliveryTime || restaurant.deliveryTime;

    // ✅ Upload banner image if provided
    if (req.files?.banner) {
      const bannerUpload = req.files.banner[0];
      const result = await cloudinary.uploader.upload(bannerUpload.path, {
        folder: "foodapp/restaurant/banner",
      });
      restaurant.restaurantDetails.bannerImage = result.secure_url;
    }

    // ✅ Upload logo image if provided
    if (req.files?.logo) {
      const logoUpload = req.files.logo[0];
      const result = await cloudinary.uploader.upload(logoUpload.path, {
        folder: "foodapp/restaurant/logo",
      });
      restaurant.restaurantDetails.logo = result.secure_url;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Update Restaurant Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ ADD DISH
// --------------------------------------------------
exports.addDish = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, isAvailable } = req.body;

    // ✅ Check restaurant
    const restaurant = await User.findById(req.user._id);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    let imageUrl = "";

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "foodapp/dishes",
      });
      imageUrl = upload.secure_url;
    }

    const dish = await Dish.create({
      restaurant: restaurant._id,
      name,
      description,
      price,
      category,
      isVeg,
      isAvailable,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Dish added successfully",
      dish,
    });
  } catch (error) {
    console.error("Add Dish Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ UPDATE DISH
// --------------------------------------------------
exports.updateDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" });
    }

    // ✅ Ensure restaurant owner
    if (dish.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { name, description, price, category, isVeg, isAvailable } = req.body;

    dish.name = name || dish.name;
    dish.description = description || dish.description;
    dish.price = price || dish.price;
    dish.category = category || dish.category;
    dish.isVeg = isVeg ?? dish.isVeg;
    dish.isAvailable = isAvailable ?? dish.isAvailable;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "foodapp/dishes",
      });
      dish.imageUrl = upload.secure_url;
    }

    await dish.save();

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      dish,
    });
  } catch (error) {
    console.error("Update Dish Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ DELETE DISH
// --------------------------------------------------
exports.deleteDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" });
    }

    if (dish.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await dish.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    console.error("Delete Dish Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET RESTAURANT MENU
// --------------------------------------------------
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const dishes = await Dish.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      dishes,
    });
  } catch (error) {
    console.error("Get Restaurant Menu Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET ALL RESTAURANTS
// --------------------------------------------------
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurent.find();
    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching restaurants",
    });
  }
};

// --------------------------------------------------
// ✅ CHANGE OPEN/CLOSE STATUS
// --------------------------------------------------
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await User.findById(req.user._id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    restaurant.restaurantDetails.isOpen = !restaurant.restaurantDetails.isOpen;
    await restaurant.save();

    res.status(200).json({
      success: true,
      isOpen: restaurant.restaurantDetails.isOpen,
    });
  } catch (error) {
    console.error("Toggle Restaurant Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

