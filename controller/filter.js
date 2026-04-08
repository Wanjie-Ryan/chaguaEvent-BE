const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

const SearchListings = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search } = req.query;
    const queryObject = { isApproved: true };

    if (category) queryObject.category = category;
    if (location) queryObject.location = { $regex: location, $options: "i" };
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      queryObject.price = {};
      if (minPrice) queryObject.price.$gte = Number(minPrice);
      if (maxPrice) queryObject.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(queryObject).populate("providerId", "username photo");
    res.status(StatusCodes.OK).json({ listings, count: listings.length });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = { SearchListings };
