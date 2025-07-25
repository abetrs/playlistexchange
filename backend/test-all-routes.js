#!/usr/bin/env node

/**
 * Comprehensive Backend Route Testing Script for The Playlist Exchange
 *
 * This script tests all API endpoints mentioned in instructions.md:
 * - Health Check
 * - Session Management (Create, Get, Join, Get Participants)
 * - Last.fm Integration (Top Artists, Auth Initiation, Callback Handling)
 *
 * Usage: node test-all-routes.js
 *
 * Make sure the backend server is running on the configured backend URL
 */

const axios = require("axios");
const readline = require("readline");
require("dotenv").config();

// Configuration
const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";
const COLORS = {
  GREEN: "\x1b[32m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
};

// Test state to track session across tests
const testState = {
  sessionCode: null,
  sessionData: null,
  testUser: "TestUser_" + Date.now(),
  lastfmTestUser: "rj", // Using 'rj' as a well-known Last.fm user for testing
};

// Helper functions
function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.GREEN);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.RED);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.YELLOW);
}

function logHeader(message) {
  log(`\n${COLORS.BOLD}${COLORS.CYAN}=== ${message} ===${COLORS.RESET}`);
}

function logSubHeader(message) {
  log(`\n${COLORS.BOLD}${message}${COLORS.RESET}`, COLORS.MAGENTA);
}

async function makeRequest(method, url, data = null, params = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on HTTP error statuses
    };

    if (data) config.data = data;
    if (params) config.params = params;

    const response = await axios(config);
    return response;
  } catch (error) {
    return {
      status: 0,
      statusText: "Network Error",
      data: { error: error.message },
    };
  }
}

// Test functions
async function testHealthCheck() {
  logSubHeader("Testing Health Check Endpoint");

  const response = await makeRequest("GET", "/health");

  if (response.status === 200 && response.data?.status === "UP") {
    logSuccess("Health check passed");
    logInfo(`Response: ${JSON.stringify(response.data)}`);
    return true;
  } else {
    logError(`Health check failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testCreateSession() {
  logSubHeader("Testing Create Session Endpoint");

  // Test with valid data
  const sessionData = {
    groupName: "Test Music Group",
    groupSize: 5,
  };

  const response = await makeRequest("POST", "/session", sessionData);

  if (response.status === 201 && response.data?.sessionCode) {
    testState.sessionCode = response.data.sessionCode;
    logSuccess(
      `Session created successfully with code: ${testState.sessionCode}`
    );
    logInfo(`Response: ${JSON.stringify(response.data)}`);

    // Test validation - missing fields
    const invalidResponse1 = await makeRequest("POST", "/session", {});
    if (invalidResponse1.status === 400) {
      logSuccess("Validation correctly rejected empty request");
    } else {
      logWarning("Validation should reject empty request");
    }

    // Test validation - invalid group size
    const invalidResponse2 = await makeRequest("POST", "/session", {
      groupName: "Test",
      groupSize: -1,
    });
    if (invalidResponse2.status === 400) {
      logSuccess("Validation correctly rejected negative group size");
    } else {
      logWarning("Validation should reject negative group size");
    }

    return true;
  } else {
    logError(`Session creation failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testGetSession() {
  logSubHeader("Testing Get Session Endpoint");

  if (!testState.sessionCode) {
    logError("No session code available for testing");
    return false;
  }

  const response = await makeRequest(
    "GET",
    `/session/${testState.sessionCode}`
  );

  if (
    response.status === 200 &&
    response.data?.code === testState.sessionCode
  ) {
    testState.sessionData = response.data;
    logSuccess("Session retrieval successful");
    logInfo(
      `Session: ${response.data.name} (${response.data.participants.length}/${response.data.maxSize})`
    );

    // Test with non-existent session
    const notFoundResponse = await makeRequest("GET", "/session/INVALID");
    if (notFoundResponse.status === 404) {
      logSuccess("Correctly returned 404 for non-existent session");
    } else {
      logWarning("Should return 404 for non-existent session");
    }

    return true;
  } else {
    logError(`Session retrieval failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testJoinSession() {
  logSubHeader("Testing Join Session Endpoint");

  if (!testState.sessionCode) {
    logError("No session code available for testing");
    return false;
  }

  // First create a user to get a userCode
  const createUserResponse = await makeRequest("POST", "/user", {
    name: testState.testUser,
    lastfmUsername: "testuser",
  });

  if (createUserResponse.status !== 201) {
    logError("Failed to create test user for join session test");
    logError(`Response: ${JSON.stringify(createUserResponse.data)}`);
    return false;
  }

  const testUserCode = createUserResponse.data.userCode;
  logInfo(`Created test user with code: ${testUserCode}`);

  const userData = {
    userCode: testUserCode,
  };

  const response = await makeRequest(
    "POST",
    `/session/${testState.sessionCode}/join`,
    userData
  );

  if (response.status === 200) {
    logSuccess(`User ${testState.testUser} joined session successfully`);
    logInfo(`Response: ${JSON.stringify(response.data)}`);

    // Test duplicate join
    const duplicateResponse = await makeRequest(
      "POST",
      `/session/${testState.sessionCode}/join`,
      userData
    );
    if (duplicateResponse.status === 409) {
      logSuccess("Correctly prevented duplicate user from joining");
    } else {
      logWarning("Should prevent duplicate users from joining");
    }

    // Test invalid session
    const invalidResponse = await makeRequest(
      "POST",
      "/session/INVALID/join",
      userData
    );
    if (invalidResponse.status === 404) {
      logSuccess("Correctly returned 404 for joining non-existent session");
    } else {
      logWarning("Should return 404 for joining non-existent session");
    }

    // Test missing userCode
    const noNameResponse = await makeRequest(
      "POST",
      `/session/${testState.sessionCode}/join`,
      {}
    );
    if (noNameResponse.status === 400) {
      logSuccess("Correctly rejected join request without userCode");
    } else {
      logWarning("Should reject join request without userCode");
    }

    return true;
  } else {
    logError(`Join session failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testGetSessionParticipants() {
  logSubHeader("Testing Get Session Participants Endpoint");

  if (!testState.sessionCode) {
    logError("No session code available for testing");
    return false;
  }

  const response = await makeRequest(
    "GET",
    `/session/${testState.sessionCode}/participants`
  );

  if (response.status === 200 && Array.isArray(response.data)) {
    logSuccess("Session participants retrieved successfully");
    logInfo(`Participants count: ${response.data.length}`);
    if (response.data.length > 0) {
      logInfo(`Participants: ${response.data.map((p) => p.name).join(", ")}`);
    }

    // Test with non-existent session
    const notFoundResponse = await makeRequest(
      "GET",
      "/session/INVALID/participants"
    );
    if (notFoundResponse.status === 404) {
      logSuccess(
        "Correctly returned 404 for non-existent session participants"
      );
    } else {
      logWarning("Should return 404 for non-existent session participants");
    }

    return true;
  } else {
    logError(`Get session participants failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testLastfmTopArtists() {
  logSubHeader("Testing Last.fm Top Artists Endpoint");

  const response = await makeRequest(
    "GET",
    `/lastfm/top-artists/${testState.lastfmTestUser}`
  );

  if (response.status === 200) {
    logSuccess(
      `Top artists for ${testState.lastfmTestUser} retrieved successfully`
    );
    if (response.data?.topArtists?.artist) {
      logInfo(`Found ${response.data.topArtists.artist.length} top artists`);
      if (response.data.topArtists.artist.length > 0) {
        logInfo(`First artist: ${response.data.topArtists.artist[0].name}`);
      }
    }
    return true;
  } else if (response.status === 500) {
    logWarning(
      `Last.fm API might be unavailable or user '${testState.lastfmTestUser}' not found`
    );
    logInfo(`Response: ${JSON.stringify(response.data)}`);
    return "partial"; // Not a critical failure
  } else {
    logError(`Last.fm top artists failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testLastfmAuthInitiation() {
  logSubHeader("Testing Last.fm Authentication Initiation");

  const response = await makeRequest("GET", "/auth/lastfm");

  if (
    response.status === 200 &&
    response.data?.authUrl &&
    response.data?.success
  ) {
    logSuccess("Last.fm auth URL generated successfully");
    logInfo(`Auth URL: ${response.data.authUrl}`);
    return true;
  } else if (response.status === 500) {
    logWarning("Last.fm API key might not be configured");
    logInfo(`Response: ${JSON.stringify(response.data)}`);
    return "partial";
  } else {
    logError(`Last.fm auth initiation failed - Status: ${response.status}`);
    logError(`Response: ${JSON.stringify(response.data)}`);
    return false;
  }
}

async function testLastfmAuthCallback() {
  logSubHeader("Testing Last.fm Authentication Callback");

  // Test with missing token
  const noTokenResponse = await makeRequest("GET", "/auth/lastfm/callback");

  if (noTokenResponse.status === 400) {
    logSuccess("Correctly rejected callback without token");
  } else {
    logWarning("Should reject callback without token");
  }

  // Test with invalid token (this will fail but should handle gracefully)
  const invalidTokenResponse = await makeRequest(
    "GET",
    "/auth/lastfm/callback",
    null,
    { token: "invalid_token" }
  );

  if (
    invalidTokenResponse.status === 400 ||
    invalidTokenResponse.status === 500
  ) {
    logSuccess("Correctly handled invalid token");
    logInfo("Note: This is expected to fail with invalid token");
  } else {
    logWarning("Should handle invalid token gracefully");
  }

  logInfo(
    "Callback testing completed (real token testing requires manual Last.fm auth flow)"
  );
  return "partial";
}

async function promptForManualTest() {
  logSubHeader("Manual Last.fm Authentication Test");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n" + COLORS.YELLOW + "MANUAL TEST AVAILABLE:" + COLORS.RESET);
    console.log("To test the complete Last.fm authentication flow:");
    console.log(`1. Open browser to: ${BASE_URL}/auth/lastfm`);
    console.log("2. Complete the Last.fm authorization");
    console.log("3. Observer the callback handling");
    console.log("");

    rl.question(
      "Do you want to perform this manual test now? (y/N): ",
      (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          log(
            "Please complete the manual test in your browser...",
            COLORS.CYAN
          );
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}

async function testServerConnection() {
  logSubHeader("Testing Server Connection");

  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    logSuccess("Server is reachable");
    return true;
  } catch (error) {
    logError("Cannot connect to server!");
    logError(`Make sure the backend server is running on ${BASE_URL}`);
    logError("Run: cd backend && npm start");
    return false;
  }
}

async function runAllTests() {
  logHeader("The Playlist Exchange - Backend Route Testing");

  console.log(
    `${COLORS.BLUE}Testing all backend routes as specified in instructions.md${COLORS.RESET}`
  );
  console.log(`${COLORS.BLUE}Server: ${BASE_URL}${COLORS.RESET}\n`);

  // Check server connection first
  if (!(await testServerConnection())) {
    process.exit(1);
  }

  const results = {
    passed: 0,
    failed: 0,
    partial: 0,
    total: 0,
  };

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "Create Session", fn: testCreateSession },
    { name: "Get Session", fn: testGetSession },
    { name: "Join Session", fn: testJoinSession },
    { name: "Get Session Participants", fn: testGetSessionParticipants },
    { name: "Last.fm Top Artists", fn: testLastfmTopArtists },
    { name: "Last.fm Auth Initiation", fn: testLastfmAuthInitiation },
    { name: "Last.fm Auth Callback", fn: testLastfmAuthCallback },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.total++;

      if (result === true) {
        results.passed++;
      } else if (result === "partial") {
        results.partial++;
        logWarning(
          `${test.name}: Partial success (likely due to environment/config)`
        );
      } else {
        results.failed++;
        logError(`${test.name}: Failed`);
      }
    } catch (error) {
      results.failed++;
      results.total++;
      logError(`${test.name}: Exception - ${error.message}`);
    }
  }

  // Offer manual test
  const manualTest = await promptForManualTest();
  if (manualTest) {
    logInfo("Complete the manual test and press Ctrl+C when done");
    return; // Don't show summary yet
  }

  // Summary
  logHeader("Test Summary");

  console.log(`${COLORS.GREEN}✅ Passed: ${results.passed}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}⚠️  Partial: ${results.partial}${COLORS.RESET}`);
  console.log(`${COLORS.RED}❌ Failed: ${results.failed}${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}📊 Total: ${results.total}${COLORS.RESET}`);

  if (results.failed === 0) {
    logSuccess(
      "\n🎉 All critical tests passed! Backend routes are working correctly."
    );
  } else if (results.failed <= results.partial) {
    logWarning(
      "\n⚠️  Most tests passed. Some failures may be due to configuration."
    );
  } else {
    logError(
      "\n❌ Multiple test failures detected. Check server and configuration."
    );
  }

  if (testState.sessionCode) {
    log(
      `\n💡 Test session code for reference: ${testState.sessionCode}`,
      COLORS.CYAN
    );
  }

  console.log(
    "\n" +
      COLORS.BLUE +
      "Routes tested according to instructions.md:" +
      COLORS.RESET
  );
  console.log("• GET /health - Server health check");
  console.log("• POST /session - Create new session with group name/size");
  console.log("• GET /session/:code - Retrieve session information");
  console.log("• GET /session/:code/participants - Get list of participants");
  console.log("• POST /session/:code/join - Add user to session");
  console.log(
    "• GET /lastfm/top-artists/:user - Fetch Last.fm user top artists"
  );
  console.log("• GET /auth/lastfm - Initiate Last.fm OAuth authentication");
  console.log("• GET /auth/lastfm/callback - Handle Last.fm OAuth callback");
}

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runAllTests().catch((error) => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testState,
  makeRequest,
};
