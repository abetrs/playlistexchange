const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

// CRUD routes for users
router.post("/", userController.createUser); // POST /user
router.get("/", userController.getAllUsers); // GET /user
router.get("/:code", userController.getUserByCode); // GET /user/:code
router.put("/:code", userController.updateUser); // PUT /user/:code
router.delete("/:code", userController.deleteUser); // DELETE /user/:code

// Special routes
router.get("/lastfm/:username", userController.getUserByLastfmUsername); // GET /user/lastfm/:username

module.exports = router;
