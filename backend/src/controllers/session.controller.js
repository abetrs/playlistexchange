const { db } = require("../firebase"); // Import your Firestore instance
const { v4: uuidv4 } = require("uuid"); // A better way to get unique IDs
const admin = require("firebase-admin");
const matchingService = require("../services/matching.service");

const createSession = async (req, res) => {
  try {
    const { groupName, groupSize } = req.body;

    // Validate required fields
    if (!groupName || !groupSize) {
      return res.status(400).json({
        message: "Group name and group size are required",
      });
    }

    // Validate group size is a positive number within limits
    if (isNaN(groupSize) || groupSize <= 0 || groupSize > 20) {
      return res.status(400).json({
        message: "Group size must be between 1 and 20",
      });
    }

    // Generate unique session code
    const sessionCode = uuidv4().substring(0, 6).toUpperCase();

    const sessionData = {
      code: sessionCode,
      name: groupName,
      maxSize: parseInt(groupSize),
      participants: [],
      createdAt: new Date(),
      status: "waiting",
    };

    // Create a new document in the 'sessions' collection
    await db.collection("sessions").doc(sessionCode).set(sessionData);

    res.status(201).json({
      sessionCode,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Failed to create session." });
  }
};

const joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    const { userCode } = req.body;

    // Validate required fields
    if (!userCode) {
      return res.status(400).json({
        message: "User code is required",
      });
    }

    // Check if user exists
    const userRef = db.collection("users").doc(userCode);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userData = userDoc.data();

    const sessionRef = db.collection("sessions").doc(code);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessionData = doc.data();

    // Check if user is already in the session
    const existingParticipant = sessionData.participants.find(
      (p) => p.userCode === userCode
    );
    if (existingParticipant) {
      return res.status(409).json({
        message: "User is already in this session",
      });
    }

    // Check if session is full
    if (sessionData.participants.length >= sessionData.maxSize) {
      return res.status(403).json({
        message: "Session is full",
      });
    }

    // Add the user to the participants array
    await sessionRef.update({
      participants: admin.firestore.FieldValue.arrayUnion({
        userCode: userCode,
        name: userData.name,
        lastfmUsername: userData.lastfmUsername,
        spotifyId: userData.spotifyId,
        joinedAt: new Date(),
      }),
    });

    res.status(200).json({
      message: "Successfully joined session",
      sessionCode: code,
      groupName: sessionData.name,
      currentMembers: sessionData.participants.length + 1,
      totalMembers: sessionData.maxSize,
      user: {
        userCode: userCode,
        name: userData.name,
        lastfmUsername: userData.lastfmUsername,
      },
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ message: "Failed to join session." });
  }
};

const getSession = async (req, res) => {
  try {
    const { code } = req.params;

    // Fetch the session document from Firestore
    const sessionRef = db.collection("sessions").doc(code);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessionData = doc.data();

    res.status(200).json(sessionData);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Failed to fetch session." });
  }
};

const getSessionParticipants = async (req, res) => {
  try {
    const { code } = req.params;

    // Fetch the session document from Firestore
    const sessionRef = db.collection("sessions").doc(code);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessionData = doc.data();
    const participantsList = sessionData.participants || [];

    // Fetch full user data for each participant
    const enrichedParticipants = await Promise.all(
      participantsList.map(async (participant) => {
        try {
          const userRef = db.collection("users").doc(participant.userCode);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            return {
              userCode: participant.userCode,
              name: userData.name,
              avatar: userData.avatar || null,
              lastfmUsername: userData.lastfmUsername,
              spotifyId: userData.spotifyId,
              spotifyConnected: !!userData.spotifyId,
              lastfmConnected: !!userData.lastfmUsername,
              topArtists: userData.profileData?.lastfm?.topArtists || [],
              compatibilityScore: null, // This would be calculated based on music taste matching
              online: true, // This would be determined by real-time presence
              joinedAt: participant.joinedAt,
              profileData: userData.profileData || null,
            };
          } else {
            // If user document doesn't exist, return basic participant data
            return {
              userCode: participant.userCode,
              name: participant.name,
              avatar: null,
              lastfmUsername: participant.lastfmUsername,
              spotifyId: participant.spotifyId,
              spotifyConnected: !!participant.spotifyId,
              lastfmConnected: !!participant.lastfmUsername,
              topArtists: [],
              compatibilityScore: null,
              online: true,
              joinedAt: participant.joinedAt,
              profileData: null,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching user data for ${participant.userCode}:`,
            error
          );
          // Return basic participant data on error
          return {
            userCode: participant.userCode,
            name: participant.name,
            avatar: null,
            lastfmUsername: participant.lastfmUsername,
            spotifyId: participant.spotifyId,
            spotifyConnected: !!participant.spotifyId,
            lastfmConnected: !!participant.lastfmUsername,
            topArtists: [],
            compatibilityScore: null,
            online: true,
            joinedAt: participant.joinedAt,
            profileData: null,
          };
        }
      })
    );

    res.status(200).json({
      participants: enrichedParticipants,
    });
  } catch (error) {
    console.error("Error fetching session participants:", error);
    res.status(500).json({ message: "Failed to fetch session participants." });
  }
};

// Compute matches for session participants
const computeSessionMatches = async (req, res) => {
  try {
    const { code } = req.params;

    console.log(`Starting match computation for session ${code}`);

    const result = await matchingService.computeMatches(code);

    res.status(200).json({
      message: "Session matches computed successfully",
      sessionCode: code,
      ...result,
    });
  } catch (error) {
    console.error("Error computing session matches:", error);

    if (error.message.includes("Session not found")) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (error.message.includes("Need at least 2 users")) {
      return res.status(400).json({
        message: "Need at least 2 participants to compute matches",
      });
    }

    if (error.message.includes("Not enough profiles")) {
      return res.status(400).json({
        message:
          "Not enough taste profiles available. Ensure participants have Last.fm usernames and profiles built.",
        error: "insufficient_profiles",
      });
    }

    res.status(500).json({
      message: "Failed to compute session matches",
      error: error.message,
    });
  }
};

// Get matches for a session
const getSessionMatches = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await matchingService.getSessionMatches(code);

    res.status(200).json({
      sessionCode: code,
      ...result,
    });
  } catch (error) {
    console.error("Error getting session matches:", error);

    if (error.message.includes("Session not found")) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(500).json({
      message: "Failed to get session matches",
      error: error.message,
    });
  }
};

module.exports = {
  createSession,
  joinSession,
  getSession,
  getSessionParticipants,
  computeSessionMatches,
  getSessionMatches,
};
