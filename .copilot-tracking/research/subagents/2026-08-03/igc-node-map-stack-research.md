---
title: IGC Node Map Stack Research
description: Planning research for a low-complexity Node.js MVP that parses IGC files and renders tracks on an interactive web map
author: GitHub Copilot
ms.date: 2026-08-03
ms.topic: overview
keywords:
  - igc
  - nodejs
  - leaflet
  - express
  - geojson
estimated_reading_time: 8
---

## Research Scope

* Recommend a practical MVP architecture for a Node.js program that reads all `.igc` files in a directory and displays tracks on an interactive web map
* Identify suitable npm packages for IGC parsing and map rendering, with strengths and risks
* Propose backend/frontend API contract
* Suggest project structure and implementation steps with validation commands
* Include at least one realistic alternative path and trade-offs

## Context Observed

* Workspace is minimal: `README.md` only
* Goal favors low complexity and stable packages over advanced stack choices
* Research is planning only, no runtime code changes requested

## MVP Recommendation

### Recommended stack

* Runtime: Node.js 20 LTS
* Backend: Express 5
* File discovery: fast-glob
* IGC parsing: igc-parser
* Frontend map: Leaflet 1.9.x with OpenStreetMap tiles
* Data format between backend and frontend: GeoJSON FeatureCollection with flight metadata

### Why this is practical for MVP

* Very small dependency surface and straightforward mental model
* Express can serve both API and static frontend in one process
* Leaflet is lightweight and easy for line overlays, bounds fit, hover/click popups
* GeoJSON keeps future options open for other map libraries
* igc-parser gives direct access to fixes with latitude/longitude/timestamp, enough to build tracks quickly

### High-level architecture

* Startup flow:
  * Read configured flights directory
  * Find all `.igc` files recursively
  * Parse each file into normalized in-memory flight objects
  * Convert fixes to GeoJSON LineString per flight
  * Build one response object with summary metadata
* Request flow:
  * `GET /api/flights` returns all parsed data
  * `GET /api/health` returns parser/file count status
  * Static UI fetches `/api/flights` and renders layers
* Refresh model for MVP:
  * Manual refresh endpoint or app restart
  * Avoid file watcher complexity in first version

## Package Choices With Strengths and Risks

### Core packages

* igc-parser
  * Strengths:
    * Purpose-built for IGC logs
    * Exposes fixes and metadata fields needed for flight lines
    * MIT license
    * Has lenient parse option for imperfect files
  * Risks:
    * Lower ecosystem size than mainstream parser packages
    * Latest npm publish is not recent, so verify behavior on your real-world files
  * Evidence:
    * npm package page lists parsing output with `fixes` and timestamps

* express
  * Strengths:
    * Extremely common and stable for simple APIs
    * Clear routing model and broad community support
    * Node 18+ support aligns with modern LTS
  * Risks:
    * More middleware decisions if app grows, though low impact for MVP
  * Evidence:
    * npm package page, active releases and very high adoption

* leaflet
  * Strengths:
    * Mature interactive map library with strong polyline support
    * Lightweight, no heavy rendering setup for initial track display
    * Works well with GeoJSON
  * Risks:
    * WebGL-heavy scenarios scale better in other libraries for very large datasets
  * Evidence:
    * leafletjs.com features and npm package adoption

* fast-glob
  * Strengths:
    * Fast and flexible file pattern matching
    * Good Windows path guidance in docs
  * Risks:
    * Glob pattern pitfalls on Windows if backslashes are used in patterns
  * Evidence:
    * npm page highlights and Windows pattern guidance

### Useful optional packages

* zod
  * Use to validate and stabilize response schema before frontend consumption
* dayjs
  * Use for friendly formatting of timestamps and durations

## Proposed API and Data Contract

### Endpoint

* `GET /api/flights`

### Response shape

```json
{
  "source": {
    "directory": "./data/igc",
    "fileCount": 12,
    "parsedCount": 11,
    "failedCount": 1,
    "generatedAt": "2026-08-03T10:15:00.000Z"
  },
  "flights": [
    {
      "id": "2026-07-12__pilotA__flight1",
      "fileName": "pilotA_2026-07-12.igc",
      "date": "2026-07-12",
      "pilot": "Pilot A",
      "gliderType": "ASW 19",
      "stats": {
        "pointCount": 5234,
        "bbox": {
          "minLat": 45.123,
          "minLon": 6.001,
          "maxLat": 45.999,
          "maxLon": 6.888
        },
        "startTime": "2026-07-12T09:03:12.000Z",
        "endTime": "2026-07-12T14:17:53.000Z"
      },
      "track": {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [[6.001, 45.123], [6.010, 45.130]]
        },
        "properties": {
          "flightId": "2026-07-12__pilotA__flight1"
        }
      }
    }
  ],
  "errors": [
    {
      "fileName": "broken.igc",
      "reason": "Parse error: invalid B record"
    }
  ]
}
```

### Contract decisions

* Coordinates use GeoJSON order `[lon, lat]`
* Keep full per-fix arrays out of MVP response to avoid payload bloat
* Include parse failures in `errors` so UI can surface partial success
* Keep `id` deterministic from file/date metadata for stable layer keys

## Suggested Project Structure

```text
igc2map/
  README.md
  package.json
  data/
    igc/
  src/
    server/
      app.js
      routes.js
      parse-igc.js
      build-flight-model.js
    client/
      index.html
      app.js
      styles.css
  .env.example
```

## Implementation Steps

1. Initialize Node project and install core dependencies
2. Add configuration for IGC directory path and server port
3. Implement file scan for `**/*.igc`
4. Parse each file with strict mode, fallback lenient mode only when needed
5. Normalize to shared flight model and compute bbox/time range/point count
6. Build `GET /api/flights` and `GET /api/health`
7. Serve static client and render each flight track in Leaflet
8. Add basic UI legend and parse-error panel
9. Document run and validation commands in README

## Validation Commands

```bash
node -v
npm install
npm run start
curl http://localhost:3000/api/health
curl http://localhost:3000/api/flights
```

Optional data sanity checks:

```bash
curl http://localhost:3000/api/flights | jq ".source"
curl http://localhost:3000/api/flights | jq ".flights[0].stats"
```

## Alternative Path and Trade-offs

### Alternative A: Convert to GeoJSON files once, then serve static GeoJSON

* Approach:
  * Add a small conversion script that precomputes one `flights.geojson` artifact
  * Web app reads static artifact only, no runtime parsing
* Benefits:
  * Simplest runtime behavior and easiest hosting model
  * Fast map load and minimal backend logic
* Costs:
  * Requires manual regenerate step whenever IGC files change
  * Harder to expose per-file parse diagnostics live

### Alternative B: OpenLayers instead of Leaflet

* Benefits:
  * Better built-in support for advanced GIS features and projections
* Costs:
  * Higher complexity for initial MVP and steeper learning curve
* Recommendation:
  * Keep Leaflet for MVP, revisit OpenLayers only if requirements expand

## Risks and Mitigations

* Risk: Some IGC files may be malformed
  * Mitigation: Capture failures per file, continue processing remaining files
* Risk: Large datasets can slow initial render
  * Mitigation: Downsample points for display at low zoom in a later iteration
* Risk: Windows path handling for glob patterns
  * Mitigation: Use forward slashes in glob patterns and test with real paths

## Key Discoveries and Evidence

* igc-parser exposes rich parse output including fixes and timestamps, plus lenient mode for imperfect logs: <https://www.npmjs.com/package/igc-parser>
* Express 5 is current and suitable for a small API + static server: <https://www.npmjs.com/package/express>
* Leaflet is lightweight and purpose-fit for interactive polyline maps: <https://leafletjs.com/> and <https://www.npmjs.com/package/leaflet>
* fast-glob documents robust file matching and Windows guidance: <https://www.npmjs.com/package/fast-glob>

## Follow-on Questions

* Do we need server-side filtering by date, pilot, or file name in MVP, or is full-list fetch acceptable
* Should altitude or time-series detail be available per flight in a secondary endpoint
* Is data expected to be local-only, or should deployment target be considered now

## Clarifying Questions Requiring User Input

* Expected maximum dataset size (number of IGC files and average points per flight)
* Whether track color should encode pilot, date, or performance metric
* Whether refresh must be automatic when new files appear

## Research Status

* Status: Complete
* Scope coverage: All requested goals addressed with a concrete MVP path and one alternative path
