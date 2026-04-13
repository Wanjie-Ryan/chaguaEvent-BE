const express = require("express");
const router = express.Router();
const {
  CreateReview,
  GetListingReviews,
  GetProviderReviews,
} = require("../controller/review");
const { AuthMiddleware, Authorize } = require("../middleware/middleware");

// --- PUBLIC ROUTES ---
/**
 * @swagger
 * /api/reviews/listing/{listingId}:
 *   get:
 *     summary: Get all reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success }
 */
router.get("/listing/:listingId", GetListingReviews);

// --- CLIENT ROUTES ---
/**
 * @swagger
 * /api/reviews/create:
 *   post:
 *     summary: Client leaves a review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post("/create", AuthMiddleware, Authorize("client"), CreateReview);

// --- PROVIDER ROUTES ---
/**
 * @swagger
 * /api/reviews/my-feedback:
 *   get:
 *     summary: "Provider: Get all reviews received"
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/my-feedback", AuthMiddleware, Authorize("provider"), GetProviderReviews);

module.exports = router;
