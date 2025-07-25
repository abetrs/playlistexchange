const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health.route");
const lastfmRouter = require("./routes/lastfm.route");
const sessionRouter = require("./routes/session.route");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
require("dotenv").config();

// Debug environment variables
console.log("Environment variables loaded:");
console.log(
  "LASTFM_API_KEY:",
  process.env.LASTFM_API_KEY ? "Present" : "Missing"
);
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
