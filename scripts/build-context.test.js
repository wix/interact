import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateGlossary, VALID_CATEGORIES } from './context/glossary-schema.js';
import { buildTermIndex, loadGlossaryFromFile } from './context/glossary-loader.js';
import {
  renderParamsTable,
  renderFieldsTable,
  renderValuesTable,
  renderCaveatsList,
  renderCode,
  renderSignature,
  resolveRenderer,
  generateHeader,
} from './context/renderers.js';
import { processTemplate } from './context/template-processor.js';
import { createProject, validateTermAgainstSource } from './context/ts-extractor.js';
import { discoverPackages } from './context/cli-helpers.js';

const FIXTURES_DIR = resolve(import.meta.dirname, 'test-fixtures');
const TEMPLATES_DIR = join(FIXTURES_DIR, 'templates');

function loadFixtureGlossary() {
  return loadGlossaryFromFile(join(FIXTURES_DIR, 'glossary.yaml'));
}

describe('glossary-schema', () => {
  it('validates a correct glossary without errors', () => {
    const data = loadFixtureGlossary();
    const { errors } = validateGlossary(data);
    expect(errors).toHaveLength(0);
  });

  it('reports missing meta fields', () => {
    const { errors } = validateGlossary({ terms: [] });
    expect(errors.some((e) => e.includes('meta'))).toBe(true);
  });

  it('reports missing required term fields', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{ id: 'test-one' }],
    };
    const { errors } = validateGlossary(data);
    expect(errors.some((e) => e.includes('name'))).toBe(true);
    expect(errors.some((e) => e.includes('category'))).toBe(true);
  });

  it('reports invalid category', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{ id: 'x', name: 'x', category: 'invalid', llm: 'x', human: 'x' }],
    };
    const { errors } = validateGlossary(data);
    expect(errors.some((e) => e.includes('category'))).toBe(true);
  });

  it('reports duplicate IDs', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [
        { id: 'dup', name: 'a', category: 'trigger', llm: 'x', human: 'x' },
        { id: 'dup', name: 'b', category: 'trigger', llm: 'x', human: 'x' },
      ],
    };
    const { errors } = validateGlossary(data);
    expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('reports invalid param entries', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{ id: 'x', name: 'x', category: 'trigger', llm: 'x', human: 'x', params: [{ name: 'p' }] }],
    };
    const { errors } = validateGlossary(data);
    expect(errors.some((e) => e.includes('type'))).toBe(true);
  });

  it('warns on orphan related refs', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{ id: 'x', name: 'x', category: 'trigger', llm: 'x', human: 'x', related: ['nonexistent'] }],
    };
    const { warnings } = validateGlossary(data);
    expect(warnings.some((w) => w.includes('nonexistent'))).toBe(true);
  });

  it('does not warn on cross-package related refs', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{ id: 'x', name: 'x', category: 'trigger', llm: 'x', human: 'x', related: ['@motion/api-registerEffects'] }],
    };
    const { warnings } = validateGlossary(data);
    expect(warnings.some((w) => w.includes('@motion/api-registerEffects'))).toBe(false);
  });

  it('warns when term has multiple structured fields', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{
        id: 'x', name: 'x', category: 'trigger', llm: 'x', human: 'x',
        params: [{ name: 'a', type: 'string', default: null, description: 'd' }],
        fields: [{ name: 'b', type: 'string', required: true, description: 'd' }],
      }],
    };
    const { warnings } = validateGlossary(data);
    expect(warnings.some((w) => w.includes('params') && w.includes('fields'))).toBe(true);
  });

  it('warns on contradictory default:null + required:false', () => {
    const data = {
      meta: { package: 'test', version: '1.0.0', lastAudit: '2026-01-01' },
      terms: [{
        id: 'x', name: 'x', category: 'trigger', llm: 'x', human: 'x',
        params: [{ name: 'p', type: 'string', default: null, required: false, description: 'd' }],
      }],
    };
    const { warnings } = validateGlossary(data);
    expect(warnings.some((w) => w.includes('null') && w.includes('required'))).toBe(true);
  });

  it('exports VALID_CATEGORIES', () => {
    expect(VALID_CATEGORIES).toContain('trigger');
    expect(VALID_CATEGORIES).toContain('preset');
    expect(VALID_CATEGORIES).toHaveLength(7);
  });

  it('reports error for null data', () => {
    const { errors } = validateGlossary(null);
    expect(errors[0]).toContain('non-null object');
  });
});

describe('renderers', () => {
  describe('renderParamsTable', () => {
    it('renders a params table', () => {
      const params = [
        { name: 'threshold', type: 'number', default: 0.2, description: 'Visibility fraction' },
        { name: 'inset', type: 'string', default: 'undefined', description: 'Root margin' },
        { name: 'id', type: 'string', default: null, required: true, description: 'Required ID' },
      ];
      const result = renderParamsTable(params);
      expect(result).toContain('| Param | Type | Default | Description |');
      expect(result).toContain('`threshold`');
      expect(result).toContain('`0.2`');
      expect(result).toContain('—');
      expect(result).toContain('**required**');
    });

    it('returns fallback for empty params', () => {
      expect(renderParamsTable(undefined)).toBe('*No parameters.*');
      expect(renderParamsTable([])).toBe('*No parameters.*');
    });

    it('uses **required** when required: true regardless of default', () => {
      const params = [{ name: 'x', type: 'string', default: 'foo', required: true, description: 'desc' }];
      const result = renderParamsTable(params);
      expect(result).toContain('**required**');
      expect(result).not.toContain('`foo`');
    });

    it('renders — when required: false with default: null', () => {
      const params = [{ name: 'x', type: 'string', default: null, required: false, description: 'desc' }];
      const result = renderParamsTable(params);
      expect(result).toContain('—');
      expect(result).not.toContain('**required**');
    });

    it('renders **required** when required is omitted and default is null', () => {
      const params = [{ name: 'x', type: 'string', default: null, description: 'desc' }];
      const result = renderParamsTable(params);
      expect(result).toContain('**required**');
    });

    it('renders falsy defaults correctly (0, false)', () => {
      const params = [
        { name: 'a', type: 'number', default: 0, description: 'zero' },
        { name: 'b', type: 'boolean', default: false, description: 'false val' },
      ];
      const result = renderParamsTable(params);
      expect(result).toContain('`0`');
      expect(result).toContain('`false`');
    });

    it('escapes pipe characters in type and description', () => {
      const params = [{ name: 'axis', type: "'x' | 'y'", default: "'x'", description: "Axis: x | y" }];
      const result = renderParamsTable(params);
      expect(result).toContain("`'x' \\| 'y'`");
      expect(result).toContain('Axis: x \\| y');
      expect(result).not.toMatch(/\| x \| y \|/);
    });
  });

  describe('renderFieldsTable', () => {
    it('renders a fields table', () => {
      const fields = [
        { name: 'effects', type: 'Record<string, Effect>', required: true, description: 'Effect defs' },
        { name: 'sequences', type: 'Record<string, Seq>', required: false, description: 'Seq defs' },
      ];
      const result = renderFieldsTable(fields);
      expect(result).toContain('| Field | Type | Required | Description |');
      expect(result).toContain('`effects`');
      expect(result).toContain('yes');
      expect(result).toContain('no');
    });

    it('returns fallback for empty fields', () => {
      expect(renderFieldsTable(undefined)).toBe('*No fields.*');
    });
  });

  describe('renderValuesTable', () => {
    it('renders a values table with single-quoted backtick values', () => {
      const values = [
        { value: 'once', description: 'Fires once.' },
        { value: 'repeat', description: 'Fires every time.' },
      ];
      const result = renderValuesTable(values);
      expect(result).toContain('| Value | Description |');
      expect(result).toContain("`'once'`");
      expect(result).toContain("`'repeat'`");
    });

    it('returns fallback for empty values', () => {
      expect(renderValuesTable(undefined)).toBe('*No values.*');
    });
  });

  describe('renderCaveatsList', () => {
    it('renders a bullet list with warning emoji', () => {
      const caveats = ['First caveat.', 'Second caveat.'];
      const result = renderCaveatsList(caveats);
      expect(result).toContain('- ⚠️ First caveat.');
      expect(result).toContain('- ⚠️ Second caveat.');
    });

    it('returns empty string for no caveats', () => {
      expect(renderCaveatsList(undefined)).toBe('');
      expect(renderCaveatsList([])).toBe('');
    });
  });

  describe('renderCode', () => {
    it('wraps code in typescript fenced block', () => {
      const result = renderCode('const x = 1;');
      expect(result).toBe('```typescript\nconst x = 1;\n```');
    });

    it('returns empty for no code', () => {
      expect(renderCode(undefined)).toBe('');
    });

    it('trims trailing newlines', () => {
      const result = renderCode('const x = 1;\n\n');
      expect(result).toBe('```typescript\nconst x = 1;\n```');
    });
  });

  describe('renderSignature', () => {
    it('wraps signature in backticks', () => {
      expect(renderSignature('static create(): Interact')).toBe('`static create(): Interact`');
    });

    it('returns empty for no signature', () => {
      expect(renderSignature(undefined)).toBe('');
    });
  });

  describe('resolveRenderer', () => {
    const term = {
      id: 'test-id',
      name: 'TestTerm',
      llm: 'LLM desc',
      human: 'Human desc',
      signature: 'fn(): void',
      returns: 'void',
      params: [{ name: 'x', type: 'number', default: 1, description: 'desc' }],
      code: 'const x = 1;',
      caveats: ['Watch out.'],
    };

    it('resolves name renderer', () => {
      expect(resolveRenderer(term, 'name')).toEqual({ value: 'TestTerm' });
    });

    it('resolves llm renderer', () => {
      expect(resolveRenderer(term, 'llm')).toEqual({ value: 'LLM desc' });
    });

    it('resolves params-table renderer', () => {
      const result = resolveRenderer(term, 'params-table');
      expect(result.value).toContain('| Param |');
    });

    it('returns error for unknown renderer', () => {
      const result = resolveRenderer(term, 'nonexistent');
      expect(result.error).toContain('Unknown renderer');
    });

    it('returns error for missing required field', () => {
      const result = resolveRenderer({ id: 'no-name' }, 'name');
      expect(result.error).toContain('no "name" field');
    });
  });

  describe('generateHeader', () => {
    it('produces a header pointing to the source template', () => {
      const header = generateHeader('rules/triggers.md');
      expect(header).toContain('GENERATED FILE');
      expect(header).toContain('context/templates/rules/triggers.md');
      expect(header).toMatch(/^<!--.*-->$/m);
    });

    it('ends with a blank line for clean separation', () => {
      const header = generateHeader('docs/README.md');
      expect(header.endsWith('\n')).toBe(true);
    });
  });
});

describe('template-processor', () => {
  let termIndex;

  beforeAll(() => {
    const glossary = loadFixtureGlossary();
    termIndex = buildTermIndex(glossary.terms);
  });

  it('processes text markers', () => {
    const content = 'Hello {{term:trigger-hover.name}} world';
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('Hello hover world');
  });

  it('processes table markers', () => {
    const content = '{{term:trigger-viewEnter.params-table}}';
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('| Param |');
    expect(output).toContain('`threshold`');
  });

  it('skips markers inside fenced code blocks', () => {
    const content = [
      '# Code Block Test',
      '',
      'Normal marker: {{term:trigger-hover.name}}',
      '',
      '```typescript',
      '// This marker should NOT be replaced:',
      '{{term:trigger-viewEnter.name}}',
      '```',
      '',
      'After code block: {{term:trigger-hover.llm}}',
    ].join('\n');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('Normal marker: hover');
    expect(output).toContain('{{term:trigger-viewEnter.name}}');
    expect(output).toContain('After code block: Fires on mouseenter/mouseleave events.');
  });

  it('handles escaped markers', () => {
    const content = [
      '# Escaped Markers',
      '',
      'This is a literal: \\{{term:trigger-viewEnter.name}}',
      '',
      'This is real: {{term:trigger-hover.name}}',
    ].join('\n');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('This is a literal: {{term:trigger-viewEnter.name}}');
    expect(output).toContain('This is real: hover');
  });

  it('processes include markers', () => {
    const content = readFileSync(join(TEMPLATES_DIR, 'rules/with-include.md'), 'utf-8');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('This is the **introduction** fragment.');
    expect(output).toContain('Requires BOTH generate(config)');
  });

  it('reports errors for unknown term IDs', () => {
    const content = '{{term:nonexistent-term.llm}}';
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('nonexistent-term');
  });

  it('reports errors for unknown renderers', () => {
    const content = '{{term:trigger-viewEnter.bad-renderer}}';
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('bad-renderer');
  });

  it('reports errors for missing include files', () => {
    const content = '{{include:fragments/does-not-exist.md}}';
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('does-not-exist.md');
  });

  it('preserves frontmatter without processing', () => {
    const content = '---\nname: test\ndescription: "Has {{term:trigger-hover.name}} marker"\n---\n\n# Title\n\n{{term:trigger-hover.name}}';
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('description: "Has {{term:trigger-hover.name}} marker"');
    expect(output).toContain('# Title\n\nhover');
  });

  it('processes a full rules template', () => {
    const content = readFileSync(join(TEMPLATES_DIR, 'rules/triggers.md'), 'utf-8');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('Triggers an animation');
    expect(output).toContain('| Param |');
    expect(output).toContain('⚠️');
    expect(output).toContain('Fires on mouseenter');
  });

  it('processes a docs template', () => {
    const content = readFileSync(join(TEMPLATES_DIR, 'docs/README.md'), 'utf-8');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('Initializes the interaction system');
    expect(output).toContain('```typescript');
    expect(output).toContain('Interact instance');
  });

  it('collects multiple errors from one file', () => {
    const content = [
      '# Errors Test',
      '',
      'Unknown term: {{term:nonexistent-term.llm}}',
      '',
      'Unknown renderer: {{term:trigger-viewEnter.bad-renderer}}',
    ].join('\n');
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.length).toBe(2);
  });

  it('handles nested code fences (4-backtick wrapping 3-backtick)', () => {
    const content = [
      '# Test',
      '````markdown',
      '```typescript',
      '{{term:trigger-hover.name}}',
      '```',
      '````',
      '{{term:trigger-hover.name}}',
    ].join('\n');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('{{term:trigger-hover.name}}');
    expect(output).toMatch(/````\nhover$/m);
  });

  it('does not close backtick fence with tilde fence', () => {
    const content = [
      '```typescript',
      '{{term:trigger-hover.name}}',
      '~~~',
      '{{term:trigger-hover.name}}',
      '```',
      '{{term:trigger-hover.name}}',
    ].join('\n');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    const lines = output.split('\n');
    expect(lines[1]).toBe('{{term:trigger-hover.name}}');
    expect(lines[3]).toBe('{{term:trigger-hover.name}}');
    expect(lines[5]).toBe('hover');
  });

  it('reports unterminated code fence', () => {
    const content = '# Title\n\n```typescript\nconst x = 1;\n';
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.some((e) => e.includes('Unterminated code fence'))).toBe(true);
  });

  it('warns on unterminated frontmatter', () => {
    const content = '---\nname: test\nno closing delimiter\n';
    const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.some((e) => e.includes('Unterminated frontmatter'))).toBe(true);
  });

  it('preserves failed include marker in output', () => {
    const content = 'Before {{include:fragments/does-not-exist.md}} After';
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors.length).toBeGreaterThan(0);
    expect(output).toContain('{{include:fragments/does-not-exist.md}}');
  });

  it('does not resolve includes inside included files (single-level nesting)', () => {
    const content = '{{include:fragments/with-nested-include.md}}';
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('Nested fragment content.');
    expect(output).toContain('{{include:fragments/intro.md}}');
  });
});

describe('ts-extractor', () => {
  const SOURCE_DIR = join(FIXTURES_DIR, 'source');
  let project;

  beforeAll(() => {
    project = createProject(SOURCE_DIR);
  });

  it('validates matching params successfully', () => {
    const term = {
      id: 'trigger-viewEnter',
      sourceFile: 'types.ts',
      sourceName: 'ViewEnterParams',
      params: [
        { name: 'threshold', type: 'number', default: 0.2, description: 'desc' },
        { name: 'inset', type: 'string', default: 'undefined', description: 'desc' },
        { name: 'effectId', type: 'string', default: null, required: true, description: 'desc' },
      ],
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors).toHaveLength(0);
  });

  it('reports error for param not in source', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'ViewEnterParams',
      params: [
        { name: 'nonexistent', type: 'string', default: null, description: 'desc' },
      ],
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors.some((e) => e.message.includes('nonexistent'))).toBe(true);
    expect(errors[0].check).toBe('param-exists');
  });

  it('warns on source property missing from glossary', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'ViewEnterParams',
      params: [
        { name: 'threshold', type: 'number', default: 0.2, description: 'desc' },
      ],
    };
    const { warnings } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(warnings.some((w) => w.message.includes('not listed in glossary'))).toBe(true);
    expect(warnings[0].check).toBe('missing-member');
  });

  it('validates enum values against source union', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'TriggerType',
      values: [
        { value: 'once', description: 'desc' },
        { value: 'repeat', description: 'desc' },
        { value: 'alternate', description: 'desc' },
        { value: 'state', description: 'desc' },
      ],
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors).toHaveLength(0);
  });

  it('reports error for value not in source union', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'TriggerType',
      values: [
        { value: 'nonexistent', description: 'desc' },
      ],
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors.some((e) => e.message.includes('nonexistent'))).toBe(true);
    expect(errors[0].check).toBe('value-exists');
  });

  it('reports error for missing source file', () => {
    const term = {
      id: 'test',
      sourceFile: 'does-not-exist.ts',
      sourceName: 'Foo',
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors.some((e) => e.message.includes('not found'))).toBe(true);
    expect(errors[0].check).toBe('file-exists');
  });

  it('reports error for missing symbol', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'NonexistentType',
    };
    const { errors } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(errors.some((e) => e.message.includes('NonexistentType'))).toBe(true);
    expect(errors[0].check).toBe('symbol-exists');
  });

  it('warns on optionality mismatch', () => {
    const term = {
      id: 'test',
      sourceFile: 'types.ts',
      sourceName: 'ViewEnterParams',
      params: [
        { name: 'inset', type: 'string', default: null, required: true, description: 'desc' },
      ],
    };
    const { warnings } = validateTermAgainstSource(term, project, SOURCE_DIR);
    expect(warnings.some((w) => w.message.includes('optional in source'))).toBe(true);
    expect(warnings[0].check).toBe('param-optionality');
  });
});

describe('glossary-loader', () => {
  it('throws a descriptive error for malformed YAML', () => {
    const malformedPath = join(FIXTURES_DIR, 'malformed.yaml');
    expect(() => loadGlossaryFromFile(malformedPath)).toThrow('Failed to parse YAML');
  });
});

describe('cli-helpers', () => {
  it('throws on nonexistent package name', () => {
    expect(() => discoverPackages({ package: ['nonexistent-pkg-xyz'] }))
      .toThrow('Package directory not found');
  });

  it('returns empty array when no packages have context/', () => {
    const result = discoverPackages({ all: true });
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns empty array when no flags provided', () => {
    const result = discoverPackages({});
    expect(result).toEqual([]);
  });
});

describe('integration — build pipeline', () => {
  let termIndex;

  beforeAll(() => {
    const glossary = loadFixtureGlossary();
    termIndex = buildTermIndex(glossary.terms);
  });

  it('processes all fixture templates without errors', () => {
    const templateFiles = ['rules/triggers.md', 'rules/config.md', 'docs/README.md'];
    for (const file of templateFiles) {
      const content = readFileSync(join(TEMPLATES_DIR, file), 'utf-8');
      const { errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
      expect(errors, `Errors in ${file}`).toHaveLength(0);
    }
  });

  it('config template renders fields-table and values-table', () => {
    const content = readFileSync(join(TEMPLATES_DIR, 'rules/config.md'), 'utf-8');
    const { output, errors } = processTemplate(content, termIndex, TEMPLATES_DIR);
    expect(errors).toHaveLength(0);
    expect(output).toContain('| Field | Type | Required | Description |');
    expect(output).toContain('`effects`');
    expect(output).toContain("| Value | Description |");
    expect(output).toContain("`'once'`");
  });
});

describe('CLI integration', () => {
  const scriptsDir = import.meta.dirname;

  it('build-context.js exits 1 with no flags', () => {
    let caught;
    try {
      execFileSync('node', [join(scriptsDir, 'build-context.js')], { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) { caught = e; }
    expect(caught).toBeDefined();
    expect(caught.status).toBe(1);
    expect(caught.stderr).toContain('No packages specified');
  });

  it('build-context.js exits 1 for nonexistent package', () => {
    let caught;
    try {
      execFileSync('node', [join(scriptsDir, 'build-context.js'), '--package', 'nonexistent-pkg-xyz'], { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) { caught = e; }
    expect(caught).toBeDefined();
    expect(caught.status).toBe(1);
    expect(caught.stderr).toContain('Package directory not found');
  });

  it('validate-context.js exits 1 with no flags', () => {
    let caught;
    try {
      execFileSync('node', [join(scriptsDir, 'validate-context.js')], { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) { caught = e; }
    expect(caught).toBeDefined();
    expect(caught.status).toBe(1);
  });
});
