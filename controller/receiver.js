const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

const CreateListing = async (req, res) => {
  try {
    req.body.providerId = req.user.userId;
    const listing = await Listing.create(req.body);
    res.status(StatusCodes.CREATED).json({ msg: "Listing created, pending approval", listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const GetAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({ isApproved: true }).populate("providerId", "username photo");
    res.status(StatusCodes.OK).json({ listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const GetMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ providerId: req.user.userId });
    res.status(StatusCodes.OK).json({ listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const UpdateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findOneAndUpdate(
      { _id: id, providerId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });
    res.status(StatusCodes.OK).json({ msg: "Listing updated", listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const DeleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findOneAndDelete({ _id: id, providerId: req.user.userId });
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });
    res.status(StatusCodes.OK).json({ msg: "Listing deleted" });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = {
  CreateListing,
  GetAllListings,
  GetMyListings,
  UpdateListing,
  DeleteListing,
};
