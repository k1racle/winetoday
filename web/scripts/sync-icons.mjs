import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, '..', 'icons');
const targetDir = join(root, 'public', 'icons');

if (!existsSync(iconsDir)) {
  console.log(`Icons source not found at ${iconsDir}, skipping sync`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(iconsDir)) {
  if (file.endsWith('.svg')) {
    cpSync(join(iconsDir, file), join(targetDir, file));
  }
}

console.log(`Synced social icons to ${targetDir}`);
