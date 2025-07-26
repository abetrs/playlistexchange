const express = require("express");
const lastfmController = require("../controllers/lastfm.controller");

const router = express.Router();

// User data endpoints
router.get("/top-artists/:user", lastfmController.getTopArtists);
router.get("/top-albums/:user", lastfmController.getTopAlbums);
router.get("/top-tracks/:user", lastfmController.getTopTracks);
router.get("/user/:user", lastfmController.getUserInfo);

module.exports = router;
