import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://wix.github.io/interact';
const KNOWN_ORDER = [
  'full-lean.md',
  'integration.md',
  'validate.md',
  'click.md',
  'hover.md',
  'pointermove.md',
  'viewenter.md',
  'viewprogress.md',
];
const DOCS_LINK_TITLES = new Map([
  ['full-lean.md', 'Full Reference'],
  ['integration.md', 'Integration Guide'],
  ['validate.md', 'Validation Guide'],
]);

const STATIC_BODY = [
  '- Install: `npm install @wix/interact @wix/motion-presets`',
  '- Three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), Web Components (`@wix/interact/web`)',
  '- Five trigger types: hover (interest), click (activate), viewEnter, viewProgress, pointerMove',
  '- Effects via named presets (`@wix/motion-presets`), keyframes, CSS transitions, or custom JS callbacks',
  '- Configs are JSON-serializable -- designed for LLM generation',
].join('\n');

/**
 * Sorts file names: priority files first (in PRIORITY order),
 * then remaining files alphabetically.
 */
export function orderFiles(fileNames) {
  const known = KNOWN_ORDER.filter((name) => fileNames.includes(name));
  const unknown = fileNames.filter((name) => !KNOWN_ORDER.includes(name)).sort();
  return [...known, ...unknown];
}

/**
 * Extracts the first non-empty line after the H1 heading.
 * If the line exceeds 120 chars, truncates to the first sentence
 * (first `.` followed by whitespace or end-of-string).
 */
export function extractDescription(content) {
  const lines = content.split('\n');
  let pastHeading = false;

  for (const line of lines) {
    if (!pastHeading) {
      if (line.startsWith('# ')) {
        pastHeading = true;
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '') continue;

    if (trimmed.length <= 120) return trimmed;

    const match = trimmed.match(/^(.*?\.)(?:\s|$)/);
    if (match) return match[1];

    return trimmed;
  }

  return '';
}

/**
 * Generates the llms.txt table-of-contents string (llmstxt.org spec).
 * @param {Array<{name: string, content: string, lineCount: number}>} files - ordered file list
 * @param {{version: string, description: string, baseUrl: string}} metadata
 */
export function generateLlmsTxt(files, metadata) {
  const { description, baseUrl } = metadata;
  const lines = [];

  lines.push('# @wix/interact');
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');
  lines.push(STATIC_BODY);
  lines.push('');
  lines.push('## Docs');
  lines.push('');

  const docsFiles = files.filter((f) => DOCS_LINK_TITLES.has(f.name));
  for (const file of docsFiles) {
    const title = DOCS_LINK_TITLES.get(file.name);
    const desc = extractDescription(file.content);
    lines.push(`- [${title}](${baseUrl}/rules/${file.name}): ${desc} (${file.lineCount} lines)`);
  }

  lines.push('');
  lines.push('## Optional');
  lines.push('');

  const optionalFiles = files.filter((f) => !DOCS_LINK_TITLES.has(f.name));
  for (const file of optionalFiles) {
    const headingMatch = file.content.match(/^# (.+)$/m);
    const title = headingMatch ? headingMatch[1].trim() : file.name.replace(/\.md$/, '');
    const desc = extractDescription(file.content);
    lines.push(`- [${title}](${baseUrl}/rules/${file.name}): ${desc} (${file.lineCount} lines)`);
  }

  const totalLines = files.reduce((sum, f) => sum + f.lineCount, 0);
  lines.push(
    `- [All rules in one file](${baseUrl}/llms-full.txt): Complete concatenation (${totalLines} lines)`,
  );
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates the llms-full.txt concatenated document string.
 * @param {Array<{name: string, content: string, lineCount: number}>} files - ordered file list
 * @param {{version: string, description: string, baseUrl: string}} metadata
 */
export function generateLlmsFullTxt(files, metadata) {
  const { version, baseUrl } = metadata;
  const totalLines = files.reduce((sum, f) => sum + f.lineCount, 0);

  let output = `# @wix/interact v${version} -- AI Rules Reference\n`;
  output += `# ${baseUrl}/llms.txt\n`;
  output += `# ${files.length} files, ${totalLines} lines\n`;

  for (const file of files) {
    output += `\n--- ${file.name} ---\n\n`;
    output += file.content;
  }

  return output;
}

// --------------- CLI entry point ---------------

const RULES_DIR = 'packages/interact/rules';
const PKG_PATH = 'packages/interact/package.json';

function countLines(content) {
  const parts = content.split('\n');
  return parts[parts.length - 1] === '' ? parts.length - 1 : parts.length;
}

function main() {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
  } catch {
    console.error(`Error: cannot read ${PKG_PATH}`);
    process.exit(1);
  }

  if (!pkg.version) {
    console.error(`Error: no "version" field in ${PKG_PATH}`);
    process.exit(1);
  }

  let fileNames;
  try {
    fileNames = readdirSync(RULES_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    console.error(`Error: cannot read rules directory ${RULES_DIR}`);
    process.exit(1);
  }

  if (fileNames.length === 0) {
    console.error(`Error: no .md files found in ${RULES_DIR}`);
    process.exit(1);
  }

  const ordered = orderFiles(fileNames);

  const files = ordered.map((name) => {
    const content = readFileSync(join(RULES_DIR, name), 'utf-8');
    const lineCount = countLines(content);

    if (!content.startsWith('# ')) {
      console.warn(`Warning: ${name} has no H1 heading on first line`);
    }

    return { name, content, lineCount };
  });

  const metadata = {
    version: pkg.version,
    description: pkg.description,
    baseUrl: BASE_URL,
  };

  const llmsTxt = generateLlmsTxt(files, metadata);
  const llmsFullTxt = generateLlmsFullTxt(files, metadata);

  writeFileSync('llms.txt', llmsTxt);
  writeFileSync('llms-full.txt', llmsFullTxt);
  writeFileSync(join('packages/interact', 'llms.txt'), llmsTxt);

  console.log(`Generated llms.txt (${countLines(llmsTxt)} lines)`);
  console.log(`Generated llms-full.txt (${countLines(llmsFullTxt)} lines)`);
  console.log('Copied llms.txt to packages/interact/llms.txt');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
