// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 6,
      select: false, // never expose password
    },

    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      default: "customer",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // -----------------------------------------------------
    // RESTAURANT OWNER DETAILS
    // -----------------------------------------------------
    restaurantDetails: {
      restaurantName: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      fssaiNumber: { type: String, default: "" },
      isApproved: {
        type: Boolean,
        default: false, // Admin must approve
      },
    },

    // -----------------------------------------------------
    // DELIVERY PARTNER DETAILS
    // -----------------------------------------------------
    deliveryDetails: {
      vehicleNumber: { type: String, default: "" },
      drivingLicense: { type: String, default: "" },

      // If available = online/offline toggle
      isAvailable: {
        type: Boolean,
        default: false, // default OFFLINE for safety
      },

      // Real-time location for delivery partner
      liveLocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          default: [0, 0],
        },
      },
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------
// PASSWORD HASHING
// ---------------------------------------------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------------------------------------------------------
// PASSWORD MATCH CHECK
// ---------------------------------------------------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for location queries
userSchema.index({ "deliveryDetails.liveLocation": "2dsphere" });

module.exports = mongoose.model("User", userSchema);


