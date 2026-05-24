const fs = require("fs");
const path = require("path");

const required = [
  "main.js",
  "preload.js",
  path.join("renderer", "index.html"),
  path.join("renderer", "renderer.js"),
  path.join("renderer", "styles.css")
];

for (const file of required) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log("Smoke OK: desktop agent structure present.");
