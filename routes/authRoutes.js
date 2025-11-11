// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  registerRestaurant,
  loginRestaurant,
  registerDeliveryPartner,
  loginDeliveryPartner,
  loginAdmin,
  logout,
} = require("../controllers/authController");

// ------------------------------
// ✅ CUSTOMER ROUTES
// ------------------------------
router.post("/customer/register", registerCustomer);
router.post("/customer/login", loginCustomer);

// ------------------------------
// ✅ RESTAURANT ROUTES
// ------------------------------
router.post("/restaurant/register", registerRestaurant);
router.post("/restaurant/login", loginRestaurant);

// ------------------------------
// ✅ DELIVERY PARTNER ROUTES
// ------------------------------
router.post("/delivery/register", registerDeliveryPartner);
router.post("/delivery/login", loginDeliveryPartner);

// ------------------------------
// ✅ ADMIN ROUTE
// ------------------------------
router.post("/admin/login", loginAdmin);

// ------------------------------
// ✅ LOGOUT
// ------------------------------
router.post("/logout", logout);

module.exports = router;


