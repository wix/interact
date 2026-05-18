import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { loadAndValidateGlossary } from './context/glossary-loader.js';
import { createProject, validateTermAgainstSource } from './context/ts-extractor.js';
import { discoverPackages } from './context/cli-helpers.js';

const { values: flags } = parseArgs({
  options: {
    package: { type: 'string', multiple: true },
    all: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
  strict: true,
});

const REPO_ROOT = resolve(import.meta.dirname, '..');
const PACKAGES_DIR = join(REPO_ROOT, 'packages');

function validatePackage(pkgName) {
  const pkgDir = join(PACKAGES_DIR, pkgName);
  const glossaryPath = join(pkgDir, 'context', 'glossary.yaml');

  if (!existsSync(glossaryPath)) {
    return {
      package: pkgName,
      totalTerms: 0,
      validated: 0,
      skipped: 0,
      errors: [{ termId: '', check: 'file-exists', message: `Glossary not found: ${glossaryPath}` }],
      warnings: [],
    };
  }

  const { data, errors: schemaErrors } = loadAndValidateGlossary(glossaryPath);

  if (schemaErrors.length > 0) {
    return {
      package: data?.meta?.package || pkgName,
      totalTerms: 0,
      validated: 0,
      skipped: 0,
      errors: schemaErrors.map((msg) => ({ termId: '', check: 'schema', message: msg })),
      warnings: [],
    };
  }

  const terms = data.terms;
  const termsWithSource = terms.filter((t) => t.sourceFile && t.sourceName);
  const project = createProject(pkgDir);

  const results = [];
  const allErrors = [];
  const allWarnings = [];

  for (const term of termsWithSource) {
    const { errors, warnings } = validateTermAgainstSource(term, project, pkgDir);

    for (const e of errors) {
      allErrors.push({ termId: term.id, ...e, sourceFile: term.sourceFile, sourceName: term.sourceName });
    }
    for (const w of warnings) {
      allWarnings.push({ termId: term.id, ...w, sourceFile: term.sourceFile, sourceName: term.sourceName });
    }

    results.push({ term, errors, warnings });
  }

  return {
    package: data.meta.package,
    totalTerms: terms.length,
    validated: termsWithSource.length,
    skipped: terms.length - termsWithSource.length,
    errors: allErrors,
    warnings: allWarnings,
    results,
  };
}

let packages;
try {
  packages = discoverPackages(flags);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

if (packages.length === 0) {
  console.error('No packages specified. Use --package <name> or --all.');
  process.exit(1);
}

let hasErrors = false;

for (const pkgName of packages) {
  const report = validatePackage(pkgName);

  if (flags.json) {
    const { results, ...jsonReport } = report;
    console.log(JSON.stringify(jsonReport, null, 2));
  } else {
    console.log(`\nValidating ${report.package} glossary (${report.totalTerms} terms, ${report.validated} with sourceFile)...`);
    console.log('');

    if (report.results) {
      for (const { term, errors, warnings } of report.results) {
        if (errors.length === 0 && warnings.length === 0) {
          const memberCount = (term.params ?? term.fields ?? term.values ?? []).length;
          console.log(`✓ ${term.id} — ${term.sourceName} in ${term.sourceFile}${memberCount ? ` — ${memberCount} members match` : ''}`);
        } else {
          console.log(`✗ ${term.id} — ${term.sourceName} in ${term.sourceFile}`);
          for (const e of errors) {
            console.log(`    ERROR: ${e.message}`);
          }
          for (const w of warnings) {
            console.log(`    WARNING: ${w.message}`);
          }
        }
      }
    }

    if (report.skipped > 0) {
      console.log(`- ${report.skipped} term(s) skipped (no sourceFile)`);
    }

    console.log('');
    const failedTerms = new Set(report.errors.map((e) => e.termId)).size;
    const passed = report.validated - failedTerms;
    console.log(`Summary: ${passed} passed, ${report.errors.length} error(s), ${report.warnings.length} warning(s), ${report.skipped} skipped`);
  }

  if (report.errors.length > 0) {
    hasErrors = true;
  }
}

process.exit(hasErrors ? 1 : 0);
