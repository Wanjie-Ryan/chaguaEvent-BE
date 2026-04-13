const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

// 1. CREATE LISTING
const CreateListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      providerId: req.user.userId,
      isApproved: false,
    });

    res.status(StatusCodes.CREATED).json({ msg: "Listing created, pending approval", data: listing });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to create listing" });
  }
};

// 2. GET APPROVED LISTINGS
const GetApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ isApproved: true }).populate("providerId", "email").sort("-createdAt");
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Fetch failed" });
  }
};

// 3. GET SINGLE LISTING
const GetSingleListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("providerId", "email");
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });
    res.status(StatusCodes.OK).json({ data: listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error retrieving listing" });
  }
};

// 4. GET MY LISTINGS
const GetMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ providerId: req.user.userId });
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error fetching listings" });
  }
};

// 5. UPDATE LISTING
const UpdateListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Unauthorized or not found" });
    res.status(StatusCodes.OK).json({ msg: "Updated", data: listing });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 6. DELETE LISTING
const DeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({ _id: req.params.id, providerId: req.user.userId });
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Unauthorized or not found" });
    res.status(StatusCodes.OK).json({ msg: "Deleted" });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Delete failed" });
  }
};

// 7. ADMIN: GET ALL LISTINGS
const AdminGetAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({}).populate("providerId", "email").sort("-createdAt");
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Admin fetch failed" });
  }
};

// 8. ADMIN: TOGGLE APPROVAL
const AdminToggleApproval = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Not found" });
    listing.isApproved = !listing.isApproved;
    await listing.save();
    res.status(StatusCodes.OK).json({ msg: "Approval toggled", data: listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed" });
  }
};

module.exports = {
  CreateListing,
  GetApprovedListings,
  GetSingleListing,
  GetMyListings,
  UpdateListing,
  DeleteListing,
  AdminGetAllListings,
  AdminToggleApproval,
};
