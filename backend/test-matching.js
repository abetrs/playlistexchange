/**
 * Test script for session matching functionality
 * This script tests the new similarity metrics and session matching features
 */

const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000";
const API_ENDPOINTS = {
  SESSIONS: `${BASE_URL}/session`,
  SESSION_BY_CODE: (code) => `${BASE_URL}/session/${code}`,
  JOIN_SESSION: (code) => `${BASE_URL}/session/${code}/join`,
  USERS: `${BASE_URL}/user`,
  BUILD_SESSION_TASTE_PROFILES: (sessionCode) =>
    `${BASE_URL}/user/session/${sessionCode}/taste-profiles`,
  COMPUTE_SESSION_MATCHES: (code) => `${BASE_URL}/session/${code}/match`,
  GET_SESSION_MATCHES: (code) => `${BASE_URL}/session/${code}/matches`,
  BUILD_USER_TASTE_PROFILE: (code) => `${BASE_URL}/user/${code}/taste-profile`,
  CALCULATE_USER_COMPATIBILITY: (codeA, codeB) =>
    `${BASE_URL}/user/${codeA}/compatibility/${codeB}`,
};

// Test data - Replace these with real Last.fm usernames for testing
const TEST_USERS = [
  {
    name: "Alice Music Lover",
    lastfmUsername: "abetheunicorn", // Real Last.fm username - replace with others if needed
  },
  {
    name: "Bob Rock Fan",
    lastfmUsername: "TheSpileenMan", // Real Last.fm username - replace with others if needed
  },
  {
    name: "Charlie Jazz Expert",
    lastfmUsername: "RJ", // Replace with real Last.fm username if needed
  },
];

class MatchingTester {
  constructor() {
    this.sessionCode = null;
    this.userCodes = [];
  }

  async log(message, data = null) {
    console.log(`\n🔹 ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async createSession() {
    try {
      this.log("Creating test session...");

      const response = await axios.post(API_ENDPOINTS.SESSIONS, {
        groupName: "Music Matching Test Session",
        groupSize: 5,
      });

      this.sessionCode = response.data.sessionCode;
      this.log("Session created successfully", {
        sessionCode: this.sessionCode,
      });

      return this.sessionCode;
    } catch (error) {
      console.error(
        "❌ Failed to create session:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createUsers() {
    try {
      this.log("Creating test users...");

      for (const userData of TEST_USERS) {
        const response = await axios.post(API_ENDPOINTS.USERS, userData);
        this.userCodes.push(response.data.userCode);
        this.log(`User created: ${userData.name}`, {
          userCode: response.data.userCode,
        });
      }

      return this.userCodes;
    } catch (error) {
      console.error(
        "❌ Failed to create users:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async joinUsersToSession() {
    try {
      this.log("Adding users to session...");

      for (const userCode of this.userCodes) {
        const response = await axios.post(
          API_ENDPOINTS.JOIN_SESSION(this.sessionCode),
          {
            userCode: userCode,
          }
        );
        this.log(`User ${userCode} joined session`, response.data);
      }
    } catch (error) {
      console.error(
        "❌ Failed to join users to session:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async buildTasteProfiles() {
    try {
      this.log("Building taste profiles for all participants...");

      const response = await axios.post(
        API_ENDPOINTS.BUILD_SESSION_TASTE_PROFILES(this.sessionCode)
      );
      this.log("Taste profiles built", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to build taste profiles:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async computeMatches() {
    try {
      this.log("Computing session matches...");

      const response = await axios.post(
        API_ENDPOINTS.COMPUTE_SESSION_MATCHES(this.sessionCode)
      );
      this.log("Matches computed successfully", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to compute matches:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getMatches() {
    try {
      this.log("Retrieving computed matches...");

      const response = await axios.get(
        API_ENDPOINTS.GET_SESSION_MATCHES(this.sessionCode)
      );
      this.log("Matches retrieved", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to get matches:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async testUserCompatibility() {
    if (this.userCodes.length < 2) {
      this.log("⚠️ Need at least 2 users to test compatibility");
      return;
    }

    try {
      this.log("Testing direct user compatibility...");

      const userA = this.userCodes[0];
      const userB = this.userCodes[1];

      const response = await axios.get(
        API_ENDPOINTS.CALCULATE_USER_COMPATIBILITY(userA, userB)
      );
      this.log(`Compatibility between ${userA} and ${userB}`, response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to test user compatibility:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async runFullTest() {
    try {
      console.log("🚀 Starting Playlist Exchange Matching Test Suite");
      console.log("================================================");

      // Step 1: Create session
      await this.createSession();

      // Step 2: Create users
      await this.createUsers();

      // Step 3: Join users to session
      await this.joinUsersToSession();

      // Step 4: Build taste profiles
      await this.buildTasteProfiles();

      // Step 5: Test individual compatibility (optional)
      await this.testUserCompatibility();

      // Step 6: Compute session matches
      await this.computeMatches();

      // Step 7: Retrieve matches
      const matches = await this.getMatches();

      console.log("\n🎉 Test completed successfully!");
      console.log("================================================");
      console.log(`Session Code: ${this.sessionCode}`);
      console.log(
        `Frontend URL: http://localhost:5173/results/${this.sessionCode}`
      );
      console.log("You can view the results in your browser!");

      return {
        sessionCode: this.sessionCode,
        userCodes: this.userCodes,
        matches: matches,
      };
    } catch (error) {
      console.error("\n❌ Test failed:", error.message);
      console.log("\nMake sure:");
      console.log("1. Backend server is running on http://localhost:3000");
      console.log("2. Last.fm API credentials are configured in .env");
      console.log(
        "3. Test users have valid Last.fm usernames with listening history"
      );
      console.log("4. Firebase/Firestore is properly configured");
      throw error;
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new MatchingTester();

  tester
    .runFullTest()
    .then((result) => {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Tests failed:", error.message);
      process.exit(1);
    });
}

module.exports = MatchingTester;
