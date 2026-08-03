---
title: Repo Baseline Research for igc2map Node.js Program
description: Baseline repository discovery and implementation constraints for bootstrapping an igc2map Node.js application.
author: GitHub Copilot
ms.date: 2026-08-03
ms.topic: how-to
keywords:
  - igc
  - nodejs
  - map rendering
  - repository baseline
estimated_reading_time: 4
---

## Research Status

* Status: Complete
* Date: 2026-08-03
* Workspace root: c:/llauner/src/igc2map
* Subagent output path: .copilot-tracking/research/subagents/2026-08-03/repo-baseline-research.md

## Research Topics and Questions

1. What files and implementation assets currently exist in this repository?
2. What does current documentation state about repository intent?
3. What constraints are already implied by repository configuration?
4. What is missing to bootstrap a Node.js app that reads IGC files and renders tracks on a map?

## Read-Only Discovery Performed

* Listed workspace root contents
* Searched workspace for files and tracking artifacts
* Read README.md
* Read .gitignore
* Read existing research notes under .copilot-tracking

## Baseline Inventory

* README.md
* .gitignore
* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md
* .copilot-tracking/research/subagents/2026-08-03/external-stack-research.md

## Concrete Findings with Evidence

### Repository intent exists but is minimal

* README title identifies project name at README.md:1
* README intent is one sentence, "Shows IGC files on a map", at README.md:2
* No implementation instructions, architecture notes, or runtime commands are present in README.md:1-2

### No application source or package manifest exists yet

* Workspace file scan returned only README.md, .gitignore, and one existing research note in .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md
* No package.json was found in the current workspace scan
* No src/, server/, public/, or test directories were found in the current workspace scan

### .gitignore is Node-centric and supports expected project hygiene

* npm debug logs ignored at .gitignore:4
* node_modules directory ignored at .gitignore:41
* dist build output ignored at .gitignore:83 (also appears in framework-specific variants)
* environment file pattern supports committing an example file via exception !.env.example at .gitignore:71

### Existing research artifacts are placeholders, not implementation

* .copilot-tracking/research/2026-08-03/igc2map-nodejs-program-research.md contains mostly "Pending" placeholders
* .copilot-tracking/research/subagents/2026-08-03/external-stack-research.md is marked In-Progress and has multiple "TBD" sections

## Constraints and Missing Pieces

### Confirmed constraints from current state

* No executable app baseline currently exists
* No dependency management manifest currently exists
* No documented IGC input directory convention currently exists
* No map rendering stack is selected
* No parsing library is selected
* No run/build/test scripts are defined

### Immediate missing pieces to bootstrap Node.js igc2map

1. package.json with scripts for dev/start/build
2. Source layout decision (single-process CLI+server or split API and frontend)
3. IGC ingestion contract (input folder path, file glob, error handling)
4. IGC parse-to-GeoJSON transformation layer
5. Map UI with polyline track rendering and basic viewport fitting
6. Minimal README expansion with setup and run steps
7. Example input and output conventions (sample IGC folder, optional fixtures)
8. Configuration approach (.env handling and defaults)

## Immediate Bootstrapping Needs for Target App

### Functional MVP requirements

* Read multiple .igc files from a configured local directory
* Parse each file into ordered track points (lat, lon, timestamp, optional altitude)
* Expose parsed tracks to frontend (local JSON file or HTTP endpoint)
* Render one polyline per flight on an interactive map
* Distinguish flights visually (color/legend)

### Non-functional MVP requirements

* Deterministic startup command
* Graceful handling for malformed or empty IGC files
* Predictable folder conventions for input data and static assets
* Basic observability (startup logs, parse counts, parse failures)

## Clarifying Questions That Need User Input

1. Should the first implementation be a Node server with browser UI, or a pure static generator that emits map-ready JSON?
2. What is the expected IGC folder location convention (for example, ./data/igc)?
3. Is TypeScript preferred, or plain JavaScript for initial bootstrap?
4. Is offline-only map rendering required, or can the app depend on online tile providers?

## Recommended Next Research

1. Validate IGC parser library candidates with quick parse fidelity checks against real sample files
2. Compare map libraries for easiest multi-track rendering and offline support constraints
3. Define a minimal domain schema for parsed tracks and metadata
4. Draft bootstrap architecture decision record based on chosen runtime split
5. Add implementation plan with milestones from scaffold to first rendered flight
