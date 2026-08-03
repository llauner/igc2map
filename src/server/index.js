const { loadConfig } = require("./config");
const { createApp } = require("./app");

function startServer() {
  const config = loadConfig();
  const app = createApp(config);

  app.listen(config.port, () => {
    console.log(`igc2map server listening on port ${config.port}`);
    console.log(`IGC source directory: ${config.igcDirectory}`);
  });
}

startServer();
