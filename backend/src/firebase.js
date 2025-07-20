const admin = require("firebase-admin");

// Make sure to have the serviceAccountKey.json in your backend directory
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
