const express = require("express");
const router = express.Router();
const { CreateTransaction, GetProviderTransactions } = require("../controller/transaction");
const AuthMiddleware = require("../middleware/middleware");

router.post("/", CreateTransaction); // Clients don't need auth to send leads
router.get("/", AuthMiddleware, GetProviderTransactions);

module.exports = router;
