const Review = require("../models/review");
const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

// 1. CREATE REVIEW
const CreateReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });

    const review = await Review.create({
      clientId: req.user.userId,
      listingId,
      providerId: listing.providerId,
      rating,
      comment,
    });

    res.status(StatusCodes.CREATED).json({ msg: "Feedback submitted", data: review });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    if (err.code === 11000) return res.status(StatusCodes.CONFLICT).json({ msg: "Already reviewed" });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

// ... existing GetListingReviews and GetProviderReviews ...
const GetListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId }).populate("clientId", "username");
    res.status(StatusCodes.OK).json({ count: reviews.length, data: reviews });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const GetProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.user.userId }).populate("clientId", "username").populate("listingId", "title");
    res.status(StatusCodes.OK).json({ count: reviews.length, data: reviews });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = { CreateReview, GetListingReviews, GetProviderReviews };
