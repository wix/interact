import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glossary } from './glossary.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const check = process.argv.includes('--check');
const TEMPLATES = join(__dirname, 'templates');
const OUT_DIR = join(__dirname, '..', 'rules');
const manifest = [
  { template: 'triggers/event-trigger.md', trigger: 'hover', output: 'hover.md' },
  { template: 'triggers/event-trigger.md', trigger: 'click', output: 'click.md' },
  { template: 'triggers/viewenter.md', trigger: 'viewEnter', output: 'viewenter.md' },
  { template: 'triggers/viewprogress.md', trigger: 'viewProgress', output: 'viewprogress.md' },
  { template: 'triggers/pointermove.md', trigger: 'pointerMove', output: 'pointermove.md' },
  { template: 'composites/integration.md', trigger: null, output: 'integration.md' },
  { template: 'composites/full-lean.md', trigger: null, output: 'full-lean.md' },
];

const resolve = (ctx, path) => path.split('.').reduce((o, k) => o?.[k], ctx);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const union = (arr) => arr.map((x) => `'${x}'`).join(' | ');
const paramsType = (params) =>
  params?.length ? `{\n${params.map((p) => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`).join('\n')}\n}` : '{}';

function loadSections(dir) {
  const map = new Map();
  if (!existsSync(dir)) return map;
  const walk = (d, base) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p, base);
      else if (e.name.endsWith('.md'))
        map.set(relative(base, p).slice(0, -3).replace(/\\/g, '/'), parseSections(readFileSync(p, 'utf8')));
    }
  };
  walk(dir, dir);
  return map;
}

function parseSections(src) {
  const m = new Map();
  const lines = src.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && !/^## /.test(lines[i])) i++;
  while (i < lines.length) {
    const h = lines[i].match(/^## (.+)$/);
    if (!h) {
      i++;
      continue;
    }
    const v = h[1].trim();
    i++;
    const buf = [];
    while (i < lines.length && !/^## /.test(lines[i])) buf.push(lines[i++]);
    m.set(v, buf.join('\n').replace(/\s+$/, ''));
  }
  return m;
}

function resolveIncludes(text, sections, depth = 0) {
  if (depth > 10) throw new Error('Circular include detected');
  return text.replace(/\{\{>\s*([\w/.-]+)(?:#([\w-]+))?\s*\}\}/g, (_, path, variant) => {
    variant = variant || 'default';
    const file = sections.get(path);
    if (!file) throw new Error(`Section not found: ${path}`);
    const content = file.get(variant);
    if (content === undefined) throw new Error(`Variant "${variant}" not found in ${path}`);
    return resolveIncludes(content, sections, depth + 1);
  });
}

function resolveConditionals(text, context) {
  const IF_RE = /\{\{#if\s+([\w.!]+)\}\}([\s\S]*?)(?:\{\{#else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
  let prev;
  do {
    prev = text;
    text = text.replace(IF_RE, (_, path, thenBlock, elseBlock) => {
      const negate = path.startsWith('!');
      const p = negate ? path.slice(1) : path;
      const val = resolve(context, p);
      const truthy = negate ? !val : !!val;
      return truthy ? thenBlock : (elseBlock || '');
    });
  } while (text !== prev);
  return text;
}

function resolveValues(text, context) {
  return text.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const val = resolve(context, path);
    if (val === undefined) throw new Error(`Unresolved placeholder: ${path}`);
    return val === '' ? '' : String(val);
  });
}

function splitEach(text) {
  const O = '{{#each ', C = '{{/each}}';
  const s = text.indexOf(O);
  if (s === -1) return null;
  const oe = text.indexOf('}}', s);
  if (oe === -1) throw new Error('Malformed {{#each}}');
  const tag = text.slice(s, oe + 2);
  const m = tag.match(/\{\{#each\s+([\w.]+)\s+as\s+(\w+)\}\}/);
  if (!m) throw new Error(`Malformed {{#each}} open tag: ${tag}`);
  const [, path, itemName] = m;
  let depth = 1,
    pos = oe + 2;
  while (depth) {
    const o = text.indexOf(O, pos);
    const c = text.indexOf(C, pos);
    if (c === -1) throw new Error('Unclosed {{#each}}');
    if (o !== -1 && o < c) {
      depth++;
      const ic = text.indexOf('}}', o);
      if (ic === -1) throw new Error('Malformed nested {{#each}}');
      pos = ic + 2;
    } else {
      depth--;
      if (!depth) return { head: text.slice(0, s), path, itemName, body: text.slice(oe + 2, c), tail: text.slice(c + C.length) };
      pos = c + C.length;
    }
  }
  throw new Error('Unclosed {{#each}}');
}

function render(text, context, sections) {
  const sp = splitEach(text);
  if (!sp) {
    let t = resolveIncludes(text, sections, 0);
    t = resolveConditionals(t, context);
    t = resolveValues(t, context);
    return t;
  }
  let out = render(sp.head, context, sections);
  const coll = resolve(context, sp.path);
  if (coll === undefined) throw new Error(`{{#each ${sp.path}}}: collection missing`);
  const len = Array.isArray(coll) ? coll.length : Object.keys(coll).length;
  const run = (item, i, n) => render(sp.body, { ...context, [sp.itemName]: item, last: i === n - 1 }, sections);
  if (len === 0) {
    out = out.replace(/\n$/, '');
    return out + render(sp.tail, context, sections);
  }
  if (Array.isArray(coll)) for (let i = 0; i < coll.length; i++) out += run(coll[i], i, coll.length);
  else {
    const ent = Object.entries(coll);
    for (let i = 0; i < ent.length; i++) out += run({ key: ent[i][0], value: ent[i][1] }, i, ent.length);
  }
  return out + render(sp.tail, context, sections);
}

function normalize(s) {
  return s.replace(/[ \t]+$/gm, '').replace(/\s+$/, '') + '\n';
}

function behaviorRows(behaviorKey, triad, defaultKey) {
  const keys = [...new Set(triad.flatMap((t) => Object.keys(t[behaviorKey])))];
  return keys.map((k) => ({
    label: k === defaultKey ? `\`'${k}'\` (default)` : `\`'${k}'\``,
    hoverShort: triad[0][behaviorKey][k]?.short ?? '—',
    clickShort: triad[1][behaviorKey][k]?.short ?? '—',
  }));
}

function buildComputed() {
  const { effects, triggers } = glossary;
  const rows = (o, fn) => Object.entries(o).map(fn);
  const presetBody = rows(effects.presets, ([c, ps]) => `| ${cap(c)} | ${ps.map((p) => `\`${p}\``).join(', ')} |`);
  const presetTableCore = ['| Category | Presets |', '| :--- | :--- |', ...presetBody].join('\n');
  const presetTable = presetTableCore
    .split('\n')
    .map((line) => `   ${line}`)
    .join('\n');
  const rangeTable = ['| Range name | Meaning |', '| :--- | :--- |', ...rows(effects.ranges, ([n, d]) => `| \`${n}\` | ${d} |`)].join('\n');
  const hover = triggers.hover;
  const click = triggers.click;
  const hoverClick = [hover, click];
  return {
    easingList: effects.easings.map((e) => `'${e}'`).join(', '),
    presetTable,
    rangeTable,
    rangeList: rows(effects.ranges, ([n, d]) => `- \`${n}\` — ${d}`).join('\n'),
    triggerTypeUnion: union(effects.triggerTypes),
    rangeNameUnion: union(Object.keys(effects.ranges)),
    transitionEasingUnion: union(effects.transitionEasings),
    paramsType: paramsType(triggers.pointerMove?.params),
    triggerTypeBehaviorRows: behaviorRows('triggerTypes', hoverClick, hover.defaultTriggerType),
    stateActionBehaviorRows: behaviorRows('stateActions', hoverClick, 'toggle'),
  };
}

const sections = loadSections(join(TEMPLATES, 'sections'));
const computed = buildComputed();
let stale = false;

for (const { template, trigger: trig, output } of manifest) {
  const tplPath = join(TEMPLATES, template);
  if (!existsSync(tplPath)) throw new Error(`Missing template: ${template}`);
  let ctx = { ...glossary, computed };
  if (trig != null) {
    const t = glossary.triggers[trig];
    if (!t) throw new Error(`Missing trigger in glossary: ${trig}`);
    ctx = { ...ctx, trigger: { ...t, Name: cap(t.name || trig) }, var: { ...glossary.vars, ...t.vars } };
  }
  const text = readFileSync(tplPath, 'utf8');
  let result = render(text, ctx, sections);
  if (result.includes('{{')) throw new Error(`${output}: unresolved template near ${JSON.stringify(result.match(/\{\{[^}]*\}\}?/)?.[0])}`);
  result = normalize(result);
  const outPath = join(OUT_DIR, output);
  if (check) {
    if (!existsSync(outPath)) throw new Error(`--check: missing ${output}`);
    const exist = normalize(readFileSync(outPath, 'utf8'));
    if (exist !== result) {
      const a = exist.split('\n'),
        b = result.split('\n');
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) {
          console.error(`${basename(outPath)}: mismatch at line ${i + 1}\n  want: ${JSON.stringify(b[i])}\n  have: ${JSON.stringify(a[i])}`);
          break;
        }
      }
      stale = true;
    }
  } else writeFileSync(outPath, result);
}

if (stale) process.exit(1);
