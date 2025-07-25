const axios = require("axios");
// Don't load dotenv here since it's already loaded in index.js

const API_KEY = process.env.LASTFM_API_KEY;
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

const getTopArtists = async (user) => {
  try {
    console.log("Last.fm API Key:", API_KEY ? "Present" : "Missing");
    console.log("Fetching top artists for user:", user);

    if (!API_KEY) {
      throw new Error("Last.fm API key not configured");
    }

    const response = await axios.get(BASE_URL, {
      params: {
        method: "user.gettopartists",
        user,
        api_key: API_KEY,
        format: "json",
        limit: 10, // Limit results for better performance
      },
    });

    console.log("Last.fm API response status:", response.status);

    // Check if the response contains an error
    if (response.data && response.data.error) {
      console.error("Last.fm API error:", response.data.message);
      throw new Error(`Last.fm API error: ${response.data.message}`);
    }

    // Check if user exists by looking for topartists data
    if (!response.data || !response.data.topartists) {
      console.error("No top artists data found for user:", user);
      throw new Error("User not found or has no listening history");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching top artists from Last.fm:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);

      // Handle specific HTTP errors
      if (error.response.status === 404) {
        throw new Error("Last.fm user not found");
      } else if (error.response.status === 403) {
        throw new Error("Last.fm API access forbidden - check API key");
      }
    }

    throw error;
  }
};

module.exports = {
  getTopArtists,
};
