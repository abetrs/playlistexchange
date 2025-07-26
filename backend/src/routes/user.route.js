const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

// CRUD routes for users
router.post("/", userController.createUser); // POST /user
router.get("/", userController.getAllUsers); // GET /user

// Last.fm integration routes (must come before :code route to avoid conflicts)
router.get("/lastfm/:username", userController.getUserByLastfmUsername); // GET /user/lastfm/:username
router.get("/:code/lastfm", userController.getUserLastfmProfile); // GET /user/:code/lastfm
router.get(
  "/session/:sessionCode/lastfm",
  userController.getSessionLastfmProfiles
); // GET /user/session/:sessionCode/lastfm

// Standard user routes
router.get("/:code", userController.getUserByCode); // GET /user/:code
router.put("/:code", userController.updateUser); // PUT /user/:code
router.delete("/:code", userController.deleteUser); // DELETE /user/:code

module.exports = router;
