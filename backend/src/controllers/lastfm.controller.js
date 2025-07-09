
const lastfmService = require('../services/lastfm.service');

// Attach "user" to requests to this function
const getTopArtists = async (req, res) => {
  try {
    const { user } = req.params;
    const topArtists = await lastfmService.getTopArtists(user);
    res.status(200).json(topArtists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top artists' });
  }
};

module.exports = {
  getTopArtists,
};
