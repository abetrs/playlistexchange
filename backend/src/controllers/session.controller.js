const { db } = require("../firebase"); // Import your Firestore instance
const { v4: uuidv4 } = require("uuid"); // A better way to get unique IDs
const admin = require("firebase-admin");

const createSession = async (req, res) => {
  try {
    const { groupName, groupSize } = req.body;

    // Validate required fields
    if (!groupName || !groupSize) {
      return res.status(400).json({
        message: "Group name and group size are required",
      });
    }

    // Validate group size is a positive number
    if (isNaN(groupSize) || groupSize <= 0) {
      return res.status(400).json({
        message: "Group size must be a positive number",
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
    const { userName } = req.body;

    // Validate required fields
    if (!userName) {
      return res.status(400).json({
        message: "User name is required",
      });
    }

    const sessionRef = db.collection("sessions").doc(code);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessionData = doc.data();

    // Check if user is already in the session
    const existingParticipant = sessionData.participants.find(
      (p) => p.name === userName
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

    // Add the new user to the participants array
    await sessionRef.update({
      participants: admin.firestore.FieldValue.arrayUnion({
        name: userName,
        // you can add more user data here later
      }),
    });

    res.status(200).json({
      message: "Successfully joined session",
      sessionCode: code,
      groupName: sessionData.name,
      currentMembers: sessionData.participants.length + 1,
      totalMembers: sessionData.maxSize,
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

    res.status(200).json(sessionData.participants || []);
  } catch (error) {
    console.error("Error fetching session participants:", error);
    res.status(500).json({ message: "Failed to fetch session participants." });
  }
};

module.exports = {
  createSession,
  joinSession,
  getSession,
  getSessionParticipants,
};
