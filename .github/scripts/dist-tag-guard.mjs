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
const verifyAuth = args.get('verify-auth') === 'true';

if (!pkg || !Number.isInteger(minMajor)) {
  console.error('usage: dist-tag-guard.mjs --package=<name> --min-major=<n> [--dry-run] [--verify-auth]');
  process.exit(2);
}

process.on('uncaughtException', (err) => {
  console.error(err.stderr ? String(err.stderr).trim() : err.message);
  process.exit(1);
});

const npm = (...argv) => execFileSync('npm', argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const readTags = () => JSON.parse(npm('view', pkg, 'dist-tags', '--json', '--prefer-online'));

const compare = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
};

const isStable = (v) => /^\d+\.\d+\.\d+$/.test(v);
const isDeprecated = (v) => npm('view', `${pkg}@${v}`, 'deprecated', '--json') !== '';

const distTags = readTags();
const current = distTags.latest;

// `npm dist-tag add` short-circuits without a network request when the tag
// already points at that version, so re-adding `latest` proves nothing about
// write access. A throwaway tag forces a real authenticated PUT.
if (verifyAuth) {
  const probe = 'auth-check';

  if (!current) {
    console.error(`${pkg}: no latest tag to probe with`);
    process.exit(1);
  }
  if (distTags[probe]) {
    console.error(`${pkg}: a '${probe}' tag already exists, remove it before verifying`);
    process.exit(1);
  }

  console.log(`${pkg}: adding throwaway tag '${probe}' -> ${current}`);
  let added = false;
  try {
    npm('dist-tag', 'add', `${pkg}@${current}`, probe);
    added = true;
    if (readTags()[probe] !== current) {
      console.error(`${pkg}: '${probe}' did not appear, token cannot write`);
      process.exit(1);
    }
    console.log(`${pkg}: write access confirmed`);
  } finally {
    if (added) {
      npm('dist-tag', 'rm', pkg, probe);
      const left = readTags()[probe];
      console.log(left ? `${pkg}: WARNING '${probe}' still present, remove it manually` : `${pkg}: cleaned up '${probe}'`);
    }
  }

  const after = readTags().latest;
  if (after !== current) {
    console.error(`${pkg}: latest changed during probe, ${current} -> ${after}`);
    process.exit(1);
  }
  process.exit(0);
}

const raw = JSON.parse(npm('view', pkg, 'versions', '--json'));
const versions = Array.isArray(raw) ? raw : [raw];

const candidates = versions
  .filter((v) => isStable(v) && Number(v.split('.')[0]) >= minMajor)
  .sort(compare)
  .reverse();

const output = (key, value) =>
  process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);

// The tag is only repaired when it points somewhere invalid — a v1, a
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

const after = readTags().latest;
if (after !== expected) {
  console.error(`${pkg}: repair did not stick, latest is ${after}`);
  process.exit(1);
}

console.log(`${pkg}: repaired latest ${current} -> ${expected}`);
