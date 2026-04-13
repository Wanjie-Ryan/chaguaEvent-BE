const express = require("express");
const router = express.Router();
const {
  ClientRegister,
  Login,
  AdminLogin,
  AdminCreateProvider,
  AdminVerifyProvider,
  UpdateProfile,
  UpdatePassword,
  UpdateUsername,
  GetLoggedInUser,
} = require("../controller/auth");
const { AuthMiddleware, Authorize } = require("../middleware/middleware");

// --- PUBLIC ROUTES (CLIENTS & PROVIDERS) ---
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new client (Auto-verified)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation Error }
 */
router.post("/register", ClientRegister);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for Clients and Providers
 *     description: Providers cannot login until approved by Admin.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Success }
 *       401: { description: Pending Approval / Unauthorized }
 */
router.post("/login", Login);

// --- ADMIN ROUTES ---
/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin specialized login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Success }
 */
router.post("/admin/login", AdminLogin);

/**
 * @swagger
 * /api/auth/admin/create-provider:
 *   post:
 *     summary: Admin creates a Service Provider (Starts unverified)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 */
router.post("/admin/create-provider", AuthMiddleware, Authorize("admin"), AdminCreateProvider);

/**
 * @swagger
 * /api/auth/admin/verify-provider/{id}:
 *   patch:
 *     summary: Admin manually approves a Service Provider
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Verified successfully }
 */
router.patch("/admin/verify-provider/:id", AuthMiddleware, Authorize("admin"), AdminVerifyProvider);

// --- SHARED PROTECTED ROUTES ---
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently logged in user info
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", AuthMiddleware, GetLoggedInUser);
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               photo: { type: string }
 */
router.put("/profile", AuthMiddleware, UpdateProfile);
/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update password with old password verification
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 */
router.put("/update-password", AuthMiddleware, UpdatePassword);
/**
 * @swagger
 * /api/auth/update-username:
 *   patch:
 *     summary: "Update username (Surgical)"
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newUsername: { type: string }
 */
router.patch("/update-username", AuthMiddleware, UpdateUsername);

module.exports = router;