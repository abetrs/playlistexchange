
const express = require('express');
const healthRouter = require('./routes/health.route');
const lastfmRouter = require('./routes/lastfm.route');

const app = express();
const port = 3000;

app.use('/health', healthRouter);
app.use('/lastfm', lastfmRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
