const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

// Get Requests
router.get("/login", usersController.getLogin);
router.get("/signup", usersController.getSignup);
router.get("/signout", usersController.getSignout);

// Post Requests
router.post("/login", usersController.postLogin);
router.post("/signup", usersController.postSignup);

module.exports = router;
