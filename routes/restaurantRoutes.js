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
  getSingleRestaurant,
} = require("../controllers/restaurantController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadRestaurantImages, uploadDishImage } = require("../middleware/upload");


// ---------------------------------------------
// PUBLIC: GET ALL RESTAURANTS
// ---------------------------------------------
router.get("/all", getAllRestaurants);

// ---------------------------------------------
// PUBLIC: GET RESTAURANT MENU
// ---------------------------------------------
router.get("/menu/:restaurantId", getRestaurantMenu);

// ---------------------------------------------
// GET RESTAURANT PROFILE
// ---------------------------------------------
router.get(
  "/profile",
  protect,
  authorizeRoles("restaurant"),
  getRestaurantProfile
);

// ---------------------------------------------
// UPDATE RESTAURANT PROFILE
// ---------------------------------------------
router.put(
  "/update",
  protect,
  authorizeRoles("restaurant"),
  uploadRestaurantImages,
  updateRestaurantProfile
);

// ---------------------------------------------
// ADD DISH
// ---------------------------------------------
router.post(
  "/dish",
  protect,
  authorizeRoles("restaurant"),
  uploadDishImage,
  addDish
);

// ---------------------------------------------
// UPDATE DISH
// ---------------------------------------------
router.put(
  "/dish/:dishId",
  protect,
  authorizeRoles("restaurant"),
  uploadDishImage,
  updateDish
);

// ---------------------------------------------
// DELETE DISH
// ---------------------------------------------
router.delete(
  "/dish/:dishId",
  protect,
  authorizeRoles("restaurant"),
  deleteDish
);

// ---------------------------------------------
// TOGGLE RESTAURANT STATUS
// ---------------------------------------------
router.put(
  "/toggle-status",
  protect,
  authorizeRoles("restaurant"),
  toggleRestaurantStatus
);

// ---------------------------------------------
// PUBLIC: GET SINGLE RESTAURANT (PUT AT BOTTOM)
// ---------------------------------------------
router.get("/:restaurantId", getSingleRestaurant);

module.exports = router;



