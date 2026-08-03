<!-- markdownlint-disable-file -->
# Task Research: igc2map Node.js Program

Research for a Node.js program that reads multiple IGC files from a directory and displays resulting flight tracks on an interactive map.

## Task Implementation Requests

* Build a Node.js-based solution in this repository.
* Load a series of IGC files from a directory.
* Display parsed flight tracks on a map.

## Scope and Success Criteria

* Scope: Analyze viable technical approaches, libraries, architecture, and implementation path for an initial MVP in this repository.
* Assumptions:
  * The repository currently has minimal implementation and can be scaffolded.
  * IGC files are locally available on disk.
  * A browser-based map UI is acceptable.
* Success Criteria:
  * One recommended architecture is selected with rationale.
  * Key library choices for IGC parsing and map rendering are justified.
  * Implementation-ready structure and validation flow are documented.

## Repository Context

* Current workspace structure:
  * README.md
* README states intent: "Shows IGC files on a map"
* No existing runtime implementation or build scripts are present.

## Selected Implementation Path

### Recommended MVP Architecture

Use a single-process Node.js web application with:

* Express backend serving API and static frontend assets.
* Startup-time discovery and parsing of all `*.igc` files from a configured directory.
* In-memory normalized flight model with one GeoJSON LineString per file.
* Leaflet frontend fetching `/api/flights` and drawing track overlays.

This path is selected for low complexity, predictable operations, and fast implementation in a near-empty repository.

### Recommended Dependency Set

* Runtime: Node.js 20 LTS.
* express: HTTP API plus static file hosting.
* fast-glob: recursive, cross-platform IGC file discovery.
* igc-parser: parse IGC logs into flight fixes and metadata.
* leaflet: browser-side interactive map rendering for track polylines.

## API Contract Recommendation

### Endpoints

* GET /api/health
  * Returns service status and parser summary.
* GET /api/flights
  * Returns aggregated parsed track data.

### Response Shape for GET /api/flights

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
          "coordinates": [[6.001, 45.123], [6.01, 45.13]]
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

### Contract Decisions

* Coordinates must be GeoJSON order `[lon, lat]`.
* Parse errors should be emitted per file while returning successful tracks.
* Flight IDs should be deterministic to keep stable frontend layer keys.
* Full per-fix telemetry beyond track geometry is deferred from MVP payload.

## Project Structure Recommendation

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

## Implementation Sequence Recommendation

1. Initialize Node.js project and install dependencies.
2. Add config for flights directory and service port.
3. Implement IGC file discovery and parser pipeline.
4. Normalize parsed output into flight model and summary metadata.
5. Expose `/api/health` and `/api/flights` endpoints.
6. Serve static frontend and render tracks in Leaflet.
7. Add README run instructions and API description.
8. Validate startup and endpoint response shape.

## Validation Commands Recommendation

```bash
node -v
npm install
npm run start
curl http://localhost:3000/api/health
curl http://localhost:3000/api/flights
```

Optional payload checks:

```bash
curl http://localhost:3000/api/flights | jq ".source"
curl http://localhost:3000/api/flights | jq ".flights[0].stats"
```

## Alternative Paths and Trade-offs

### Alternative A: Precompute Static GeoJSON

* Approach:
  * Run a conversion script that writes a `flights.geojson` artifact.
  * Serve static map plus static data with no runtime parser.
* Pros:
  * Simplest runtime behavior and hosting model.
  * Reduced backend complexity.
* Cons:
  * Manual regenerate step required whenever IGC files change.
  * Live parse diagnostics are not naturally surfaced.

### Alternative B: OpenLayers Instead of Leaflet

* Pros:
  * Richer advanced GIS capabilities and projection handling.
* Cons:
  * Higher complexity and slower MVP delivery.

## Risks and Mitigations

* Risk: malformed IGC files
  * Mitigation: collect parse errors per file and continue processing.
* Risk: large datasets can affect map performance
  * Mitigation: consider point downsampling in follow-on iteration.
* Risk: path/glob handling differences on Windows
  * Mitigation: use forward-slash glob patterns and test with real paths.

## Evidence and Sources

* npm: igc-parser package docs and examples
  * https://www.npmjs.com/package/igc-parser
* npm: express package
  * https://www.npmjs.com/package/express
* Leaflet official site and npm package
  * https://leafletjs.com/
  * https://www.npmjs.com/package/leaflet
* npm: fast-glob package
  * https://www.npmjs.com/package/fast-glob
* Subagent synthesis:
  * .copilot-tracking/research/subagents/2026-08-03/igc-node-map-stack-research.md

## Open Questions

* Expected maximum dataset size in file count and points per flight.
* Need for server-side filtering in MVP (date/pilot/file-name).
* Need for automatic refresh when new files are added.

## Research Status

* Status: Complete
* Coverage: All requested planning topics addressed with selected path and alternatives
