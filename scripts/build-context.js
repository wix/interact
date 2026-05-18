import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { loadAndValidateGlossary, buildTermIndex } from './context/glossary-loader.js';
import { processTemplate } from './context/template-processor.js';
import { generateHeader } from './context/renderers.js';
import { discoverPackages, PACKAGES_DIR } from './context/cli-helpers.js';

const { values: flags } = parseArgs({
  options: {
    package: { type: 'string', multiple: true },
    all: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    verbose: { type: 'boolean', default: false },
  },
  strict: true,
});

let packages;
try {
  packages = discoverPackages(flags);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const OUTPUT_SUBDIRS = ['rules', 'docs'];

function discoverTemplates(templatesDir) {
  const files = [];
  if (!existsSync(templatesDir)) return files;

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  for (const subdir of OUTPUT_SUBDIRS) {
    const dir = join(templatesDir, subdir);
    if (existsSync(dir)) walk(dir);
  }

  return files;
}

function buildPackage(pkgName) {
  const pkgDir = join(PACKAGES_DIR, pkgName);
  const glossaryPath = join(pkgDir, 'context', 'glossary.yaml');
  const templatesDir = join(pkgDir, 'context', 'templates');

  if (!existsSync(glossaryPath)) {
    return { errors: [`Glossary not found: ${glossaryPath}`], warnings: [], filesWritten: 0 };
  }

  const { data, errors: schemaErrors, warnings: schemaWarnings } = loadAndValidateGlossary(glossaryPath);

  if (schemaErrors.length > 0) {
    return { errors: schemaErrors, warnings: schemaWarnings, filesWritten: 0 };
  }

  const termIndex = buildTermIndex(data.terms);
  const templateFiles = discoverTemplates(templatesDir);
  const allErrors = [];
  const allWarnings = [...schemaWarnings];
  const outputs = [];

  for (const templatePath of templateFiles) {
    const templateRelPath = relative(templatesDir, templatePath);
    const content = readFileSync(templatePath, 'utf-8');
    const { output, errors } = processTemplate(content, termIndex, templatesDir, { verbose: flags.verbose });

    if (errors.length > 0) {
      allErrors.push(`ERROR in context/templates/${templateRelPath}:`);
      for (const err of errors) {
        allErrors.push(`  ${err}`);
      }
    }

    const normalizedRelPath = templateRelPath.split(process.platform === 'win32' ? '\\' : '/');
    const outputSubdir = normalizedRelPath[0];
    const outputRelPath = normalizedRelPath.slice(1).join('/');
    const outputPath = join(pkgDir, outputSubdir, outputRelPath);
    const headerPath = `${outputSubdir}/${outputRelPath}`;
    const finalContent = generateHeader(headerPath) + output;
    outputs.push({ path: outputPath, content: finalContent, relPath: headerPath });
  }

  if (allErrors.length > 0) {
    return { errors: allErrors, warnings: allWarnings, filesWritten: 0 };
  }

  let filesWritten = 0;
  for (const { path: outputPath, content, relPath } of outputs) {
    if (flags['dry-run']) {
      console.log(`  [dry-run] Would write: ${relPath}`);
    } else {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, content, 'utf-8');
      if (flags.verbose) {
        console.log(`  Written: ${relPath}`);
      }
    }
    filesWritten++;
  }

  return { errors: [], warnings: allWarnings, filesWritten };
}

if (packages.length === 0) {
  console.error('No packages specified. Use --package <name> or --all.');
  process.exit(1);
}

let totalErrors = 0;
let totalFiles = 0;

for (const pkgName of packages) {
  console.log(`\nBuilding context for: ${pkgName}`);
  const { errors, warnings, filesWritten } = buildPackage(pkgName);

  for (const w of warnings) {
    console.log(`  WARNING: ${w}`);
  }

  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`  ${e}`);
    }
    totalErrors += errors.length;
  } else {
    totalFiles += filesWritten;
    console.log(`  ${filesWritten} file(s) ${flags['dry-run'] ? 'would be written' : 'written'}.`);
  }
}

if (totalErrors > 0) {
  console.error(`\nBuild failed: ${totalErrors} error(s).`);
  process.exit(1);
} else {
  console.log(`\nBuild succeeded: ${totalFiles} file(s) ${flags['dry-run'] ? 'would be written' : 'written'}.`);
}
