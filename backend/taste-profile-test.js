const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000"; // Adjust based on your backend setup

// Test data
const testUsers = [
  {
    name: "Alice Music Lover",
    lastfmUsername: "RJ", // Replace with actual Last.fm usernames for testing
  },
  {
    name: "Bob Beat Head",
    lastfmUsername: "username2", // Replace with actual Last.fm usernames for testing
  },
];

/**
 * Helper function to make API requests with error handling
 */
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

/**
 * Test the complete taste profile workflow
 */
async function testTasteProfileWorkflow() {
  console.log("🎵 Testing Taste Profile Implementation\n");

  // Step 1: Create a test session
  console.log("📁 Step 1: Creating test session...");
  const sessionResult = await apiRequest("POST", "/session", {
    groupName: "Music Compatibility Test",
    groupSize: 2,
  });

  if (!sessionResult.success) {
    console.error("❌ Failed to create session:", sessionResult.error);
    return;
  }

  const sessionCode = sessionResult.data.sessionCode;
  console.log(`✅ Session created: ${sessionCode}\n`);

  // Step 2: Create test users and add them to session
  console.log("👥 Step 2: Creating test users...");
  const userCodes = [];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];

    // Create user
    const userResult = await apiRequest("POST", "/user", user);

    if (!userResult.success) {
      console.error(`❌ Failed to create user ${user.name}:`, userResult.error);
      continue;
    }

    const userCode = userResult.data.userCode;
    userCodes.push(userCode);
    console.log(`✅ User created: ${user.name} (${userCode})`);

    // Add user to session
    const joinResult = await apiRequest(
      "POST",
      `/session/${sessionCode}/join`,
      {
        userCode: userCode,
      }
    );

    if (!joinResult.success) {
      console.error(`❌ Failed to add user to session:`, joinResult.error);
    } else {
      console.log(`✅ User ${user.name} joined session`);
    }
  }

  console.log("");

  // Step 3: Build taste profiles for individual users
  console.log("🔍 Step 3: Building individual taste profiles...");

  for (const userCode of userCodes) {
    console.log(`Building profile for user: ${userCode}`);

    const profileResult = await apiRequest(
      "POST",
      `/user/${userCode}/taste-profile`
    );

    if (profileResult.success) {
      const profile = profileResult.data.profile;
      console.log(`✅ Profile built for ${profile.userName}:`);
      console.log(`   - Artists: ${profile.metadata.totalArtists}`);
      console.log(`   - Tracks: ${profile.metadata.totalTracks}`);
      console.log(`   - Data source: ${profile.metadata.dataSource}`);
      console.log(`   - Created: ${profile.metadata.createdAt}`);
    } else {
      console.log(
        `❌ Failed to build profile for ${userCode}:`,
        profileResult.error
      );
    }
  }

  console.log("");

  // Step 4: Test cached profile retrieval
  console.log("💾 Step 4: Testing cached profile retrieval...");

  for (const userCode of userCodes) {
    const cachedResult = await apiRequest(
      "GET",
      `/user/${userCode}/taste-profile`
    );

    if (cachedResult.success) {
      console.log(`✅ Cached profile retrieved for user ${userCode}`);
      console.log(`   - Cached: ${cachedResult.data.cached}`);
    } else {
      console.log(
        `❌ Failed to get cached profile for ${userCode}:`,
        cachedResult.error
      );
    }
  }

  console.log("");

  // Step 5: Calculate compatibility between users
  if (userCodes.length >= 2) {
    console.log("🤝 Step 5: Calculating user compatibility...");

    const compatResult = await apiRequest(
      "GET",
      `/user/${userCodes[0]}/compatibility/${userCodes[1]}`
    );

    if (compatResult.success) {
      const compat = compatResult.data.compatibility;
      console.log(
        `✅ Compatibility calculated between ${compat.userA.name} and ${compat.userB.name}:`
      );
      console.log(`   - Artist similarity: ${compat.scores.artists}`);
      console.log(`   - Track similarity: ${compat.scores.tracks}`);
      console.log(`   - Overall score: ${compat.scores.overall}`);
      console.log(`   - Common artists: ${compat.commonElements.artistCount}`);
      console.log(`   - Common tracks: ${compat.commonElements.trackCount}`);

      if (compat.commonElements.artists.length > 0) {
        console.log(
          `   - Top common artists: ${compat.commonElements.artists
            .slice(0, 3)
            .join(", ")}`
        );
      }
    } else {
      console.log(`❌ Failed to calculate compatibility:`, compatResult.error);
    }
  }

  console.log("");

  // Step 6: Build taste profiles for entire session
  console.log("🏟️ Step 6: Building session-wide taste profiles...");

  const sessionProfilesResult = await apiRequest(
    "POST",
    `/user/session/${sessionCode}/taste-profiles?forceRefresh=false`
  );

  if (sessionProfilesResult.success) {
    const data = sessionProfilesResult.data;
    console.log(`✅ Session profiles built for ${data.session.name}:`);
    console.log(`   - Total participants: ${data.summary.total}`);
    console.log(`   - Successful: ${data.summary.successful}`);
    console.log(`   - Failed: ${data.summary.failed}`);

    data.results.forEach((result) => {
      console.log(`   - ${result.userName}: ✅ (cached: ${result.cached})`);
    });

    if (data.errors.length > 0) {
      console.log("   Errors:");
      data.errors.forEach((error) => {
        console.log(`   - ${error.userCode}: ❌ ${error.error}`);
      });
    }
  } else {
    console.log(
      `❌ Failed to build session profiles:`,
      sessionProfilesResult.error
    );
  }

  console.log("");

  // Step 7: Test force refresh functionality
  console.log("🔄 Step 7: Testing force refresh...");

  if (userCodes.length > 0) {
    const refreshResult = await apiRequest(
      "POST",
      `/user/${userCodes[0]}/taste-profile?forceRefresh=true`
    );

    if (refreshResult.success) {
      console.log(`✅ Force refresh completed for user ${userCodes[0]}`);
      console.log(`   - Cached: ${refreshResult.data.cached}`);
    } else {
      console.log(`❌ Force refresh failed:`, refreshResult.error);
    }
  }

  console.log("");
  console.log("🎉 Taste profile workflow test completed!");
  console.log(`📊 Session Code: ${sessionCode}`);
  console.log(`👥 User Codes: ${userCodes.join(", ")}`);
}

/**
 * Test error scenarios
 */
async function testErrorScenarios() {
  console.log("\n🚨 Testing Error Scenarios\n");

  // Test 1: Try to build profile for non-existent user
  console.log("1. Testing non-existent user...");
  const fakeUserResult = await apiRequest(
    "POST",
    "/user/FAKECODE/taste-profile"
  );
  console.log(
    `Expected failure: ${
      fakeUserResult.success ? "❌ UNEXPECTED SUCCESS" : "✅ Failed as expected"
    }`
  );
  if (!fakeUserResult.success) {
    console.log(`   Error: ${fakeUserResult.error.message}`);
  }

  // Test 2: Try to calculate compatibility with missing profiles
  console.log("\n2. Testing compatibility with missing profiles...");
  const compatResult = await apiRequest(
    "GET",
    "/user/FAKE1/compatibility/FAKE2"
  );
  console.log(
    `Expected failure: ${
      compatResult.success ? "❌ UNEXPECTED SUCCESS" : "✅ Failed as expected"
    }`
  );
  if (!compatResult.success) {
    console.log(`   Error: ${compatResult.error.message}`);
  }

  // Test 3: Try to build profiles for non-existent session
  console.log("\n3. Testing session profiles with fake session...");
  const sessionResult = await apiRequest(
    "POST",
    "/user/session/FAKESESSION/taste-profiles"
  );
  console.log(
    `Expected failure: ${
      sessionResult.success ? "❌ UNEXPECTED SUCCESS" : "✅ Failed as expected"
    }`
  );
  if (!sessionResult.success) {
    console.log(`   Error: ${sessionResult.error.message}`);
  }

  console.log("\n✅ Error scenario testing completed!");
}

/**
 * Main test function
 */
async function main() {
  console.log("🎵 Playlist Exchange - Taste Profile Testing Suite");
  console.log("=".repeat(50));

  try {
    // Test main workflow
    await testTasteProfileWorkflow();

    // Test error scenarios
    await testErrorScenarios();

    console.log("\n✅ All tests completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Test with real Last.fm usernames in the testUsers array");
    console.log("2. Integrate taste profiles into your frontend UI");
    console.log("3. Add real-time updates for session compatibility scores");
    console.log("4. Implement genre-based matching for enhanced compatibility");
  } catch (error) {
    console.error("\n💥 Test suite encountered an error:", error);
  }
}

// Handle command line arguments
if (process.argv.length > 2) {
  const command = process.argv[2];

  switch (command) {
    case "workflow":
      testTasteProfileWorkflow();
      break;
    case "errors":
      testErrorScenarios();
      break;
    case "help":
      console.log("Usage: node taste-profile-test.js [workflow|errors|help]");
      console.log("  workflow: Test the main taste profile workflow");
      console.log("  errors:   Test error handling scenarios");
      console.log("  help:     Show this help message");
      console.log("  (no args): Run all tests");
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Use "help" to see available commands');
  }
} else {
  // Run all tests by default
  main();
}

module.exports = {
  testTasteProfileWorkflow,
  testErrorScenarios,
  apiRequest,
};
