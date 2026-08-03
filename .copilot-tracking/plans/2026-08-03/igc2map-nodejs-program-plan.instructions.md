---
applyTo: '.copilot-tracking/changes/2026-08-03/igc2map-nodejs-program-changes.md'
---
<!-- markdownlint-disable-file -->
# Implementation Plan: igc2map Node.js Program

## Overview

Implement a minimal, production-sane Node.js application that loads IGC files from a directory and displays parsed tracks on a browser map using a unified backend and static frontend architecture.

## Objectives

### User Requirements

* Create this repository as a Node.js program for displaying IGC tracks on a map - Source: conversation request on 2026-08-03
* Read a series of IGC files from a directory - Source: conversation request on 2026-08-03
* Display track content on a map - Source: conversation request on 2026-08-03

### Derived Objectives

* Establish a low-complexity MVP architecture with reliable parsing and map rendering - Derived from: repository currently contains only README.md and needs fast implementation path
* Define a stable API contract with partial-failure support for malformed files - Derived from: research risk analysis and operational requirements
* Provide validation-first implementation sequencing to reduce integration defects - Derived from: no existing runtime baseline in repository

## Context Summary

### Project Files

* README.md - Existing project intent and entrypoint for setup documentation
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md - Primary technical findings and selected architecture
* .copilot-tracking/research/subagents/2026-08-03/igc-node-map-stack-research.md - Subagent evidence on package and architecture choices

### References

* https://www.npmjs.com/package/igc-parser - Parser package capabilities and constraints
* https://www.npmjs.com/package/fast-glob - Recursive file discovery behavior
* https://www.npmjs.com/package/express - HTTP server and static asset serving baseline
* https://leafletjs.com/ - Browser map rendering model for track overlays

### Standards References

* c:\Users\SESA644858\.vscode\extensions\ise-hve-essentials.hve-core-3.2.2\.github\instructions\hve-core\markdown.instructions.md - Markdown authoring conventions
* c:\Users\SESA644858\.vscode\extensions\ise-hve-essentials.hve-core-3.2.2\.github\instructions\hve-core\writing-style.instructions.md - Markdown writing style conventions

## Implementation Checklist

### [x] Implementation Phase 1: Project Scaffolding and Runtime Foundation

<!-- parallelizable: false -->

* [x] Step 1.1: Initialize Node.js project metadata and dependencies
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 12-32)
* [x] Step 1.2: Add environment and directory configuration
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 34-51)
* [x] Step 1.3: Validate phase changes
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 53-59)
  * Run lint and build commands for modified files
  * Skip if validation conflicts with parallel phases

### [x] Implementation Phase 2: Backend Parser and API Endpoints

<!-- parallelizable: false -->

* [x] Step 2.1: Implement IGC file discovery and parsing pipeline
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 65-86)
* [x] Step 2.2: Implement flight model normalization and GeoJSON conversion
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 88-104)
* [x] Step 2.3: Add HTTP API routes and health endpoint
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 106-124)
  * Ensure `/api/flights.source` includes `fileCount`, `parsedCount`, `failedCount`, and `generatedAt`

### [x] Implementation Phase 3: Frontend Map Rendering

<!-- parallelizable: true -->

* [x] Step 3.1: Build static UI shell and map layout
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 130-149)
* [x] Step 3.2: Render tracks from API response in Leaflet
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 151-169)
* [x] Step 3.3: Validate phase changes
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 171-177)
  * Run lint and build commands for modified files
  * Skip if validation conflicts with parallel phases

### [x] Implementation Phase 4: Documentation and Final Validation

<!-- parallelizable: false -->

* [x] Step 4.1: Update README with setup and usage
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 183-198)
* [x] Step 4.2: Run full project validation
  * Execute all lint commands (`npm run lint`, language linters)
  * Execute build scripts for all modified components
  * Run test suites covering modified code
  * Validate required source metadata fields in `/api/flights.source`
  * Validate ingestion with `IGC_DIR` set to an absolute Windows path
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 200-209)
* [x] Step 4.3: Fix minor validation issues
  * Iterate on lint errors and build warnings
  * Apply fixes directly when corrections are straightforward
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 211-213)
* [x] Step 4.4: Report blocking issues
  * Document issues requiring additional research
  * Provide user with next steps and recommended planning
  * Avoid large-scale fixes within this phase
  * Details: .copilot-tracking/details/2026-08-03/igc2map-nodejs-program-details.md (Lines 215-217)

## Planning Log

See .copilot-tracking/plans/logs/2026-08-03/igc2map-nodejs-program-log.md for discrepancy tracking, implementation paths considered, and suggested follow-on work.

## Dependencies

* Node.js 20 LTS
* npm registry access for package installation
* Local directory containing IGC files for functional validation

## Success Criteria

* Node.js project skeleton, parser pipeline, API, and map UI are fully defined for implementation execution - Traces to: user requirement to display IGC tracks from directory on a map
* Implementation sequencing, validations, and discrepancy handling are documented with actionable line-linked steps - Traces to: research recommendations and subagent findings