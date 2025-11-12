const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// --------------------------------------------------
// ✅ Configure Cloudinary Storage
// --------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "food-delivery-app",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// --------------------------------------------------
// ✅ Multer Upload Setup
// --------------------------------------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg, .jpg, .png formats allowed!"));
    }
    cb(null, true);
  },
});

// --------------------------------------------------
// ✅ Separate Upload Middlewares
// --------------------------------------------------

// 🟢 For restaurant profile (upload both logo + banner)
const uploadRestaurantImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// 🟢 For dishes (upload one image only)
const uploadDishImage = upload.single("image");

// 🟢 For chat (upload a single image message)
const uploadChatImage = upload.single("image");

// --------------------------------------------------
// ✅ Export all upload middlewares
// --------------------------------------------------
module.exports = {
  uploadRestaurantImages,
  uploadDishImage,
  uploadChatImage,
};




