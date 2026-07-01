const { cpSync, existsSync, mkdirSync, readdirSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const iconsDir = join(root, "..", "icons");
const targetDir = join(root, "public", "icons");

if (!existsSync(iconsDir)) {
  console.log(`Icons source not found at ${iconsDir}, skipping sync`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(iconsDir)) {
  if (file.endsWith(".svg")) {
    cpSync(join(iconsDir, file), join(targetDir, file));
  }
}

console.log(`Synced social icons to ${targetDir}`);
