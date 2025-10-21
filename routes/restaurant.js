
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const parser = require('../middleware/uploadMiddleware');
const {
  addDish,
  editDish,
  deleteDish,
  getRestaurantDishes,
  getRestaurantMenu,
} = require('../controllers/restaurantController');

// All routes protected, only restaurant role for add/edit/delete
router.use(protect);
router.post('/dish', authorize('restaurant'), parser.single('image'), addDish);
router.put('/dish/:dishId', authorize('restaurant'), parser.single('image'), editDish);
router.delete('/dish/:dishId', authorize('restaurant'), deleteDish);
router.get('/mydishes', authorize('restaurant'), getRestaurantDishes);

// Public route for customers to view menu
router.get('/menu/:restaurantId', getRestaurantMenu);

module.exports = router;