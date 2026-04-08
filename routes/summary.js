const express = require("express");
const router = express.Router();
const { GetStats } = require("../controller/summary");
const AuthMiddleware = require("../middleware/middleware");

router.get("/", AuthMiddleware, GetStats);

module.exports = router;
