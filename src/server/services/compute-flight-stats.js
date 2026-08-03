function computeBbox(coordinates) {
  if (coordinates.length === 0) {
    return null;
  }

  let minLon = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLon = coordinates[0][0];
  let maxLat = coordinates[0][1];

  for (const [lon, lat] of coordinates) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {
    minLat,
    minLon,
    maxLat,
    maxLon,
  };
}

function computeFlightStats(coordinates, fixes) {
  const pointCount = coordinates.length;
  const bbox = computeBbox(coordinates);

  const timestamps = fixes
    .map((fix) => fix.timestamp)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  const startTime = timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : null;
  const endTime = timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : null;

  return {
    pointCount,
    bbox,
    startTime,
    endTime,
  };
}

module.exports = {
  computeFlightStats,
};
