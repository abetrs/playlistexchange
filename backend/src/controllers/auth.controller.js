const axios = require("axios");
const crypto = require("crypto");
const { db } = require("../firebase");
const admin = require("firebase-admin");
require("dotenv").config();

const initiateLastfmAuth = async (req, res) => {
  try {
    const apiKey = process.env.LASTFM_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Last.fm API key not configured",
      });
    }

    // Build the Last.fm authorization URL
    const authUrl = `http://www.last.fm/api/auth/?api_key=${apiKey}`;

    console.log("Initiating Last.fm authentication...");
    console.log("Auth URL:", authUrl);

    // Return the auth URL for the frontend to redirect to
    res.status(200).json({
      message: "Last.fm authentication URL generated",
      authUrl: authUrl,
      success: true,
    });
  } catch (error) {
    console.error("Error initiating Last.fm authentication:", error);
    res
      .status(500)
      .json({ message: "Failed to initiate Last.fm authentication." });
  }
};

const handleLastfmCallback = async (req, res) => {
  try {
    const { token } = req.query;
    const apiKey = process.env.LASTFM_API_KEY;
    const apiSecret = process.env.LASTFM_API_SECRET;

    if (!token) {
      return res.status(400).json({
        message: "No token received from Last.fm",
      });
    }

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        message: "Last.fm API credentials not configured",
      });
    }

    console.log("Handling Last.fm callback...");
    console.log("Received token:", token);

    // Create API signature for auth.getSession
    const method = "auth.getSession";
    const params = {
      method: method,
      api_key: apiKey,
      token: token,
    };

    // Sort parameters alphabetically and create signature string
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join("");

    const apiSig = crypto
      .createHash("md5")
      .update(sortedParams + apiSecret)
      .digest("hex");

    // Make request to get session key
    const response = await axios.post(
      "http://ws.audioscrobbler.com/2.0/",
      null,
      {
        params: {
          ...params,
          api_sig: apiSig,
          format: "json",
        },
      }
    );

    console.log("Last.fm session response:", response.data);

    if (response.data.session) {
      const sessionKey = response.data.session.key;
      const userInfo = response.data.session;

      console.log("Successfully authenticated with Last.fm!");
      console.log("Session key:", sessionKey);
      console.log("User info:", userInfo);

      // Save user data to Firestore
      try {
        const lastfmUsername = userInfo.name;
        const userRef = db.collection("users").doc(lastfmUsername);
        const userDoc = await userRef.get();

        const userData = {
          lastfmUsername: lastfmUsername,
          sessionKey: sessionKey,
          realName: userInfo.realname || "",
          url: userInfo.url || "",
          country: userInfo.country || "",
          age: userInfo.age || "",
          gender: userInfo.gender || "",
          subscriber: userInfo.subscriber || "0",
          playcount: userInfo.playcount || "0",
          playlists: userInfo.playlists || "0",
          bootstrap: userInfo.bootstrap || "0",
          registered: userInfo.registered
            ? {
                unixtime: userInfo.registered.unixtime,
                text: userInfo.registered["#text"],
              }
            : null,
          updatedAt: new Date(),
        };

        if (userDoc.exists) {
          // User exists, update their profile with new information
          console.log(`Updating existing user: ${lastfmUsername}`);
          await userRef.update(userData);
        } else {
          // User doesn't exist, create new document
          console.log(`Creating new user: ${lastfmUsername}`);
          userData.createdAt = new Date();
          await userRef.set(userData);
        }

        console.log("User data saved to Firestore successfully");

        // Return JSON response with success and user data
        res.status(200).json({
          message: "Successfully authenticated with Last.fm",
          success: true,
          user: {
            lastfmUsername: lastfmUsername,
            realName: userData.realName,
            url: userData.url,
            country: userData.country,
            playcount: userData.playcount,
          },
        });
      } catch (firestoreError) {
        console.error("Error saving user data to Firestore:", firestoreError);
        res.status(500).json({
          message: "Failed to save user data to database",
          success: false,
          error: "database_error",
        });
      }
    } else {
      console.error("Failed to get session from Last.fm:", response.data);
      res.status(400).json({
        message: "Failed to authenticate with Last.fm",
        success: false,
        error: "session_error",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("Error handling Last.fm callback:", error);
    res.status(500).json({
      message: "Failed to handle Last.fm callback",
      success: false,
      error: "server_error",
    });
  }
};

module.exports = {
  initiateLastfmAuth,
  handleLastfmCallback,
};
