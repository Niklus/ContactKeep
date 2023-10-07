const { body } = require("express-validator");

exports.validateName = body("name")
  .trim()
  .isLength({ min: 3, max: 40 })
  .withMessage("Name must be between 3 and 20 characters");

exports.validatePassword = body("password")
  .trim()
  .isLength({ min: 4, max: 20 })
  .withMessage("Password Must be between 4 and 20 characters");

exports.validateEmail = body("email")
  .trim()
  .normalizeEmail()
  .isEmail()
  .withMessage("Please provide a valid email");
