const express = require("express");
const healthRouter = require("./routes/health.route");
const lastfmRouter = require("./routes/lastfm.route");
const sessionRouter = require("./routes/session.route");
const authRouter = require("./routes/auth.route");

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.use("/health", healthRouter);
app.use("/lastfm", lastfmRouter);
app.use("/session", sessionRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
