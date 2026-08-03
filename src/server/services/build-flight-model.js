const path = require("node:path");
const { createHash } = require("node:crypto");
const { computeFlightStats } = require("./compute-flight-stats");

function buildFlightId(parsed, fileName) {
  const date = parsed.date || "unknown-date";
  const baseName = path.basename(fileName, path.extname(fileName));
  const suffix = createHash("sha1").update(fileName).digest("hex").slice(0, 8);
  return `${date}__${baseName}__${suffix}`;
}

function toCoordinates(fixes) {
  return fixes
    .filter(
      (fix) =>
        Number.isFinite(fix.latitude) &&
        Number.isFinite(fix.longitude),
    )
    .map((fix) => [fix.longitude, fix.latitude]);
}

function buildFlightModel(parsed, fileName) {
  const fixes = Array.isArray(parsed.fixes) ? parsed.fixes : [];
  const coordinates = toCoordinates(fixes);
  const id = buildFlightId(parsed, fileName);

  return {
    id,
    fileName,
    date: parsed.date || null,
    pilot: parsed.pilot || null,
    gliderType: parsed.gliderType || null,
    stats: computeFlightStats(coordinates, fixes),
    track: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: {
        flightId: id,
      },
    },
  };
}

module.exports = {
  buildFlightModel,
};
