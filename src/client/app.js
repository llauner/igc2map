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

function drawTracks(flights) {
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
    layer.addTo(map);

    const layerBounds = layer.getBounds();
    if (layerBounds.isValid()) {
      bounds.push(layerBounds);
    }
  });

  if (bounds.length > 0) {
    const aggregate = bounds[0].extend(bounds[0]);
    bounds.slice(1).forEach((b) => aggregate.extend(b));
    map.fitBounds(aggregate, { padding: [18, 18] });
  } else {
    map.setView([48.85, 2.35], 5);
  }
}

async function loadAndRender() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

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
