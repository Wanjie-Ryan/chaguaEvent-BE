const express = require("express");
const router = express.Router();
const { SearchListings } = require("../controller/filter");

router.get("/", SearchListings);

module.exports = router;
