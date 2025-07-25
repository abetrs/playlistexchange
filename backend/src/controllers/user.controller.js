const { db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");

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

module.exports = {
  createUser,
  getUserByCode,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByLastfmUsername,
};
