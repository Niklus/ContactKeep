const express = require("express");
const router = express.Router();
const { getContacts } = require("../controllers/index.controller");

router.get("/", getContacts);

module.exports = router;
