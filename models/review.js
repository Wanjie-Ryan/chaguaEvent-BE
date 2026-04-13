const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: [true, "Client ID is required"],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: [true, "Provider ID is required"],
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Prevent a client from reviewing the same listing twice
reviewSchema.index({ clientId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
