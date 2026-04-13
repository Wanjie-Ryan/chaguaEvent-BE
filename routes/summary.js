const express = require("express");
const router = express.Router();
const { GetStats } = require("../controller/summary");
const { AuthMiddleware } = require("../middleware/middleware");

// Verify that handlers are functions before defining routes
if (typeof GetStats !== 'function') {
  console.error('CRITICAL: GetStats is not a function!', GetStats);
}

/**
 * @swagger
 * /api/summary:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 */
router.get("/", AuthMiddleware, GetStats);

module.exports = router;
