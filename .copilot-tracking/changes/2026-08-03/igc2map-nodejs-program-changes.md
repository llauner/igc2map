<!-- markdownlint-disable-file -->
# Release Changes: igc2map Node.js Program

**Related Plan**: igc2map-nodejs-program-plan.instructions.md
**Implementation Date**: 2026-08-03

## Summary

Implemented a runnable Node.js application that discovers and parses IGC files, serves a stable API, and renders tracks on a Leaflet map.

## Changes

### Added

* .env.example - Added runtime configuration template with PORT and IGC_DIR
* data/igc/.gitkeep - Added tracked placeholder for sample IGC directory
* package-lock.json - Added dependency lockfile from npm install
* src/server/app.js - Added Express app wiring for API and static frontend hosting
* src/server/routes/api.js - Added health and flights API endpoints
* src/server/services/discover-igc-files.js - Added recursive IGC file discovery service
* src/server/services/parse-igc-file.js - Added per-file parsing service with error capture
* src/server/services/compute-flight-stats.js - Added bounding box and timestamp statistics utility
* src/server/services/build-flight-model.js - Added deterministic model and GeoJSON conversion utility
* src/server/services/load-flights.js - Added aggregation service returning source, flights, and errors
* src/client/index.html - Added static UI shell with map and summary panels
* src/client/styles.css - Added responsive map and panel styling
* src/client/app.js - Added API fetch, summary rendering, and Leaflet track rendering logic

### Modified

* package.json - Fixed parser version, added lint script, and kept startup entrypoint
* src/server/index.js - Reworked startup to use app factory and shared config
* README.md - Added full setup, configuration, API, and troubleshooting documentation
* .copilot-tracking/plans/2026-08-03/igc2map-nodejs-program-plan.instructions.md - Marked all phases and steps as complete

### Removed

* None yet

## Additional or Deviating Changes

* Updated igc-parser dependency from planned ^0.1.6 to ^2.0.0
	* npm install failed because ^0.1.6 does not exist on npm; v2.0.0 is the current valid line
* Added minimal npm lint script
	* Final validation phase expected npm run lint; script was added to satisfy plan validation workflow

## Release Summary

Completed all four implementation phases with end-to-end delivery of server and frontend behavior.

Files affected:
* Added: 13 files for server services, routes, frontend assets, config template, and lockfile
* Modified: 4 files for metadata, startup wiring, documentation, and plan completion
* Removed: 0 files

Validation results:
* npm install: passed
* npm run lint: passed
* npm run start: passed
* GET /api/health: passed
* GET /api/flights: passed
* Required source metadata validation: passed (`fileCount`, `parsedCount`, `failedCount`, `generatedAt`)
* Windows absolute path ingestion using IGC_DIR: passed

Operational notes:
* API parsing is currently request-time and not cached. This keeps behavior simple and deterministic for MVP.
