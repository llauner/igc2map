<!-- markdownlint-disable-file -->
# Implementation Details: igc2map Node.js Program

## Context Reference

Sources: .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md, .copilot-tracking/research/subagents/2026-08-03/igc-node-map-stack-research.md, README.md

## Implementation Phase 1: Project Scaffolding and Runtime Foundation

<!-- parallelizable: false -->

### Step 1.1: Initialize Node.js project metadata and dependencies

Create a Node.js application baseline with package metadata, scripts, and runtime dependencies aligned to the selected MVP architecture.

Files:
* package.json - Define app name, start script, and dependencies
* .gitignore - Ensure node_modules and runtime artifacts are ignored

Discrepancy references:
* Addresses DR-01 by selecting concrete implementation package versions and scripts

Success criteria:
* `npm install` completes successfully
* `npm run start` resolves to Node entrypoint execution without missing module errors

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 34-45) - Recommended dependency set
* .copilot-tracking/research/subagents/2026-08-03/igc-node-map-stack-research.md - Stack rationale

Dependencies:
* Node.js 20 LTS installed

### Step 1.2: Add environment and directory configuration

Implement configurable runtime options for server port and IGC source folder, with safe defaults for local development.

Files:
* .env.example - Provide PORT and IGC_DIR template values
* src/server/config.js - Parse environment settings and expose validated config
* data/igc/.gitkeep - Establish repository-tracked source folder placeholder

Success criteria:
* Service reads defaults when env vars are absent
* Service can be pointed to a custom IGC path via environment override

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 48-99) - Data source and payload requirements

Dependencies:
* Step 1.1 completion

### Step 1.3: Validate phase changes

Run package install and startup smoke checks for foundational runtime setup.

Validation commands:
* npm install - Validate dependency integrity
* npm run start - Validate app boot sequence

## Implementation Phase 2: Backend Parser and API Endpoints

<!-- parallelizable: false -->

### Step 2.1: Implement IGC file discovery and parsing pipeline

Build reusable backend services to recursively discover IGC files and parse each file into normalized intermediate flight structures.

Files:
* src/server/services/discover-igc-files.js - Find `**/*.igc` files via fast-glob
* src/server/services/parse-igc-file.js - Parse one IGC file and return fixes/metadata or structured error
* src/server/services/load-flights.js - Aggregate parsed flights and errors for API consumption

Discrepancy references:
* Addresses DR-02 by converting research contract to concrete parser interfaces

Success criteria:
* Empty directory returns zero flights without crashing
* Malformed file is represented in errors output while valid flights are returned

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 37-45) - Package selection
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 101-120) - Contract decisions

Dependencies:
* Implementation Phase 1 completion

### Step 2.2: Implement flight model normalization and GeoJSON conversion

Normalize parser output into deterministic IDs, summary statistics, and GeoJSON LineString tracks.

Files:
* src/server/services/build-flight-model.js - Transform parser output into API response shape
* src/server/services/compute-flight-stats.js - Compute bbox, point count, start/end timestamps

Success criteria:
* Output track coordinates use `[lon, lat]` order
* Every flight includes deterministic `id`, `stats`, and `track`

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 56-99) - JSON response schema

Dependencies:
* Step 2.1 completion

### Step 2.3: Add HTTP API routes and health endpoint

Expose backend data through stable endpoints with explicit status metadata.

Files:
* src/server/routes/api.js - Implement `GET /api/health` and `GET /api/flights`
* src/server/app.js - Wire middleware, static serving, and route mounting
* src/server/index.js - Start HTTP listener with configured port

Success criteria:
* `/api/health` reports source directory and parse status
* `/api/flights` returns source, flights array, and errors array
* `/api/flights.source` explicitly includes `fileCount`, `parsedCount`, `failedCount`, and `generatedAt`

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 50-54) - Endpoint definition

Dependencies:
* Step 2.2 completion

## Implementation Phase 3: Frontend Map Rendering

<!-- parallelizable: true -->

### Step 3.1: Build static UI shell and map layout

Create HTML and CSS for a responsive map viewport and metadata sidebar.

Files:
* src/client/index.html - Page structure for map, legend, and error list
* src/client/styles.css - Layout, typography, map container sizing, and panel styling

Discrepancy references:
* Deviates from DD-01 by using minimal visual design for MVP over advanced interaction controls

Success criteria:
* UI loads at root path and map container fills viewport
* Sidebar has sections for source summary and parse errors

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 121-138) - Suggested project structure

Dependencies:
* Implementation Phase 1 completion

### Step 3.2: Render tracks from API response in Leaflet

Fetch flight payload and render colorized track layers with fit-to-bounds behavior.

Files:
* src/client/app.js - Fetch `/api/flights`, add Leaflet tile layer, draw GeoJSON tracks, render summary

Success criteria:
* All valid flights are shown as visible track overlays
* Map auto-zooms to encompass available tracks
* Parse errors are listed in UI when present

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 27-33) - Frontend rendering model
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 101-120) - Payload decisions

Dependencies:
* Step 3.1 completion
* Implementation Phase 2 completion

### Step 3.3: Validate phase changes

Run app and verify map rendering with at least one sample IGC file.

Validation commands:
* npm run start - Boot and serve API + frontend
* curl http://localhost:3000/api/flights - Verify payload presence before UI render

## Implementation Phase 4: Documentation and Final Validation

<!-- parallelizable: false -->

### Step 4.1: Update README with setup and usage

Document prerequisites, expected IGC directory structure, and local run instructions.

Files:
* README.md - Add install/start instructions, API endpoints, and troubleshooting notes

Success criteria:
* New contributor can run from clean clone using README only
* README includes map behavior and error-handling notes

Context references:
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md (Lines 139-154) - Implementation and validation sequence

Dependencies:
* Implementation Phases 1-3 completion

### Step 4.2: Run full project validation

Execute complete validation for modified components and integration behavior.

Validation commands:
* npm run start - Launch application successfully
* curl http://localhost:3000/api/health - Validate health contract
* curl http://localhost:3000/api/flights - Validate flights contract
* curl http://localhost:3000/api/flights | jq ".source | {fileCount, parsedCount, failedCount, generatedAt}" - Validate required source metadata fields
* Set IGC_DIR to an absolute Windows path and rerun startup - Validate glob discovery and parser execution on Windows-style paths

### Step 4.3: Fix minor validation issues

Apply straightforward fixes for startup errors, schema mismatches, and UI rendering defects discovered in validation.

### Step 4.4: Report blocking issues

If validation reveals broad architectural issues, document blockers and provide next planning actions instead of large-scale redesign.

## Dependencies

* Node.js 20 LTS
* Internet access for OSM tiles during local testing

## Success Criteria

* Repository contains runnable Node.js app that reads directory-based IGC files and renders tracks on a browser map
* `/api/flights` contract matches planned schema with robust partial-failure handling