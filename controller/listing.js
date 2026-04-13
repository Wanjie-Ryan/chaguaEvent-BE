const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

// 1. CREATE LISTING (Provider Only)
const CreateListing = async (req, res) => {
  try {
    // SECURITY: Always take providerId from the JWT (req.user), NEVER the req.body
    const listingData = {
      ...req.body,
      providerId: req.user.userId,
      isApproved: false, // Always starts unapproved
    };

    const listing = await Listing.create(listingData);
    res.status(StatusCodes.CREATED).json({ 
      msg: "Listing created, pending admin approval.", 
      data: listing 
    });
  } catch (err) {
    console.log("Create listing error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to create listing" });
  }
};

// 2. GET ALL APPROVED LISTINGS (Client Discovery)
const GetApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ isApproved: true })
      .populate("providerId", "email") // Populate with auth info
      .sort("-createdAt");
    
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to fetch listings" });
  }
};

// 3. GET SINGLE LISTING
const GetSingleListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("providerId", "email");

    if (!listing) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });
    }

    res.status(StatusCodes.OK).json({ data: listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error retrieving listing" });
  }
};

// 4. GET MY LISTINGS (Provider Dashboard)
const GetMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ providerId: req.user.userId });
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error fetching your listings" });
  }
};

// 5. UPDATE LISTING (Provider Only + Ownership Enforcement)
const UpdateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // SECURITY: findOneAndUpdate with providerId filter ensures you can ONLY update YOUR listing
    const listing = await Listing.findOneAndUpdate(
      { _id: id, providerId: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "Listing not found or you are not authorized to edit it" 
      });
    }

    res.status(StatusCodes.OK).json({ msg: "Listing updated", data: listing });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 6. DELETE LISTING (Provider Only + Ownership Enforcement)
const DeleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const listing = await Listing.findOneAndDelete({ _id: id, providerId: userId });

    if (!listing) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "Listing not found or you are not authorized to delete it" 
      });
    }

    res.status(StatusCodes.OK).json({ msg: "Listing deleted successfully" });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Delete failed" });
  }
};

// --- ADMIN SPECIFIC LOGIC ---

// 7. ADMIN: GET ALL LISTINGS
const AdminGetAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({})
      .populate("providerId", "email")
      .sort("-createdAt");

    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Admin fetch failed" });
  }
};

// 8. ADMIN: TOGGLE APPROVAL
const AdminToggleApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Listing not found" });
    }

    listing.isApproved = !listing.isApproved;
    await listing.save();

    res.status(StatusCodes.OK).json({ 
      msg: `Listing ${listing.isApproved ? "Approved" : "Disapproved"}`, 
      data: listing 
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Approval toggle failed" });
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
