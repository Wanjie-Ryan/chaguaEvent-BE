const express = require("express");
const router = express.Router();
const {
  ClientRegister,
  Login,
  AdminLogin,
  AdminCreateProvider,
  UpdateProfile,
  UpdatePassword,
  UpdateUsername,
  GetLoggedInUser,
} = require("../controller/auth");
const { AuthMiddleware, Authorize } = require("../middleware/middleware");

// --- PUBLIC ROUTES (CLIENTS & PROVIDERS) ---
router.post("/register", ClientRegister);
router.post("/login", Login);

// --- ADMIN ROUTES ---
router.post("/admin/login", AdminLogin);
router.post("/admin/create-provider", AuthMiddleware, Authorize("admin"), AdminCreateProvider);

// --- SHARED PROTECTED ROUTES ---
router.get("/me", AuthMiddleware, GetLoggedInUser);
router.put("/profile", AuthMiddleware, UpdateProfile);

// Specific self-management for Providers/Clients
router.put("/update-password", AuthMiddleware, UpdatePassword);
router.patch("/update-username", AuthMiddleware, UpdateUsername);

module.exports = router;