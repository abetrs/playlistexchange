const lastfmService = require("../services/lastfm.service");

// Get top artists for a user
const getTopArtists = async (req, res) => {
  console.log("DEBUG: getTopArtists controller called");

  try {
    const { user } = req.params;
    const { period = "overall", limit = 10 } = req.query;
    console.log("DEBUG: req.params:", req.params);
    console.log("DEBUG: req.query:", req.query);
    console.log("DEBUG: user parameter:", user);

    if (!user || user.trim() === "") {
      console.log("DEBUG: No user provided");
      return res.status(400).json({
        message: "Username is required",
        error: "missing_username",
      });
    }

    console.log("Controller: Fetching top artists for user:", user);
    const topArtists = await lastfmService.getTopArtists(
      user.trim(),
      period,
      parseInt(limit)
    );
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

// Get top albums for a user
const getTopAlbums = async (req, res) => {
  console.log("DEBUG: getTopAlbums controller called");

  try {
    const { user } = req.params;
    const { period = "overall", limit = 10 } = req.query;
    console.log("DEBUG: req.params:", req.params);
    console.log("DEBUG: req.query:", req.query);
    console.log("DEBUG: user parameter:", user);

    if (!user || user.trim() === "") {
      console.log("DEBUG: No user provided");
      return res.status(400).json({
        message: "Username is required",
        error: "missing_username",
      });
    }

    console.log("Controller: Fetching top albums for user:", user);
    const topAlbums = await lastfmService.getTopAlbums(
      user.trim(),
      period,
      parseInt(limit)
    );
    console.log("Controller: Successfully fetched top albums");
    res.status(200).json(topAlbums);
  } catch (error) {
    console.error("Controller: Error fetching top albums:", error.message);
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
      message: "Error fetching top albums",
      error: "unknown_error",
    });
  }
};

// Get top tracks for a user
const getTopTracks = async (req, res) => {
  console.log("DEBUG: getTopTracks controller called");

  try {
    const { user } = req.params;
    const { period = "overall", limit = 10 } = req.query;
    console.log("DEBUG: req.params:", req.params);
    console.log("DEBUG: req.query:", req.query);
    console.log("DEBUG: user parameter:", user);

    if (!user || user.trim() === "") {
      console.log("DEBUG: No user provided");
      return res.status(400).json({
        message: "Username is required",
        error: "missing_username",
      });
    }

    console.log("Controller: Fetching top tracks for user:", user);
    const topTracks = await lastfmService.getTopTracks(
      user.trim(),
      period,
      parseInt(limit)
    );
    console.log("Controller: Successfully fetched top tracks");
    res.status(200).json(topTracks);
  } catch (error) {
    console.error("Controller: Error fetching top tracks:", error.message);
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
      message: "Error fetching top tracks",
      error: "unknown_error",
    });
  }
};

// Get user info
const getUserInfo = async (req, res) => {
  console.log("DEBUG: getUserInfo controller called");

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

    console.log("Controller: Fetching user info for user:", user);
    const userInfo = await lastfmService.getUserInfo(user.trim());
    console.log("Controller: Successfully fetched user info");
    res.status(200).json(userInfo);
  } catch (error) {
    console.error("Controller: Error fetching user info:", error.message);
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
    }

    res.status(500).json({
      message: "Error fetching user info",
      error: "unknown_error",
    });
  }
};

module.exports = {
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  getUserInfo,
};
