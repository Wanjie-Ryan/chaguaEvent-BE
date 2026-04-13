const Listing = require("../models/listing");
const { StatusCodes } = require("http-status-codes");

const SearchListings = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search, sort } = req.query;
    const queryObject = { isApproved: true };

    // 1. Filtering Logic
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

    let result = Listing.find(queryObject).populate("providerId", "username photo");

    // 2. Sorting Logic (Surgically Targeted)
    if (sort) {
      if (sort === "price-high") {
        result = result.sort("-price"); // Descending
      } else if (sort === "price-low") {
        result = result.sort("price"); // Ascending
      } else if (sort === "category") {
        result = result.sort("category");
      } else if (sort === "latest") {
        result = result.sort("-createdAt");
      }
    } else {
      result = result.sort("-createdAt"); // Default to latest
    }

    const listings = await result;
    res.status(StatusCodes.OK).json({ count: listings.length, data: listings });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = { SearchListings };
