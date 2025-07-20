const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/lastfm", authController.initiateLastfmAuth);
router.get("/lastfm/callback", authController.handleLastfmCallback);

module.exports = router;
