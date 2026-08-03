---
title: igc2map
description: Node.js app that reads IGC files from a directory and renders tracks on an interactive map
---

## Overview

igc2map loads IGC flight files from a local directory, parses them on the server, and displays valid tracks on a Leaflet map in your browser.

The app supports partial failures by design. When one file fails to parse, valid files still render and parse errors appear in the UI and API response.

## Prerequisites

* Node.js 20 or newer
* npm

## Project Structure

```text
igc2map/
	data/
		igc/                  # Input IGC files
	src/
		client/               # Static frontend (Leaflet UI)
		server/               # Express API and parser services
	.env.example
	package.json
```

## Configuration

Environment variables are optional.

* PORT: HTTP port for the server (default: 3000)
* IGC_DIR: directory containing IGC files (default: ./data/igc)

Example:

```powershell
$env:PORT=3000
$env:IGC_DIR="C:\\llauner\\src\\igc2map\\data\\igc"
```

## Install and Run

```powershell
npm install
npm run start
```

Open the app:

* <http://localhost:3000>

## API Endpoints

### GET /api/health

Returns service status and source summary.

Sample response:

```json
{
	"ok": true,
	"source": {
		"directory": "C:\\llauner\\src\\igc2map\\data\\igc",
		"fileCount": 4,
		"parsedCount": 4,
		"failedCount": 0,
		"generatedAt": "2026-08-03T21:13:05.038Z"
	}
}
```

### GET /api/flights

Returns the full payload for map rendering.

Contract highlights:

* source.fileCount, source.parsedCount, source.failedCount, source.generatedAt
* flights: array of normalized flights with GeoJSON LineString tracks
* errors: per-file parse errors

## Data and Behavior Notes

* Coordinates are emitted in GeoJSON order: [lon, lat]
* Flights with fewer than 2 valid coordinates are reported as parse errors
* The map auto-fits all valid track layers
* If no valid tracks exist, the map falls back to a default view

## Troubleshooting

* Server starts but map is empty:
	* Verify IGC files exist under IGC_DIR
	* Check /api/flights and inspect errors
* Invalid PORT error:
	* Ensure PORT is a number between 1 and 65535
* Directory path issues on Windows:
	* Use an absolute path for IGC_DIR, for example C:\\llauner\\src\\igc2map\\data\\igc
