// backend/routes/restaurantRoutes.js
const express = require("express");
const router = express.Router();
const {
  getRestaurantProfile,
  updateRestaurantProfile,
  addDish,
  updateDish,
  deleteDish,
  getRestaurantMenu,
  getAllRestaurants,
  toggleRestaurantStatus,
} = require("../controllers/restaurantController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadRestaurantImages, uploadDishImage } = require("../middleware/upload");

// --------------------------------------------------
// ✅ GET RESTAURANT PROFILE
// --------------------------------------------------
router.get(
  "/profile",
  protect,
  authorizeRoles("restaurant"),
  getRestaurantProfile
);

// --------------------------------------------------
// ✅ UPDATE RESTAURANT PROFILE (banner + logo upload)
// --------------------------------------------------
router.put(
  "/update",
  protect,
  authorizeRoles("restaurant"),
  uploadRestaurantImages,
  updateRestaurantProfile
);

// --------------------------------------------------
// ✅ ADD DISH
// --------------------------------------------------
router.post(
  "/dish",
  protect,
  authorizeRoles("restaurant"),
  uploadDishImage,
  addDish
);

// --------------------------------------------------
// ✅ UPDATE DISH
// --------------------------------------------------
router.put(
  "/dish/:dishId",
  protect,
  authorizeRoles("restaurant"),
  uploadDishImage,
  updateDish
);

// --------------------------------------------------
// ✅ DELETE DISH
// --------------------------------------------------
router.delete(
  "/dish/:dishId",
  protect,
  authorizeRoles("restaurant"),
  deleteDish
);

// --------------------------------------------------
// ✅ PUBLIC API → GET MENU
// --------------------------------------------------
router.get("/menu/:restaurantId", getRestaurantMenu);

// --------------------------------------------------
// ✅ PUBLIC API → ALL RESTAURANTS
// --------------------------------------------------
router.get("/all", getAllRestaurants);

// --------------------------------------------------
// ✅ TOGGLE RESTAURANT OPEN/CLOSE STATUS
// --------------------------------------------------
router.put(
  "/toggle-status",
  protect,
  authorizeRoles("restaurant"),
  toggleRestaurantStatus
);

module.exports = router;

