// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 6,
      select: false, // hide password by default
    },

    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      default: "customer",
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // Restaurant-specific fields
    restaurantDetails: {
      restaurantName: String,
      gstNumber: String,
      fssaiNumber: String,
      isApproved: {
        type: Boolean,
        default: false, // Admin approval needed
      }
    },

    // Delivery Partner-specific
    deliveryDetails: {
      vehicleNumber: String,
      drivingLicense: String,
      isAvailable: {
        type: Boolean,
        default: true,
      }
    }
  },
  { timestamps: true }
);

// Hash Password Before Save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

