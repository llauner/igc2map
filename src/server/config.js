const path = require("node:path");

const DEFAULT_PORT = 3000;
const DEFAULT_IGC_DIR = "./data/igc";

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

function loadConfig(env = process.env) {
  return {
    port: parsePort(env.PORT),
    igcDirectory: resolveIgcDirectory(env.IGC_DIR),
  };
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_IGC_DIR,
  loadConfig,
};
