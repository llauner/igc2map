const express = require("express");
const { loadFlights } = require("../services/load-flights");
const { loadAirspaces } = require("../services/load-airspaces");

function createApiRouter(config) {
  const router = express.Router();

  router.get("/health", async (_req, res) => {
    try {
      const data = await loadFlights(config.igcDirectory);
      res.json({
        ok: true,
        source: {
          directory: config.igcDirectory,
          fileCount: data.source.fileCount,
          parsedCount: data.source.parsedCount,
          failedCount: data.source.failedCount,
          generatedAt: data.source.generatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message,
        source: {
          directory: config.igcDirectory,
        },
      });
    }
  });

  router.get("/flights", async (_req, res) => {
    try {
      const [data, airspaces] = await Promise.all([
        loadFlights(config.igcDirectory),
        loadAirspaces(config.airspaceFile),
      ]);
      res.json({ ...data, airspaces });
    } catch (error) {
      res.status(500).json({
        source: {
          directory: config.igcDirectory,
          fileCount: 0,
          parsedCount: 0,
          failedCount: 0,
          generatedAt: new Date().toISOString(),
        },
        flights: [],
        errors: [
          {
            fileName: "*",
            reason: `Unexpected server error: ${error.message}`,
          },
        ],
      });
    }
  });

  return router;
}

module.exports = {
  createApiRouter,
};
