#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  args.set(key, value);
}

const pkg = args.get('package');
const minMajor = Number(args.get('min-major'));
const dryRun = args.get('dry-run') === 'true';

if (!pkg || !Number.isInteger(minMajor)) {
  console.error('usage: dist-tag-guard.mjs --package=<name> --min-major=<n> [--dry-run]');
  process.exit(2);
}

const npm = (...argv) => execFileSync('npm', argv, { encoding: 'utf8' }).trim();

const compare = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
};

const isStable = (v) => /^\d+\.\d+\.\d+$/.test(v);
const isDeprecated = (v) => npm('view', `${pkg}@${v}`, 'deprecated', '--json') !== '';

const distTags = JSON.parse(npm('view', pkg, 'dist-tags', '--json'));
const raw = JSON.parse(npm('view', pkg, 'versions', '--json'));
const versions = Array.isArray(raw) ? raw : [raw];

const candidates = versions
  .filter((v) => isStable(v) && Number(v.split('.')[0]) >= minMajor)
  .sort(compare)
  .reverse();

const current = distTags.latest;
const output = (key, value) =>
  process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);

// The tag is only repaired when it points somewhere invalid — a v1 release, a
// prerelease, or a deprecated version. A valid v2 that merely isn't the newest
// may be a deliberate hold, so it is left alone.
const invalid =
  !current
    ? 'no latest tag'
    : !isStable(current)
      ? 'prerelease'
      : Number(current.split('.')[0]) < minMajor
        ? `below ${minMajor}.0.0`
        : isDeprecated(current)
          ? 'deprecated'
          : null;

if (!invalid) {
  console.log(`${pkg}: latest -> ${current}, valid`);
  output('drifted', 'false');
  process.exit(0);
}

const expected = candidates.slice(0, 10).find((v) => !isDeprecated(v));

if (!expected) {
  console.error(`${pkg}: latest -> ${current} (${invalid}), no valid replacement >= ${minMajor}.0.0`);
  process.exit(1);
}

console.log(`${pkg}: latest -> ${current} (${invalid}), should be ${expected}`);
output('drifted', 'true');
output('from', current ?? 'none');
output('to', expected);
output('reason', invalid);

if (dryRun) {
  console.log(`${pkg}: dry run, not repairing`);
  process.exit(0);
}

npm('dist-tag', 'add', `${pkg}@${expected}`, 'latest');

const after = JSON.parse(npm('view', pkg, 'dist-tags', '--json')).latest;
if (after !== expected) {
  console.error(`${pkg}: repair did not stick, latest is ${after}`);
  process.exit(1);
}

console.log(`${pkg}: repaired latest ${current} -> ${expected}`);
