module.exports = {
  // Order Status
  ORDER_STATUS: {
    PENDING: "pending",
    ACCEPTED: "accepted",
    PREPARING: "preparing",
    READY: "ready",
    OUT_FOR_DELIVERY: "out-for-delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },

  // User Roles
  USER_ROLES: {
    CUSTOMER: "customer",
    RESTAURANT: "restaurant",
    DELIVERY: "delivery",
    ADMIN: "admin",
  },

  // Dish Categories
  DISH_CATEGORIES: [
    "Veg",
    "Non-Veg",
    "Vegan",
    "Dessert",
    "Beverages",
    "Snacks",
    "Breakfast",
    "Lunch",
    "Dinner",
  ],

  // Cuisine Types
  CUISINE_TYPES: [
    "Indian",
    "Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "Continental",
    "Fast Food",
    "Desserts",
    "Beverages",
  ],

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],

  // JWT
  JWT_EXPIRE: "30d",
  JWT_COOKIE_EXPIRE: 30, // days
};

