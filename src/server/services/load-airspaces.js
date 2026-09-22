const fs = require("node:fs/promises");

const TARGET_AIRSPACES = new Map([
  ["AN PARC/RESERVE  VERCORS 300M/SOL", "Vercors (300 m/SOL)"],
  ["AN PARC/RESERVE  VANOISE 1000M/SOL", "Vanoise (1000 m/SOL)"],
]);

function parseCoordinate(value) {
  const match = value.match(
    /^(\d+(?::\d+(?:\.\d+)?){0,2})\s*([NS])\s+(\d+(?::\d+(?:\.\d+)?){0,2})\s*([EW])$/i,
  );
  if (!match) return null;

  const toDecimal = (parts) => {
    const values = parts.split(":").map(Number);
    return values[0] + (values[1] || 0) / 60 + (values[2] || 0) / 3600;
  };

  const latitude = toDecimal(match[1]) * (match[2].toUpperCase() === "S" ? -1 : 1);
  const longitude = toDecimal(match[3]) * (match[4].toUpperCase() === "W" ? -1 : 1);
  return [longitude, latitude];
}

function finishAirspace(current, airspaces) {
  if (!current || current.coordinates.length < 3) return;
  const first = current.coordinates[0];
  const last = current.coordinates[current.coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    current.coordinates.push(first);
  }
  airspaces.push({
    id: current.id,
    name: current.name,
    geometry: {
      type: "Polygon",
      coordinates: [current.coordinates],
    },
  });
}

async function loadAirspaces(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const airspaces = [];
  let current = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("AN ")) {
      finishAirspace(current, airspaces);
      const name = TARGET_AIRSPACES.get(line);
      current = name
        ? { id: line, name, coordinates: [] }
        : null;
      continue;
    }

    if (current && line.startsWith("DP ")) {
      const coordinate = parseCoordinate(line.slice(3).trim());
      if (coordinate) current.coordinates.push(coordinate);
    }
  }

  finishAirspace(current, airspaces);
  return airspaces;
}

module.exports = {
  loadAirspaces,
};