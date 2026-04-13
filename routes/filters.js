const express = require("express");
const router = express.Router();
const { SearchListings } = require("../controller/filter");

/**
 * @swagger
 * /api/filter:
 *   get:
 *     summary: Search and filter listings
 *     tags: [Discovery]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price-high, price-low, category, latest] }
 *     responses:
 *       200: { description: Success }
 */
router.get("/", SearchListings);

module.exports = router;
