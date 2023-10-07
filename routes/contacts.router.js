const express = require("express");
const router = express.Router();
const contactsController = require("../controllers/contacts.controller");

// Get Requests
router.get("/", contactsController.getContacts);
router.get("/add", contactsController.getAddContact);
router.get("/image/:key", contactsController.getContactImage);
router.get("/edit/:key", contactsController.getEditContact);
router.get("/search", contactsController.getSearchContact);

// Post Requests
router.post("/add", contactsController.postAddContact);
router.post("/delete", contactsController.postDeleteContact);
router.post("/search", contactsController.postSearchContact);

// Put
router.post("/edit/:key", contactsController.postUpdateContact);

module.exports = router;
