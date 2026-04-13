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
/**
 * @swagger
 * /api/listings/all:
 *   get:
 *     summary: Get all approved listings (Public)
 *     tags: [Listings]
 *     responses:
 *       200: { description: Success }
 */
router.get("/all", GetApprovedListings);
/**
 * @swagger
 * /api/listings/single/{id}:
 *   get:
 *     summary: Get a single listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get("/single/:id", GetSingleListing);

// --- PROVIDER ROUTES ---
/**
 * @swagger
 * /api/listings/create:
 *   post:
 *     summary: Create a new listing (Provider Only)
 *     tags: [Listings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               location: { type: string }
 *               price: { type: number }
 *     responses:
 *       201: { description: Created }
 */
router.post("/create", AuthMiddleware, Authorize("provider"), CreateListing);
/**
 * @swagger
 * /api/listings/my-listings:
 *   get:
 *     summary: Get all listings owned by the logged-in provider
 *     tags: [Listings]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/my-listings", AuthMiddleware, Authorize("provider"), GetMyListings);
/**
 * @swagger
 * /api/listings/update/{id}:
 *   put:
 *     summary: Update a listing (Ownership enforced)
 *     tags: [Listings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.put("/update/:id", AuthMiddleware, Authorize("provider"), UpdateListing);
/**
 * @swagger
 * /api/listings/delete/{id}:
 *   delete:
 *     summary: Delete a listing (Ownership enforced)
 *     tags: [Listings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete("/delete/:id", AuthMiddleware, Authorize("provider"), DeleteListing);

// --- ADMIN ROUTES ---
/**
 * @swagger
 * /api/listings/admin/all:
 *   get:
 *     summary: "Admin: Get all listings (Approved & Pending)"
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/admin/all", AuthMiddleware, Authorize("admin"), AdminGetAllListings);
/**
 * @swagger
 * /api/listings/admin/approve/{id}:
 *   patch:
 *     summary: "Admin toggles listing approval"
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success }
 */
router.patch("/admin/approve/:id", AuthMiddleware, Authorize("admin"), AdminToggleApproval);

module.exports = router;
