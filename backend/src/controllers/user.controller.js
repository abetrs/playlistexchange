const { db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const lastfmService = require("../services/lastfm.service");
const matchingService = require("../services/matching.service");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, lastfmUsername, spotifyId } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "User name is required",
      });
    }

    // Generate unique user code
    const userCode = uuidv4().substring(0, 8).toUpperCase();

    const userData = {
      code: userCode,
      name: name,
      lastfmUsername: lastfmUsername || null,
      spotifyId: spotifyId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileData: {
        lastfm: null,
        spotify: null,
      },
    };

    // Create a new document in the 'users' collection
    await db.collection("users").doc(userCode).set(userData);

    res.status(201).json({
      userCode,
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user." });
  }
};

// Get user by code
const getUserByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const userRef = db.collection("users").doc(code);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = doc.data();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { code } = req.params;
    const { name, lastfmUsername, spotifyId, profileData } = req.body;

    const userRef = db.collection("users").doc(code);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (lastfmUsername !== undefined)
      updateData.lastfmUsername = lastfmUsername;
    if (spotifyId !== undefined) updateData.spotifyId = spotifyId;
    if (profileData !== undefined) updateData.profileData = profileData;

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    res.status(200).json({
      message: "User updated successfully",
      user: updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user." });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { code } = req.params;

    const userRef = db.collection("users").doc(code);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.delete();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

// Get all users (for admin purposes)
const getAllUsers = async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// Find user by Last.fm username
const getUserByLastfmUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("lastfmUsername", "==", username)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "User with this Last.fm username not found" });
    }

    const user = snapshot.docs[0].data();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user by Last.fm username:", error);
    res.status(500).json({ message: "Failed to find user." });
  }
};

// Get user's Last.fm profile data by user code
const getUserLastfmProfile = async (req, res) => {
  try {
    const { code } = req.params;
    const { dataType = "artists", period = "overall", limit = 10 } = req.query;

    // Get user from database
    const userDoc = await db.collection("users").doc(code).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDoc.data();

    if (!user.lastfmUsername) {
      return res.status(400).json({
        message: "User has no Last.fm username configured",
        error: "no_lastfm_username",
      });
    }

    let lastfmData;
    try {
      // Fetch data from Last.fm based on type
      switch (dataType) {
        case "artists":
          lastfmData = await lastfmService.getTopArtists(
            user.lastfmUsername,
            period,
            parseInt(limit)
          );
          break;
        case "albums":
          lastfmData = await lastfmService.getTopAlbums(
            user.lastfmUsername,
            period,
            parseInt(limit)
          );
          break;
        case "tracks":
          lastfmData = await lastfmService.getTopTracks(
            user.lastfmUsername,
            period,
            parseInt(limit)
          );
          break;
        case "info":
          lastfmData = await lastfmService.getUserInfo(user.lastfmUsername);
          break;
        default:
          return res.status(400).json({
            message: "Invalid data type. Use: artists, albums, tracks, or info",
            error: "invalid_data_type",
          });
      }

      res.status(200).json({
        user: {
          code: user.code,
          name: user.name,
          lastfmUsername: user.lastfmUsername,
        },
        dataType,
        period: dataType !== "info" ? period : undefined,
        limit: dataType !== "info" ? parseInt(limit) : undefined,
        lastfmData,
      });
    } catch (lastfmError) {
      console.error("Error fetching Last.fm data:", lastfmError.message);

      if (lastfmError.message.includes("not found")) {
        return res.status(404).json({
          message: "Last.fm user not found",
          error: "lastfm_user_not_found",
          user: {
            code: user.code,
            name: user.name,
            lastfmUsername: user.lastfmUsername,
          },
        });
      }

      return res.status(500).json({
        message: "Error fetching Last.fm data",
        error: "lastfm_api_error",
        details: lastfmError.message,
      });
    }
  } catch (error) {
    console.error("Error getting user Last.fm profile:", error);
    res.status(500).json({ message: "Failed to get user Last.fm profile." });
  }
};

// Get Last.fm profile data for all participants in a session
const getSessionLastfmProfiles = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { dataType = "artists", period = "overall", limit = 5 } = req.query;

    // Get session from database
    const sessionDoc = await db.collection("sessions").doc(sessionCode).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const session = sessionDoc.data();
    const participants = session.participants || [];

    if (participants.length === 0) {
      return res.status(200).json({
        session: {
          code: session.code,
          name: session.name,
        },
        participants: [],
        dataType,
        period: dataType !== "info" ? period : undefined,
        limit: dataType !== "info" ? parseInt(limit) : undefined,
      });
    }

    // Fetch Last.fm data for each participant
    const participantProfiles = await Promise.allSettled(
      participants.map(async (participant) => {
        if (!participant.lastfmUsername) {
          return {
            user: {
              code: participant.userCode,
              name: participant.name,
              lastfmUsername: null,
            },
            error: "no_lastfm_username",
            lastfmData: null,
          };
        }

        try {
          let lastfmData;
          switch (dataType) {
            case "artists":
              lastfmData = await lastfmService.getTopArtists(
                participant.lastfmUsername,
                period,
                parseInt(limit)
              );
              break;
            case "albums":
              lastfmData = await lastfmService.getTopAlbums(
                participant.lastfmUsername,
                period,
                parseInt(limit)
              );
              break;
            case "tracks":
              lastfmData = await lastfmService.getTopTracks(
                participant.lastfmUsername,
                period,
                parseInt(limit)
              );
              break;
            case "info":
              lastfmData = await lastfmService.getUserInfo(
                participant.lastfmUsername
              );
              break;
            default:
              throw new Error("Invalid data type");
          }

          return {
            user: {
              code: participant.userCode,
              name: participant.name,
              lastfmUsername: participant.lastfmUsername,
            },
            lastfmData,
          };
        } catch (lastfmError) {
          return {
            user: {
              code: participant.userCode,
              name: participant.name,
              lastfmUsername: participant.lastfmUsername,
            },
            error: lastfmError.message.includes("not found")
              ? "lastfm_user_not_found"
              : "lastfm_api_error",
            lastfmData: null,
          };
        }
      })
    );

    // Process results
    const results = participantProfiles.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          user: { code: "unknown", name: "unknown", lastfmUsername: null },
          error: "processing_error",
          lastfmData: null,
        };
      }
    });

    res.status(200).json({
      session: {
        code: session.code,
        name: session.name,
      },
      participants: results,
      dataType,
      period: dataType !== "info" ? period : undefined,
      limit: dataType !== "info" ? parseInt(limit) : undefined,
    });
  } catch (error) {
    console.error("Error getting session Last.fm profiles:", error);
    res
      .status(500)
      .json({ message: "Failed to get session Last.fm profiles." });
  }
};

// Build and store taste profile for a user
const buildUserTasteProfile = async (req, res) => {
  try {
    const { code } = req.params;
    const { forceRefresh = false } = req.query;

    console.log(
      `Building taste profile for user ${code}, forceRefresh: ${forceRefresh}`
    );

    // Check for cached profile first (unless force refresh)
    if (!forceRefresh) {
      const cachedProfile = await matchingService.getCachedTasteProfile(code);
      if (cachedProfile) {
        return res.status(200).json({
          message: "Taste profile retrieved from cache",
          profile: cachedProfile,
          cached: true,
        });
      }
    }

    // Build new taste profile
    const profile = await matchingService.buildTasteProfile(code);

    // Store the profile in Firestore
    await matchingService.storeTasteProfile(code, profile);

    res.status(200).json({
      message: "Taste profile built and stored successfully",
      profile: profile,
      cached: false,
    });
  } catch (error) {
    console.error("Error building user taste profile:", error);

    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "User not found" });
    }

    if (error.message.includes("No Last.fm data")) {
      return res.status(400).json({
        message:
          "Cannot build taste profile: No Last.fm username configured for user",
        error: "no_lastfm_data",
      });
    }

    res.status(500).json({
      message: "Failed to build taste profile",
      error: error.message,
    });
  }
};

// Get taste profile for a user
const getUserTasteProfile = async (req, res) => {
  try {
    const { code } = req.params;

    // Try to get cached profile first
    const cachedProfile = await matchingService.getCachedTasteProfile(code);

    if (cachedProfile) {
      return res.status(200).json({
        message: "Taste profile retrieved",
        profile: cachedProfile,
        cached: true,
      });
    }

    // No cached profile available
    res.status(404).json({
      message: "No taste profile found for user. Build profile first.",
      suggestion: `POST /user/${code}/taste-profile to build profile`,
    });
  } catch (error) {
    console.error("Error getting user taste profile:", error);

    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({
      message: "Failed to get taste profile",
      error: error.message,
    });
  }
};

// Calculate compatibility between two users
const calculateUserCompatibility = async (req, res) => {
  try {
    const { codeA, codeB } = req.params;

    console.log(
      `Calculating compatibility between users ${codeA} and ${codeB}`
    );

    // Get taste profiles for both users
    const profileA = await matchingService.getCachedTasteProfile(codeA);
    const profileB = await matchingService.getCachedTasteProfile(codeB);

    if (!profileA) {
      return res.status(400).json({
        message: `No taste profile found for user ${codeA}. Build profile first.`,
        missingProfile: codeA,
      });
    }

    if (!profileB) {
      return res.status(400).json({
        message: `No taste profile found for user ${codeB}. Build profile first.`,
        missingProfile: codeB,
      });
    }

    // Calculate compatibility
    const compatibility = matchingService.calculateCompatibility(
      profileA,
      profileB
    );

    res.status(200).json({
      message: "Compatibility calculated successfully",
      compatibility: compatibility,
    });
  } catch (error) {
    console.error("Error calculating user compatibility:", error);

    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    res.status(500).json({
      message: "Failed to calculate compatibility",
      error: error.message,
    });
  }
};

// Build taste profiles for all users in a session
const buildSessionTasteProfiles = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { forceRefresh = false } = req.query;

    console.log(
      `Building taste profiles for session ${sessionCode}, forceRefresh: ${forceRefresh}`
    );

    // Get session participants
    const sessionDoc = await db.collection("sessions").doc(sessionCode).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const session = sessionDoc.data();
    const participantCodes = session.participants || [];

    if (participantCodes.length === 0) {
      return res.status(400).json({ message: "No participants in session" });
    }

    const results = [];
    const errors = [];

    // Build profile for each participant
    for (const userCode of participantCodes) {
      try {
        let profile;

        // Check for cached profile first (unless force refresh)
        if (!forceRefresh) {
          profile = await matchingService.getCachedTasteProfile(userCode);
        }

        if (!profile) {
          // Build new profile
          profile = await matchingService.buildTasteProfile(userCode);
          await matchingService.storeTasteProfile(userCode, profile);
        }

        results.push({
          userCode,
          userName: profile.userName,
          success: true,
          profileMetadata: profile.metadata,
          cached: !forceRefresh && profile.metadata,
        });
      } catch (error) {
        console.error(
          `Failed to build profile for user ${userCode}:`,
          error.message
        );
        errors.push({
          userCode,
          error: error.message,
          success: false,
        });
      }
    }

    res.status(200).json({
      message: "Session taste profiles processing completed",
      session: {
        code: sessionCode,
        name: session.name,
        participantCount: participantCodes.length,
      },
      results: results,
      errors: errors,
      summary: {
        successful: results.length,
        failed: errors.length,
        total: participantCodes.length,
      },
    });
  } catch (error) {
    console.error("Error building session taste profiles:", error);
    res.status(500).json({
      message: "Failed to build session taste profiles",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUserByCode,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByLastfmUsername,
  getUserLastfmProfile,
  getSessionLastfmProfiles,
  buildUserTasteProfile,
  getUserTasteProfile,
  calculateUserCompatibility,
  buildSessionTasteProfiles,
};
