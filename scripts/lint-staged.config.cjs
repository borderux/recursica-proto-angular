const { readlinkSync } = require("node:fs");

function isSymlink(file) {
  try {
    readlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  "*.{json,md,css,scss}": (files) => {
    const targets = files.filter((file) => !isSymlink(file));
    return targets.length ? [`prettier --write ${targets.join(" ")}`] : [];
  },
  "*.{ts,html}": [
    () => "prettier --write .",
    () => "eslint --fix .",
    () => "npm run check-types",
  ],
};
