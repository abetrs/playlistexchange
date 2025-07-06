
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const API_KEY = process.env.LASTFM_API_KEY;
const BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

const getTopArtists = async (user) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        method: 'user.gettopartists',
        user,
        api_key: API_KEY,
        format: 'json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top artists from Last.fm:', error);
    throw error;
  }
};

module.exports = {
  getTopArtists,
};
