const { input, select, confirm } = require("@inquirer/prompts");
const chalk = require("chalk");
const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000";

// API Routes Configuration
const API_ROUTES = [
  // Health Routes
  {
    name: "🏥 Health Check",
    method: "GET",
    url: "/health",
    data: null,
    headers: {},
  },

  // Auth Routes
  {
    name: "🔐 Initiate LastFM Auth",
    method: "GET",
    url: "/auth/lastfm",
    data: null,
    headers: {},
  },
  {
    name: "🔑 LastFM Auth Callback",
    method: "GET",
    url: "/auth/lastfm/callback",
    data: null,
    headers: {},
    note: "This requires query parameters from LastFM callback",
  },

  // LastFM Routes
  {
    name: "🎵 Get Top Artists",
    method: "GET",
    url: "/lastfm/top-artists/abetheunicorn",
    data: null,
    headers: {},
    note: 'Replace "abetheunicorn" with actual LastFM username. Supports query params: ?period=overall|7day|1month|3month|6month|12month&limit=10',
  },
  {
    name: "💿 Get Top Albums",
    method: "GET",
    url: "/lastfm/top-albums/abetheunicorn",
    data: null,
    headers: {},
    note: 'Replace "abetheunicorn" with actual LastFM username. Supports query params: ?period=overall|7day|1month|3month|6month|12month&limit=10',
  },
  {
    name: "🎧 Get Top Tracks",
    method: "GET",
    url: "/lastfm/top-tracks/abetheunicorn",
    data: null,
    headers: {},
    note: 'Replace "abetheunicorn" with actual LastFM username. Supports query params: ?period=overall|7day|1month|3month|6month|12month&limit=10',
  },
  {
    name: "👤 Get Last.fm User Info",
    method: "GET",
    url: "/lastfm/user/abetheunicorn",
    data: null,
    headers: {},
    note: 'Replace "abetheunicorn" with actual LastFM username',
  },

  // Session Routes
  {
    name: "📝 Create Session",
    method: "POST",
    url: "/session",
    data: {
      name: "Test Session",
      description: "A test session created by API tester",
      createdBy: "test-user-123",
    },
    headers: { "Content-Type": "application/json" },
  },
  {
    name: "📋 Get Session",
    method: "GET",
    url: "/session/TEST123",
    data: null,
    headers: {},
    note: 'Replace "TEST123" with actual session code',
  },
  {
    name: "👥 Get Session Participants",
    method: "GET",
    url: "/session/TEST123/participants",
    data: null,
    headers: {},
    note: 'Replace "TEST123" with actual session code',
  },
  {
    name: "🚪 Join Session",
    method: "POST",
    url: "/session/TEST123/join",
    data: {
      userCode: "test-user-456",
      username: "TestUser",
    },
    headers: { "Content-Type": "application/json" },
    note: 'Replace "TEST123" with actual session code',
  },

  // User Routes
  {
    name: "👤 Create User",
    method: "POST",
    url: "/user",
    data: {
      lastfmUsername: "abetheunicorn",
      displayName: "Test User",
      email: "test@example.com",
    },
    headers: { "Content-Type": "application/json" },
  },
  {
    name: "👥 Get All Users",
    method: "GET",
    url: "/user",
    data: null,
    headers: {},
  },
  {
    name: "👤 Get User by Code",
    method: "GET",
    url: "/user/USER123",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "🎵 Get User Last.fm Profile (Top Artists)",
    method: "GET",
    url: "/user/USER123/lastfm?dataType=artists&period=overall&limit=10",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code. Query params: dataType=artists|albums|tracks|info, period=overall|7day|1month|3month|6month|12month, limit=number',
  },
  {
    name: "💿 Get User Last.fm Profile (Top Albums)",
    method: "GET",
    url: "/user/USER123/lastfm?dataType=albums&period=6month&limit=5",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "🎧 Get User Last.fm Profile (Top Tracks)",
    method: "GET",
    url: "/user/USER123/lastfm?dataType=tracks&period=1month&limit=15",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "📊 Get User Last.fm Info",
    method: "GET",
    url: "/user/USER123/lastfm?dataType=info",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "👥 Get Session Last.fm Profiles",
    method: "GET",
    url: "/user/session/ABC123/lastfm?dataType=artists&period=overall&limit=5",
    data: null,
    headers: {},
    note: 'Replace "ABC123" with actual session code. Gets Last.fm data for all participants in a session',
  },
  {
    name: "✏️ Update User",
    method: "PUT",
    url: "/user/USER123",
    data: {
      displayName: "Updated Test User",
      email: "updated@example.com",
    },
    headers: { "Content-Type": "application/json" },
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "🗑️ Delete User",
    method: "DELETE",
    url: "/user/USER123",
    data: null,
    headers: {},
    note: 'Replace "USER123" with actual user code',
  },
  {
    name: "🎵 Get User by LastFM Username",
    method: "GET",
    url: "/user/lastfm/abetheunicorn",
    data: null,
    headers: {},
    note: 'Replace "abetheunicorn" with actual LastFM username',
  },
];

// Helper functions
function displayHeader() {
  console.clear();
  console.log(chalk.blue.bold("🚀 Playlist Exchange API Tester"));
  console.log(chalk.gray("=".repeat(50)));
  console.log(chalk.yellow(`Base URL: ${BASE_URL}`));
  console.log("");
}

function formatResponse(response) {
  const { status, statusText, data, headers } = response;

  let output = "";
  output += chalk.green.bold(`✅ Status: ${status} ${statusText}\n`);
  output += chalk.blue(`📊 Response Headers:\n`);
  output += chalk.gray(JSON.stringify(headers, null, 2)) + "\n\n";
  output += chalk.blue(`📦 Response Data:\n`);
  output += chalk.white(JSON.stringify(data, null, 2));

  return output;
}

function formatError(error) {
  let output = "";

  if (error.response) {
    // Server responded with error status
    const { status, statusText, data } = error.response;
    output += chalk.red.bold(`❌ Error: ${status} ${statusText}\n`);
    output += chalk.blue(`📦 Error Data:\n`);
    output += chalk.red(JSON.stringify(data, null, 2));
  } else if (error.request) {
    // Request was made but no response received
    output += chalk.red.bold(`❌ Network Error: No response received\n`);
    output += chalk.red(`Details: ${error.message}`);
  } else {
    // Something else happened
    output += chalk.red.bold(`❌ Error: ${error.message}`);
  }

  return output;
}

async function makeRequest(route) {
  try {
    console.log(
      chalk.blue(
        `\n🚀 Making ${route.method} request to: ${BASE_URL}${route.url}`
      )
    );

    if (route.data) {
      console.log(chalk.blue(`📤 Request Data:`));
      console.log(chalk.gray(JSON.stringify(route.data, null, 2)));
    }

    if (route.note) {
      console.log(chalk.yellow(`📝 Note: ${route.note}`));
    }

    console.log(chalk.gray("\nSending request...\n"));

    const config = {
      method: route.method,
      url: `${BASE_URL}${route.url}`,
      headers: route.headers,
      timeout: 10000, // 10 second timeout
    };

    if (route.data) {
      config.data = route.data;
    }

    const response = await axios(config);
    console.log(formatResponse(response));
  } catch (error) {
    console.log(formatError(error));
  }
}

async function customRequest() {
  const method = await select({
    message: "Select HTTP method:",
    choices: [
      { name: "GET", value: "GET" },
      { name: "POST", value: "POST" },
      { name: "PUT", value: "PUT" },
      { name: "DELETE", value: "DELETE" },
      { name: "PATCH", value: "PATCH" },
    ],
  });

  const url = await input({
    message: "Enter the endpoint URL (e.g., /health):",
    validate: (input) => {
      if (!input.trim()) {
        return "URL is required";
      }
      if (!input.startsWith("/")) {
        return "URL should start with /";
      }
      return true;
    },
  });

  let hasData = false;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    hasData = await confirm({
      message: "Does this request need a JSON body?",
      default: false,
    });
  }

  let data = null;
  if (hasData) {
    const dataInput = await input({
      message: "Enter JSON data (single line):",
      default: "{}",
    });

    try {
      data = JSON.parse(dataInput);
    } catch (e) {
      console.log(chalk.red("Invalid JSON, using empty object"));
      data = {};
    }
  }

  const route = {
    name: `Custom ${method} Request`,
    method: method,
    url: url,
    data: data,
    headers: data ? { "Content-Type": "application/json" } : {},
  };

  await makeRequest(route);
}

async function mainMenu() {
  while (true) {
    displayHeader();

    const routeChoices = API_ROUTES.map((route, index) => ({
      name: `${route.name} [${route.method}] ${route.url}`,
      value: index,
    }));

    const choices = [
      ...routeChoices,
      {
        name: "─────────────────────────────────",
        value: "separator",
        disabled: true,
      },
      { name: "🔧 Custom Request", value: "custom" },
      { name: "🚪 Exit", value: "exit" },
    ];

    const selection = await select({
      message: "Select an API route to test:",
      choices: choices,
      pageSize: 10,
    });

    if (selection === "exit") {
      console.log(chalk.green("\n👋 Goodbye!"));
      process.exit(0);
    } else if (selection === "custom") {
      await customRequest();
    } else if (selection === "separator") {
      // Do nothing, this is just a visual separator
      continue;
    } else {
      const selectedRoute = API_ROUTES[selection];
      await makeRequest(selectedRoute);
    }

    // Wait for user to press Enter before continuing
    await input({
      message: "\nPress Enter to continue...",
    });
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  displayHeader();

  console.log(chalk.blue("🔍 Checking if server is running..."));

  const serverRunning = await checkServerHealth();

  if (!serverRunning) {
    console.log(chalk.red(`❌ Server is not running at ${BASE_URL}`));
    console.log(chalk.yellow("Please start the server with: npm start"));
    console.log(
      chalk.gray(
        "Make sure the server is running on the correct port (default: 3000)"
      )
    );

    const proceed = await confirm({
      message: "Do you want to proceed anyway?",
      default: false,
    });

    if (!proceed) {
      console.log(
        chalk.yellow("\n👋 Exiting. Please start the server and try again.")
      );
      process.exit(0);
    }
  } else {
    console.log(chalk.green("✅ Server is running!"));
  }

  // Start the main menu
  await mainMenu();
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\n👋 Goodbye!"));
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error(chalk.red("💥 Application error:"), error);
  process.exit(1);
});
