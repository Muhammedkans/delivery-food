// backend/middleware/upload.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// --------------------------------------------------
// CLOUDINARY STORAGE CONFIG
// --------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "food-delivery-app", // Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed image formats
  },
});

// --------------------------------------------------
// MULTER CONFIG
// --------------------------------------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg, .jpg, .png files are allowed"));
    }
    cb(null, true);
  },
});

// --------------------------------------------------
// RESTAURANT IMAGES (Logo + Banner)
// --------------------------------------------------
const uploadRestaurantImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// --------------------------------------------------
// DISH IMAGE (Single Image)
// --------------------------------------------------
const uploadDishImage = upload.single("image");

// --------------------------------------------------
// CHAT IMAGE (Single Image)
// --------------------------------------------------
const uploadChatImage = upload.single("image");

// --------------------------------------------------
// DELIVERY PARTNER PROFILE
// (Profile Photo + License Image)
// --------------------------------------------------
const uploadDeliveryProfile = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "licenseImage", maxCount: 1 },
]);

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------
module.exports = {
  uploadRestaurantImages,
  uploadDishImage,
  uploadChatImage,
  uploadDeliveryProfile,
};





