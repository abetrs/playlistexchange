
const express = require('express');
const lastfmController = require('../controllers/lastfm.controller');

const router = express.Router();

router.get('/top-artists/:user', lastfmController.getTopArtists);

module.exports = router;
