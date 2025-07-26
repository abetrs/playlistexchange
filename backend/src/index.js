// Load environment variables first, before any other requires
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health.route");
const lastfmRouter = require("./routes/lastfm.route");
const sessionRouter = require("./routes/session.route");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");

// Debug environment variables
console.log("Environment variables loaded:");
console.log("Current working directory:", process.cwd());
console.log("__dirname:", __dirname);
console.log(
  "LASTFM_API_KEY:",
  process.env.LASTFM_API_KEY ? "Present" : "Missing"
);
if (process.env.LASTFM_API_KEY) {
  console.log(
    "LASTFM_API_KEY preview:",
    process.env.LASTFM_API_KEY.substring(0, 8) + "..."
  );
}
console.log("PORT:", process.env.PORT);

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/health", healthRouter);
app.use("/lastfm", lastfmRouter);
app.use("/session", sessionRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Backend URL: ${process.env.BACKEND_URL || `http://localhost:${port}`}`
  );
});
