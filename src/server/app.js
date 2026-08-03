const path = require("node:path");
const express = require("express");
const { createApiRouter } = require("./routes/api");

function createApp(config) {
  const app = express();
  const clientRoot = path.resolve(__dirname, "..", "client");

  app.use("/api", createApiRouter(config));
  app.use(express.static(clientRoot));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(clientRoot, "index.html"));
  });

  return app;
}

module.exports = {
  createApp,
};
