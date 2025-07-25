const lastfmService = require("../services/lastfm.service");

// Attach "user" to requests to this function
const getTopArtists = async (req, res) => {
  console.log("DEBUG: getTopArtists controller called");

  try {
    const { user } = req.params;
    console.log("DEBUG: req.params:", req.params);
    console.log("DEBUG: user parameter:", user);

    if (!user || user.trim() === "") {
      console.log("DEBUG: No user provided");
      return res.status(400).json({
        message: "Username is required",
        error: "missing_username",
      });
    }

    console.log("Controller: Fetching top artists for user:", user);
    const topArtists = await lastfmService.getTopArtists(user.trim());
    console.log("Controller: Successfully fetched top artists");
    res.status(200).json(topArtists);
  } catch (error) {
    console.error("Controller: Error fetching top artists:", error.message);
    console.error("Controller: Full error:", error);

    // Return more specific error messages
    if (error.message.includes("not found")) {
      return res.status(404).json({
        message: "Last.fm user not found",
        error: "user_not_found",
      });
    } else if (error.message.includes("API key")) {
      return res.status(500).json({
        message: "Last.fm API configuration error",
        error: "api_config_error",
      });
    } else if (error.message.includes("no listening history")) {
      return res.status(404).json({
        message: "User has no listening history",
        error: "no_data",
      });
    }

    res.status(500).json({
      message: "Error fetching top artists",
      error: "unknown_error",
    });
  }
};

module.exports = {
  getTopArtists,
};
