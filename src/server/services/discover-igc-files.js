const fg = require("fast-glob");

async function discoverIgcFiles(igcDirectory) {
  const files = await fg(["**/*.igc", "**/*.IGC"], {
    cwd: igcDirectory,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    unique: true,
  });

  return files.sort((a, b) => a.localeCompare(b));
}

module.exports = {
  discoverIgcFiles,
};
