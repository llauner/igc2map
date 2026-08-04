const map = L.map("map", {
  zoomControl: true,
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
let allLayers = [];
let selectedFlightId = null;

function resetAllTracks() {
  allLayers.forEach((layer) => layer.addTo(map));
  selectedFlightId = null;
  document.getElementById("selected-track-section").style.display = "none";
  document.getElementById("selected-track-info").innerHTML = "";
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
  allLayers = [];
  const bounds = [];

  flights.forEach((flight, index) => {
    const color = colorPalette[index % colorPalette.length];
    const layer = L.geoJSON(flight.track, {
      style: {
        color,
        weight: 3,
        opacity: 0.85,
      },
    });

    layer.bindTooltip(`${flight.fileName} (${flight.stats.pointCount} points)`);
    layer.on("click", () => showOnlyFlight(flight.id));
    layer.addTo(map);
    allLayers.push(layer);

    const layerBounds = layer.getBounds();
    if (layerBounds.isValid()) {
      bounds.push(layerBounds);
    }
  });

  document.getElementById("reset-button").addEventListener("click", resetAllTracks);

  if (bounds.length > 0) {
    const aggregate = bounds[0].extend(bounds[0]);
    bounds.slice(1).forEach((b) => aggregate.extend(b));
    map.fitBounds(aggregate, { padding: [18, 18] });
  } else {
    map.setView([48.85, 2.35], 5);
  }
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
