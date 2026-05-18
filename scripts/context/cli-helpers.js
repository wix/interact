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
  return flags.package || [];
}
