import { describe, it, expect } from 'vitest';
import {
  orderFiles,
  extractDescription,
  generateLlmsTxt,
  generateLlmsFullTxt,
} from './generate-llms.mjs';

const BASE_URL = 'https://wix.github.io/interact';

const METADATA = {
  version: '1.0.0',
  description: 'Test description for the library.',
  baseUrl: BASE_URL,
};

function makeFile(name, heading, descriptionLine, extraLines = 3) {
  const lines = [`# ${heading}`, '', descriptionLine];
  for (let i = 0; i < extraLines; i++) {
    lines.push(`Line ${i + 1} of ${name}.`);
  }
  lines.push('');
  const content = lines.join('\n');
  const lineCount = lines.length - 1; // trailing empty string from final \n
  return { name, content, lineCount };
}

const CURRENT_FILENAMES = [
  'full-lean.md',
  'integration.md',
  'click.md',
  'hover.md',
  'pointermove.md',
  'viewenter.md',
  'viewprogress.md',
];

function makeCurrentFiles() {
  return [
    makeFile('full-lean.md', '@wix/interact — Rules', 'Complete reference.', 5),
    makeFile(
      'integration.md',
      '@wix/interact Integration Rules',
      'Setup and framework patterns.',
      4,
    ),
    makeFile(
      'click.md',
      'Click Trigger Rules for @wix/interact',
      'Click-triggered interactions.',
      2,
    ),
    makeFile(
      'hover.md',
      'Hover Trigger Rules for @wix/interact',
      'Hover-triggered interactions.',
      2,
    ),
    makeFile(
      'pointermove.md',
      'PointerMove Trigger Rules for @wix/interact',
      'Pointer-driven real-time animations.',
      3,
    ),
    makeFile(
      'viewenter.md',
      'ViewEnter Trigger Rules for @wix/interact',
      'Viewport entrance animations.',
      3,
    ),
    makeFile(
      'viewprogress.md',
      'ViewProgress Trigger Rules for @wix/interact',
      'Scroll-driven animations.',
      3,
    ),
  ];
}

// ─── orderFiles ──────────────────────────────────────────────

describe('orderFiles', () => {
  it('orders the current 7 files correctly', () => {
    const shuffled = [
      'viewprogress.md',
      'click.md',
      'integration.md',
      'hover.md',
      'full-lean.md',
      'pointermove.md',
      'viewenter.md',
    ];
    expect(orderFiles(shuffled)).toEqual([
      'full-lean.md',
      'integration.md',
      'click.md',
      'hover.md',
      'pointermove.md',
      'viewenter.md',
      'viewprogress.md',
    ]);
  });

  it('appends unknown file after all known trigger files', () => {
    const input = [...CURRENT_FILENAMES, 'zebra.md'];
    const result = orderFiles(input);
    expect(result.indexOf('zebra.md')).toBe(result.length - 1);
  });

  it('appends multiple unknown files alphabetically after known files', () => {
    const input = [...CURRENT_FILENAMES, 'zzz.md', 'aaa.md'];
    const result = orderFiles(input);
    const unknownStart = CURRENT_FILENAMES.length;
    expect(result.slice(unknownStart)).toEqual(['aaa.md', 'zzz.md']);
  });

  it('returns empty array for empty input', () => {
    expect(orderFiles([])).toEqual([]);
  });

  it('sorts only-unknown files alphabetically', () => {
    expect(orderFiles(['gamma.md', 'alpha.md', 'beta.md'])).toEqual([
      'alpha.md',
      'beta.md',
      'gamma.md',
    ]);
  });
});

// ─── extractDescription ──────────────────────────────────────

describe('extractDescription', () => {
  it('extracts description from a standard file', () => {
    const content = '# Title\n\nDescription line here\n';
    expect(extractDescription(content)).toBe('Description line here');
  });

  it('skips blank lines between heading and description', () => {
    const content = '# Title\n\n\n\nDescription after blanks\n';
    expect(extractDescription(content)).toBe('Description after blanks');
  });

  it('returns empty string when no content after heading', () => {
    expect(extractDescription('# Title\n')).toBe('');
    expect(extractDescription('# Title\n\n\n')).toBe('');
  });

  it('returns empty string when no heading exists', () => {
    expect(extractDescription('No heading here\nJust text\n')).toBe('');
  });

  it('truncates long description to first sentence', () => {
    const long =
      '# Title\n\nFirst sentence here. ' +
      'Second sentence that pushes the total well beyond one hundred and twenty characters easily enough to trigger truncation.\n';
    expect(extractDescription(long)).toBe('First sentence here.');
  });

  it('handles period inside backticks followed by sentence break', () => {
    const content =
      '# Title\n\n' +
      'These rules help generate pointer-driven interactions using `@wix/interact`. ' +
      'PointerMove triggers create real-time animations that respond to mouse movement over elements or the entire viewport.\n';
    expect(extractDescription(content)).toBe(
      'These rules help generate pointer-driven interactions using `@wix/interact`.',
    );
  });

  it('returns the full line when under 120 chars', () => {
    const content = '# Title\n\nShort description.\n';
    expect(extractDescription(content)).toBe('Short description.');
  });

  it('returns full single-sentence line even if over 120 chars', () => {
    const sentence =
      'This is one extremely long sentence without any period-space breaks that goes on and on far past one hundred and twenty characters total';
    const content = `# Title\n\n${sentence}\n`;
    expect(extractDescription(content)).toBe(sentence);
  });
});

// ─── generateLlmsTxt ────────────────────────────────────────

describe('generateLlmsTxt', () => {
  const files = makeCurrentFiles();
  const output = generateLlmsTxt(files, METADATA);
  const outputLines = output.split('\n');

  it('starts with exactly one H1', () => {
    const h1Lines = outputLines.filter((l) => l.startsWith('# '));
    expect(h1Lines).toHaveLength(1);
    expect(outputLines[0]).toBe('# @wix/interact');
  });

  it('has a blockquote with the package description', () => {
    expect(output).toContain(`> ${METADATA.description}`);
  });

  it('includes static body text between blockquote and ## Docs', () => {
    const blockquoteIdx = outputLines.indexOf(`> ${METADATA.description}`);
    const docsIdx = outputLines.indexOf('## Docs');
    expect(blockquoteIdx).toBeGreaterThan(-1);
    expect(docsIdx).toBeGreaterThan(blockquoteIdx);

    const between = outputLines.slice(blockquoteIdx + 1, docsIdx).join('\n');
    expect(between).toContain('npm install @wix/interact');
    expect(between).toContain('Five trigger types');
  });

  it('has ## Docs with 2 entries', () => {
    const docsIdx = outputLines.indexOf('## Docs');
    const optIdx = outputLines.indexOf('## Optional');
    const docsLinks = outputLines.slice(docsIdx, optIdx).filter((l) => l.startsWith('- ['));
    expect(docsLinks).toHaveLength(2);
  });

  it('has ## Optional with 6 entries (5 triggers + llms-full.txt)', () => {
    const optIdx = outputLines.indexOf('## Optional');
    const optLinks = outputLines.slice(optIdx).filter((l) => l.startsWith('- ['));
    expect(optLinks).toHaveLength(6);
  });

  it('uses absolute HTTPS URLs for all links', () => {
    const links = outputLines.filter((l) => l.startsWith('- ['));
    for (const link of links) {
      expect(link).toMatch(/\(https:\/\//);
    }
  });

  it('includes correct line counts in parentheses', () => {
    for (const file of files) {
      expect(output).toContain(`(${file.lineCount} lines)`);
    }
  });

  it('has no trailing whitespace on any line', () => {
    for (const line of outputLines) {
      expect(line).toBe(line.trimEnd());
    }
  });
});

// ─── generateLlmsFullTxt ────────────────────────────────────

describe('generateLlmsFullTxt', () => {
  const files = makeCurrentFiles();
  const output = generateLlmsFullTxt(files, METADATA);

  it('header contains version and file count', () => {
    expect(output).toContain(`v${METADATA.version}`);
    expect(output).toContain(`${files.length} files`);
  });

  it('each file is preceded by a separator', () => {
    for (const file of files) {
      expect(output).toContain(`--- ${file.name} ---`);
    }
  });

  it('includes each file content verbatim', () => {
    for (const file of files) {
      expect(output).toContain(file.content);
    }
  });

  it('files appear in the correct order', () => {
    let lastIdx = -1;
    for (const file of files) {
      const idx = output.indexOf(`--- ${file.name} ---`);
      expect(idx).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it('has no separator after the last file content', () => {
    const lastFile = files[files.length - 1];
    const lastSepIdx = output.lastIndexOf('---');
    const lastContentIdx = output.lastIndexOf(lastFile.content);
    expect(lastContentIdx).toBeGreaterThan(lastSepIdx);
  });

  it('total line count in header matches sum of file line counts', () => {
    const totalLines = files.reduce((sum, f) => sum + f.lineCount, 0);
    expect(output).toContain(`${totalLines} lines`);
  });
});

// ─── determinism ────────────────────────────────────────────

describe('determinism', () => {
  const files = makeCurrentFiles();

  it('generateLlmsTxt produces identical output on repeated calls', () => {
    const a = generateLlmsTxt(files, METADATA);
    const b = generateLlmsTxt(files, METADATA);
    expect(a).toBe(b);
  });

  it('generateLlmsFullTxt produces identical output on repeated calls', () => {
    const a = generateLlmsFullTxt(files, METADATA);
    const b = generateLlmsFullTxt(files, METADATA);
    expect(a).toBe(b);
  });
});
