const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: [true, "Provider ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ["photography", "catering", "decor", "entertainment", "venue", "other"],
      required: [true, "Category is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    images: {
      type: [String], // URLs
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
