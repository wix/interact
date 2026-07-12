// Minimal static-site build: read the page template from src/, write it to dist/.
// Run with: npm run build
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, 'src', 'page.html');
const OUT = join(root, 'dist', 'index.html');

async function build() {
  const html = await readFile(SRC, 'utf8');
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, html, 'utf8');
  console.log('Built', OUT);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
