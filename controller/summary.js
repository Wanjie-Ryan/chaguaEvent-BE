const AuthModel = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { StatusCodes } = require("http-status-codes");

const GetStats = async (req, res) => {
  try {
    const totalProviders = await AuthModel.countDocuments({ role: "provider" });
    const totalListings = await Listing.countDocuments({ isApproved: true });
    const pendingListings = await Listing.countDocuments({ isApproved: false });
    const totalReviews = await Review.countDocuments();

    res.status(StatusCodes.OK).json({
      totalProviders,
      totalListings,
      pendingListings,
      totalReviews,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = { GetStats };
