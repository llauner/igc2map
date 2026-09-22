const path = require("node:path");

const DEFAULT_PORT = 3000;
const DEFAULT_IGC_DIR = "./data/igc";
const DEFAULT_AIRSPACE_FILE = "./data/france.txt";

function parsePort(value) {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return parsed;
}

function resolveIgcDirectory(value) {
  const configured = value && value.trim().length > 0 ? value : DEFAULT_IGC_DIR;
  return path.resolve(process.cwd(), configured);
}

function resolveAirspaceFile(value) {
  const configured = value && value.trim().length > 0 ? value : DEFAULT_AIRSPACE_FILE;
  return path.resolve(process.cwd(), configured);
}

function loadConfig(env = process.env) {
  return {
    port: parsePort(env.PORT),
    igcDirectory: resolveIgcDirectory(env.IGC_DIR),
    airspaceFile: resolveAirspaceFile(env.AIRSPACE_FILE),
  };
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_IGC_DIR,
  DEFAULT_AIRSPACE_FILE,
  loadConfig,
};
