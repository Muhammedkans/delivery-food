const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// --------------------------------------------------
// CLOUDINARY STORAGE CONFIG
// --------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "food-delivery-app",
    format: undefined, // Auto detect file type
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
    transformation: [{ width: 600, height: 600, crop: "limit" }],
  }),
});

// --------------------------------------------------
// MULTER BASE CONFIG
// --------------------------------------------------
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    // Accept any image type
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed ⚠️"));
    }
    cb(null, true);
  },
});

// --------------------------------------------------
// 🔥 UNIVERSAL DEBUG LOGGER
// --------------------------------------------------
const uploadLogger = (req, res, next) => {
  console.log("------------------------------------------------");
  console.log("🔥 MULTER DEBUG LOGGER TRIGGERED");
  console.log("➡️ req.body:", req.body);
  console.log("➡️ req.file:", req.file);
  console.log("➡️ req.files:", req.files);
  console.log("------------------------------------------------");
  next();
};

// --------------------------------------------------
// RESTAURANT: logo + banner
// --------------------------------------------------
const uploadRestaurantImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// --------------------------------------------------
// DISH IMAGE
// --------------------------------------------------
const uploadDishImage = upload.single("image");

// --------------------------------------------------
// CHAT IMAGE
// --------------------------------------------------
const uploadChatImage = upload.single("image");

// --------------------------------------------------
// DELIVERY PROFILE (profilePhoto + licenseImage)
// --------------------------------------------------
const uploadDeliveryProfile = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "licenseImage", maxCount: 1 },
]);

// --------------------------------------------------
// 🔥 MULTER ERROR HANDLER
// --------------------------------------------------
const multerErrorHandler = (err, req, res, next) => {
  console.error("❌ MULTER ERROR CAUGHT:", err.message);

  return res.status(400).json({
    success: false,
    message: "Upload Failed",
    error: err.message,
  });
};

// --------------------------------------------------
// EXPORT
// --------------------------------------------------
module.exports = {
  uploadRestaurantImages,
  uploadDishImage,
  uploadChatImage,
  uploadDeliveryProfile,
  uploadLogger,
  multerErrorHandler,
};













