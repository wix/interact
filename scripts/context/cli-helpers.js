import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const PACKAGES_DIR = join(REPO_ROOT, 'packages');

export function discoverPackages(flags) {
  if (flags.all) {
    return readdirSync(PACKAGES_DIR)
      .filter((name) => {
        const contextDir = join(PACKAGES_DIR, name, 'context');
        return existsSync(contextDir) && statSync(contextDir).isDirectory();
      });
  }

  const names = flags.package || [];
  for (const name of names) {
    const pkgDir = join(PACKAGES_DIR, name);
    if (!existsSync(pkgDir)) {
      console.error(`Package directory not found: ${pkgDir}`);
      process.exit(1);
    }
  }
  return names;
}
