const fs = require("node:fs/promises");
const path = require("node:path");
const IGCParser = require("igc-parser");

async function parseIgcFile(filePath) {
  const fileName = path.basename(filePath);

  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = IGCParser.parse(content, { lenient: true });

    return {
      ok: true,
      filePath,
      fileName,
      parsed,
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      fileName,
      reason: `Parse error: ${error.message}`,
    };
  }
}

module.exports = {
  parseIgcFile,
};
