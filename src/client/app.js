const map = L.map("map", {
  zoomControl: true,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
});

const colorPalette = [
  "#0f766e",
  "#1d4ed8",
  "#b45309",
  "#be123c",
  "#4338ca",
  "#166534",
  "#7c2d12",
  "#334155",
];

function buildBaseLayers() {
  const basic = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
  });

  const openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  });

  const outdoors = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri",
    },
  );

  const terrain = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
  });

  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri",
    },
  );

  return {
    "Basic (Carto Positron)": basic,
    "Street (OpenStreetMap)": openStreetMap,
    "Outdoors (Topo)": outdoors,
    "Terrain (OpenTopoMap)": terrain,
    "Satellite (Esri)": satellite,
  };
}

function setSummary(source) {
  const summary = document.getElementById("source-summary");
  summary.innerHTML = "";

  const pairs = [
    ["Directory", source.directory],
    ["Files", String(source.fileCount)],
    ["Parsed", String(source.parsedCount)],
    ["Failed", String(source.failedCount)],
    ["Generated", new Date(source.generatedAt).toLocaleString()],
  ];

  for (const [key, value] of pairs) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    summary.append(dt, dd);
  }
}

function setErrors(errors) {
  const list = document.getElementById("error-list");
  list.innerHTML = "";

  if (errors.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No parse errors";
    list.append(item);
    return;
  }

  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = `${error.fileName}: ${error.reason}`;
    list.append(item);
  }
}

let allFlights = [];
let airspaces = [];
let allLayers = [];
let selectedFlightId = null;
let currentCalendarMonth = new Date();
let heatmapLayer = null;
let viewMode = "tracks";
let hideAirspacePoints = false;
const hiddenPointCache = new Map();
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isPointInsidePolygon(point, polygon) {
  const [longitude, latitude] = point;
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentLongitude, currentLatitude] = polygon[index];
    const [previousLongitude, previousLatitude] = polygon[previous];
    const intersects =
      currentLatitude > latitude !== previousLatitude > latitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;
    if (intersects) inside = !inside;
  }

  return inside;
}

function getHiddenPointFlags(flight) {
  const cachedFlags = hiddenPointCache.get(flight.id);
  if (cachedFlags) return cachedFlags;

  const flags = flight.track.geometry.coordinates.map((point) =>
    airspaces.some((airspace) =>
      isPointInsidePolygon(point, airspace.geometry.coordinates[0]),
    ),
  );
  hiddenPointCache.set(flight.id, flags);
  return flags;
}

function getVisibleCoordinates(flight) {
  if (!hideAirspacePoints) return flight.track.geometry.coordinates;

  const hiddenFlags = getHiddenPointFlags(flight);
  return flight.track.geometry.coordinates.filter((_point, index) => !hiddenFlags[index]);
}

function buildVisibleTrack(flight) {
  if (!hideAirspacePoints) return flight.track;

  const hiddenFlags = getHiddenPointFlags(flight);
  const segments = [];
  let currentSegment = [];

  flight.track.geometry.coordinates.forEach((point, index) => {
    if (hiddenFlags[index]) {
      if (currentSegment.length >= 2) segments.push(currentSegment);
      currentSegment = [];
      return;
    }
    currentSegment.push(point);
  });

  if (currentSegment.length >= 2) segments.push(currentSegment);

  if (segments.length === 1) {
    return { ...flight.track, geometry: { type: "LineString", coordinates: segments[0] } };
  }

  return { ...flight.track, geometry: { type: "MultiLineString", coordinates: segments } };
}

function buildCalendar() {
  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth();

  const monthYear = currentCalendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  document.getElementById("calendar-month-year").textContent = monthYear;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const availableDates = new Set();
  allFlights.forEach((flight) => {
    if (flight.date) {
      const d = new Date(flight.date);
      availableDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  });

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  daysOfWeek.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    grid.append(header);
  });

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    const cellDate = new Date(startDate);
    cellDate.setDate(cellDate.getDate() + i);

    const isCurrentMonth = cellDate.getMonth() === month;
    const dateKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
    const hasFlights = availableDates.has(dateKey);

    cell.className = "calendar-cell";
    if (!isCurrentMonth) cell.classList.add("calendar-other-month");
    if (hasFlights) cell.classList.add("calendar-has-flights");

    cell.textContent = cellDate.getDate();

    if (hasFlights) {
      cell.addEventListener("click", () => {
        const flightsOnDate = allFlights.filter(
          (f) => f.date && new Date(f.date).toDateString() === cellDate.toDateString(),
        );
        if (flightsOnDate.length > 0) {
          showOnlyFlight(flightsOnDate[0].id);
        }
      });
      cell.classList.add("calendar-selectable");
    }

    grid.append(cell);
  }
}

function updateCalendar() {
  buildCalendar();
}

function buildHeatmap() {
  if (heatmapLayer) {
    map.removeLayer(heatmapLayer);
    heatmapLayer = null;
  }

  const points = [];
  allFlights.forEach((flight) => {
    if (flight.track && flight.track.geometry && flight.track.geometry.coordinates) {
      const coords = getVisibleCoordinates(flight);
      coords.forEach(([lon, lat]) => {
        if (Number.isFinite(lon) && Number.isFinite(lat)) {
          points.push([lat, lon, 1]);
        }
      });
    }
  });

  if (points.length > 0) {
    heatmapLayer = L.heatLayer(points, {
      radius: 15,
      blur: 3,
      max: 10,
      maxZoom: 18,
      minOpacity: 0.30,
      gradient: { 0.0: "#2455d6", 0.15: "#16b8d4", 0.3: "#168fba", 0.5: "#7a3fc6", 0.7: "#d32f9a", 0.85: "#c27754", 1.0: "#e31b23" },
    });
    heatmapLayer.addTo(map);
  }
}

function switchViewMode(mode) {
  viewMode = mode;

  if (mode === "heatmap") {
    allLayers.forEach((layer) => map.removeLayer(layer));
    buildHeatmap();
  } else {
    if (heatmapLayer) {
      map.removeLayer(heatmapLayer);
      heatmapLayer = null;
    }
    allLayers.forEach((layer) => layer.addTo(map));
  }
}

function resetAllTracks() {
  if (viewMode === "heatmap") {
    switchViewMode("tracks");
  }
  allLayers.forEach((layer) => layer.addTo(map));
  selectedFlightId = null;
  document.getElementById("selected-track-section").style.display = "none";
  document.getElementById("selected-track-info").innerHTML = "";
}

function renderLayers(fitMap = false) {
  allLayers.forEach((layer) => map.removeLayer(layer));
  allLayers = [];
  if (heatmapLayer) {
    map.removeLayer(heatmapLayer);
    heatmapLayer = null;
  }

  const bounds = [];
  allFlights.forEach((flight, index) => {
    const color = colorPalette[index % colorPalette.length];
    const layer = L.geoJSON(buildVisibleTrack(flight), {
      style: {
        color,
        weight: 3,
        opacity: 0.85,
      },
    });

    layer.bindTooltip(`${flight.fileName} (${flight.stats.pointCount} points)`);
    layer.on("click", () => showOnlyFlight(flight.id));
    allLayers.push(layer);

    const layerBounds = layer.getBounds();
    if (layerBounds.isValid()) bounds.push(layerBounds);
  });

  if (viewMode === "heatmap") {
    buildHeatmap();
  } else {
    allLayers.forEach((layer) => layer.addTo(map));
  }

  if (fitMap && bounds.length > 0) {
    const aggregate = bounds[0].extend(bounds[0]);
    bounds.slice(1).forEach((bound) => aggregate.extend(bound));
    map.fitBounds(aggregate, { padding: [18, 18] });
  } else if (fitMap) {
    map.setView([48.85, 2.35], 5);
  }
}

function showOnlyFlight(flightId) {
  selectedFlightId = flightId;
  const flight = allFlights.find((f) => f.id === flightId);
  if (!flight) return;

  allLayers.forEach((layer) => map.removeLayer(layer));
  const selectedLayer = allLayers[allFlights.indexOf(flight)];
  selectedLayer.addTo(map);
  selectedLayer.bringToFront();
  selectedLayer.getBounds().isValid() &&
    map.fitBounds(selectedLayer.getBounds(), { padding: [18, 18] });

  document.getElementById("selected-track-section").style.display = "block";
  const info = document.getElementById("selected-track-info");
  info.innerHTML = "";
  const pairs = [
    ["File", flight.fileName],
    ["Date", flight.date || "Unknown"],
    ["Pilot", flight.pilot || "Unknown"],
    ["Glider", flight.gliderType || "Unknown"],
    ["Points", String(flight.stats.pointCount)],
  ];
  for (const [key, value] of pairs) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    info.append(dt, dd);
  }
}

function drawTracks(flights) {
  allFlights = flights;
  updateCalendar();
  renderLayers(true);

  document.getElementById("reset-button").addEventListener("click", resetAllTracks);
  document.getElementById("prev-month").addEventListener("click", () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1);
    buildCalendar();
  });
  document.getElementById("next-month").addEventListener("click", () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1);
    buildCalendar();
  });

  document.querySelectorAll('input[name="view-mode"]').forEach((radio) => {
    radio.addEventListener("change", (e) => switchViewMode(e.target.value));
  });

  document.getElementById("hide-airspace-points").addEventListener("change", (event) => {
    hideAirspacePoints = event.target.checked;
    selectedFlightId = null;
    document.getElementById("selected-track-section").style.display = "none";
    const busyOverlay = document.getElementById("busy-overlay");
    const busyStartedAt = performance.now();
    const clearBusyState = () => {
      busyOverlay.classList.remove("visible");
      map.getContainer().style.removeProperty("cursor");
      document.documentElement.classList.remove("computing");
      document.body.classList.remove("computing");
    };

    busyOverlay.classList.add("visible");
    document.documentElement.classList.add("computing");
    document.body.classList.add("computing");
    map.getContainer().style.setProperty("cursor", "wait", "important");

    setTimeout(() => {
      try {
        renderLayers();
      } finally {
        const remainingBusyTime = Math.max(0, 150 - (performance.now() - busyStartedAt));
        setTimeout(clearBusyState, remainingBusyTime);
      }
    }, 0);
  });
}

async function loadAndRender() {
  const baseLayers = buildBaseLayers();
  const defaultBaseLayerName = "Street (OpenStreetMap)";
  baseLayers[defaultBaseLayerName].addTo(map);

  L.control.layers(baseLayers, {}, { collapsed: false, position: "topright" }).addTo(map);

  try {
    const response = await fetch("/api/flights");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    airspaces = data.airspaces || [];
    hiddenPointCache.clear();
    setSummary(data.source);
    setErrors(data.errors || []);
    drawTracks(data.flights || []);
  } catch (error) {
    setSummary({
      directory: "unknown",
      fileCount: 0,
      parsedCount: 0,
      failedCount: 1,
      generatedAt: new Date().toISOString(),
    });
    setErrors([{ fileName: "*", reason: `UI load error: ${error.message}` }]);
    map.setView([48.85, 2.35], 5);
  }
}

loadAndRender();
