const { discoverIgcFiles } = require("./discover-igc-files");
const { parseIgcFile } = require("./parse-igc-file");
const { buildFlightModel } = require("./build-flight-model");

async function loadFlights(igcDirectory) {
  const discoveredFiles = await discoverIgcFiles(igcDirectory);
  const flights = [];
  const errors = [];

  for (const filePath of discoveredFiles) {
    const parsedFile = await parseIgcFile(filePath);

    if (!parsedFile.ok) {
      errors.push({
        fileName: parsedFile.fileName,
        reason: parsedFile.reason,
      });
      continue;
    }

    const flight = buildFlightModel(parsedFile.parsed, parsedFile.fileName);

    if (flight.track.geometry.coordinates.length < 2) {
      errors.push({
        fileName: parsedFile.fileName,
        reason: "Parse error: file did not produce enough coordinates for a track",
      });
      continue;
    }

    flights.push(flight);
  }

  return {
    source: {
      directory: igcDirectory,
      fileCount: discoveredFiles.length,
      parsedCount: flights.length,
      failedCount: errors.length,
      generatedAt: new Date().toISOString(),
    },
    flights,
    errors,
  };
}

module.exports = {
  loadFlights,
};
