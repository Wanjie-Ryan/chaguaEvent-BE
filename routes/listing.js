const express = require("express");
const router = express.Router();
const {
  CreateListing,
  GetApprovedListings,
  GetSingleListing,
  GetMyListings,
  UpdateListing,
  DeleteListing,
  AdminGetAllListings,
  AdminToggleApproval,
} = require("../controller/listing");
const { AuthMiddleware, Authorize } = require("../middleware/middleware");

// --- PUBLIC ROUTES (CLIENTS) ---
router.get("/all", GetApprovedListings);
router.get("/single/:id", GetSingleListing);

// --- PROVIDER ROUTES ---
router.post("/create", AuthMiddleware, Authorize("provider"), CreateListing);
router.get("/my-listings", AuthMiddleware, Authorize("provider"), GetMyListings);
router.put("/update/:id", AuthMiddleware, Authorize("provider"), UpdateListing);
router.delete("/delete/:id", AuthMiddleware, Authorize("provider"), DeleteListing);

// --- ADMIN ROUTES ---
router.get("/admin/all", AuthMiddleware, Authorize("admin"), AdminGetAllListings);
router.patch("/admin/approve/:id", AuthMiddleware, Authorize("admin"), AdminToggleApproval);

module.exports = router;
