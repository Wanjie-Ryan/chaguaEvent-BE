const express = require("express");
const router = express.Router();
const {
  Register,
  Login,
  UpdateProfile,
  GetLoggedInUser,
  verifyToken,
} = require("../controller/auth");
const AuthMiddleware = require("../middleware/middleware");

router.route("/register").post(Register);
router.route("/login").post(Login);
router.route("/updateprofile").put(AuthMiddleware, UpdateProfile);
router.route("/getLoggedInUser").get(AuthMiddleware, GetLoggedInUser);
router.route("/verify").get(AuthMiddleware, verifyToken);

module.exports = router;