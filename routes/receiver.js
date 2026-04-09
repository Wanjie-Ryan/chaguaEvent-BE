const express = require("express");
const router = express.Router();
const {
  CreateListing,
  GetAllListings,
  GetMyListings,
  UpdateListing,
  DeleteListing,
} = require("../controller/receiver");
const { AuthMiddleware } = require("../middleware/middleware");

router.route("/").get(GetAllListings).post(AuthMiddleware, CreateListing);
router.route("/my").get(AuthMiddleware, GetMyListings);
router.route("/:id").put(AuthMiddleware, UpdateListing).delete(AuthMiddleware, DeleteListing);

module.exports = router;
