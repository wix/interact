import { JSDOM } from 'jsdom';
import type { InteractConfig } from './types';
import type {
  InteractArtifact,
  ArtifactInput,
  FrameworkType,
  HtmlMetadata,
  SetupMetadata,
} from './types';

/**
 * Parse any supported input into a unified InteractArtifact.
 */
export async function parseArtifact(input: ArtifactInput): Promise<InteractArtifact> {
  switch (input.type) {
    case 'separated':
      return parseSeparated(input);
    case 'mixed':
      return parseMixed(input.source);
    case 'url':
      return parseUrl(input.url);
    case 'directory':
      return parseDirectory(input.path);
  }
}

// ---------------------------------------------------------------------------
// Public metadata builders — usable by callers who want to pre-build metadata
// ---------------------------------------------------------------------------

/**
 * Build structured HTML metadata from a raw HTML string.
 * Uses regex and JSDOM to extract data-interact-key values,
 * data-interact-initial flags, and interact-element info.
 */
export function buildHtmlMetadata(html: string): HtmlMetadata {
  const keys = extractDataInteractKeys(html);
  const initialsMap = extractDataInteractInitials(html);
  const initials: Record<string, boolean> = {};
  for (const [k, v] of initialsMap) {
    initials[k] = v;
  }

  const interactElements: { key: string; hasChild: boolean }[] = [];
  if (hasInteractElements(html)) {
    const dom = new JSDOM(html);
    const elements = dom.window.document.querySelectorAll('interact-element');
    for (const el of elements) {
      const key =
        el.getAttribute('data-interact-key') ??
        el.getAttribute('interact-key') ??
        el.getAttribute('key') ??
        '';
      interactElements.push({ key, hasChild: !!el.firstElementChild });
    }

    for (const ie of interactElements) {
      if (ie.key && !keys.includes(ie.key)) {
        keys.push(ie.key);
      }
    }
  }

  return { keys, initials, interactElements };
}

/**
 * Build structured JS setup metadata from a raw JS string.
 * Uses simple string matching — inherently best-effort.
 */
export function buildSetupMetadata(js: string): SetupMetadata {
  const meta: SetupMetadata = {};

  meta.hasGenerate = /generate\s*\(/.test(js);
  meta.hasDestroy = /(?:Interact\.destroy|\.destroy)\s*\(/.test(js);
  meta.hasA11yTriggers = /Interact\.allowA11yTriggers\s*=\s*true/.test(js);
  meta.hasRegisterEffects = js.includes('registerEffects');

  if (meta.hasRegisterEffects) {
    const registerPos = js.indexOf('registerEffects');
    const createPos = js.indexOf('Interact.create');
    if (createPos >= 0) {
      meta.registerBeforeCreate = registerPos < createPos;
    }
  }

  if (/Interact\.setup\s*\(/.test(js)) {
    const setupPos = js.indexOf('Interact.setup');
    const createPos = js.indexOf('Interact.create');
    if (createPos >= 0) {
      meta.setupBeforeCreate = setupPos < createPos;
    }
  }

  return meta;
}

// ---------------------------------------------------------------------------
// Separated
// ---------------------------------------------------------------------------

function parseSeparated(input: {
  config: InteractConfig;
  html?: string;
  css?: string;
  js?: string;
  htmlMeta?: HtmlMetadata;
  setupMeta?: SetupMetadata;
  registeredEffects?: string[];
  framework?: FrameworkType;
}): InteractArtifact {
  const hasPreParsed = !!(
    input.htmlMeta ||
    input.setupMeta ||
    input.registeredEffects ||
    input.framework
  );

  const htmlMeta = input.htmlMeta ?? (input.html ? buildHtmlMetadata(input.html) : undefined);
  const setupMeta = input.setupMeta ?? (input.js ? buildSetupMetadata(input.js) : undefined);
  const framework = input.framework ?? (input.js ? detectFramework(input.js) : undefined);
  const registeredEffects =
    input.registeredEffects ?? (input.js ? extractRegisteredEffects(input.js) : undefined);

  return {
    config: input.config,
    sourceType: 'separated',
    htmlMeta,
    setupMeta,
    registeredEffects,
    framework,
    confidence: hasPreParsed ? 'high' : 'parsed',
    raw:
      input.html || input.css || input.js
        ? { html: input.html, css: input.css, js: input.js }
        : undefined,
  };
}

// ---------------------------------------------------------------------------
// Mixed blob
// ---------------------------------------------------------------------------

function parseMixed(source: string): InteractArtifact {
  const dom = new JSDOM(source);
  const { document } = dom.window;

  const css = extractCss(document);
  const js = extractJs(document);
  const config = extractConfig(js, document);
  const html = extractHtml(document);

  const htmlMeta = html ? buildHtmlMetadata(html) : undefined;
  const setupMeta = js ? buildSetupMetadata(js) : undefined;
  const framework = js ? detectFramework(js) : undefined;
  const registeredEffects = js ? extractRegisteredEffects(js) : undefined;

  return {
    config,
    sourceType: 'mixed',
    htmlMeta,
    setupMeta,
    registeredEffects,
    framework,
    confidence: 'parsed',
    raw: {
      html: html || undefined,
      css: css || undefined,
      js: js || undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

async function parseUrl(url: string): Promise<InteractArtifact> {
  const response = await fetch(url);
  const source = await response.text();
  const artifact = parseMixed(source);
  artifact.sourceType = 'url';
  return artifact;
}

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------

/**
 * Shallow-merge two partial InteractConfig objects.
 * Arrays (interactions) are concatenated; objects (effects, conditions, sequences) are merged.
 */
function mergeConfigs(
  base: Partial<InteractConfig>,
  incoming: Partial<InteractConfig>,
): Partial<InteractConfig> {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(incoming)) {
    const existing = (base as Record<string, unknown>)[key];
    if (existing === undefined) {
      merged[key] = value;
    } else if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value];
    } else if (
      existing !== null &&
      typeof existing === 'object' &&
      !Array.isArray(existing) &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      merged[key] = { ...existing, ...(value as Record<string, unknown>) };
    } else {
      merged[key] = value;
    }
  }

  return merged as Partial<InteractConfig>;
}

function isLikelyConfig(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    ('interactions' in obj || 'effects' in obj)
  );
}

async function parseDirectory(dirPath: string): Promise<InteractArtifact> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const entries = await fs.readdir(dirPath);

  const htmlParts: string[] = [];
  const cssParts: string[] = [];
  const jsParts: string[] = [];
  let mergedConfig: Partial<InteractConfig> = {};
  let foundConfig = false;

  const htmlFiles: string[] = [];
  const jsonFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const ext = path.extname(entry).toLowerCase();

    if (ext === '.html' || ext === '.htm') {
      htmlFiles.push(fullPath);
    } else if (ext === '.json') {
      jsonFiles.push(fullPath);
    } else if (ext === '.css') {
      const content = await readFileSafe(fs, fullPath);
      if (content) cssParts.push(content);
    } else if (ext === '.js' || ext === '.ts' || ext === '.tsx') {
      const content = await readFileSafe(fs, fullPath);
      if (content) jsParts.push(content);
    }
  }

  for (const jsonFile of jsonFiles) {
    const content = await readFileSafe(fs, jsonFile);
    if (!content) continue;
    try {
      const parsed = JSON.parse(content);
      if (isLikelyConfig(parsed)) {
        mergedConfig = mergeConfigs(mergedConfig, parsed as Partial<InteractConfig>);
        foundConfig = true;
      }
    } catch {
      // not valid JSON, skip
    }
  }

  const interactHtmlFiles: string[] = [];
  const otherHtmlFiles: string[] = [];
  for (const htmlFile of htmlFiles) {
    const content = await readFileSafe(fs, htmlFile);
    if (!content) continue;
    if (content.includes('data-interact-key') || content.includes('<interact-element')) {
      interactHtmlFiles.push(content);
    } else {
      otherHtmlFiles.push(content);
    }
  }
  htmlParts.push(...interactHtmlFiles, ...otherHtmlFiles);

  const htmlContent = htmlParts.join('\n');
  const jsContent = jsParts.join('\n');
  const cssContent = cssParts.join('\n');

  if (htmlContent && (htmlContent.includes('<script') || htmlContent.includes('<style'))) {
    const mixedArtifact = parseMixed(htmlContent);

    const finalCss = joinParts(mixedArtifact.raw?.css, cssContent);
    const finalJs = joinParts(mixedArtifact.raw?.js, jsContent);

    let finalConfig: Partial<InteractConfig>;
    if (foundConfig) {
      finalConfig = mergeConfigs(mixedArtifact.config as Partial<InteractConfig>, mergedConfig);
    } else {
      finalConfig = mixedArtifact.config;
    }

    const allJs = finalJs || mixedArtifact.raw?.js;
    const allHtml = mixedArtifact.raw?.html || htmlContent;

    return {
      config: finalConfig as InteractConfig,
      sourceType: 'directory',
      htmlMeta: allHtml ? buildHtmlMetadata(allHtml) : mixedArtifact.htmlMeta,
      setupMeta: allJs ? buildSetupMetadata(allJs) : mixedArtifact.setupMeta,
      registeredEffects: allJs ? extractRegisteredEffects(allJs) : mixedArtifact.registeredEffects,
      framework: allJs ? detectFramework(allJs) : mixedArtifact.framework,
      confidence: 'parsed',
      raw: {
        html: allHtml,
        css: finalCss || undefined,
        js: finalJs || undefined,
      },
    };
  }

  if (!foundConfig && jsContent) {
    const fromJs = extractConfigFromJs(jsContent);
    if (fromJs) {
      mergedConfig = mergeConfigs(mergedConfig, fromJs as Partial<InteractConfig>);
      foundConfig = true;
    }
  }

  if (!foundConfig || !mergedConfig.interactions || !mergedConfig.effects) {
    throw new Error(
      'Could not find InteractConfig in directory. Expected a .json file with { interactions, effects } or a .js file with Interact.create(...).',
    );
  }

  return {
    config: mergedConfig as InteractConfig,
    sourceType: 'directory',
    htmlMeta: htmlContent ? buildHtmlMetadata(htmlContent) : undefined,
    setupMeta: jsContent ? buildSetupMetadata(jsContent) : undefined,
    registeredEffects: jsContent ? extractRegisteredEffects(jsContent) : undefined,
    framework: jsContent ? detectFramework(jsContent) : undefined,
    confidence: 'parsed',
    raw: {
      html: htmlContent || undefined,
      css: cssContent || undefined,
      js: jsContent || undefined,
    },
  };
}

/** Read a file, returning empty string on failure. */
async function readFileSafe(
  fs: typeof import('node:fs/promises'),
  filePath: string,
): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/** Concatenate two optional content strings with a newline separator. */
function joinParts(a: string | undefined, b: string | undefined): string | undefined {
  if (a && b) return a + '\n' + b;
  return a || b || undefined;
}

// ---------------------------------------------------------------------------
// DOM extraction helpers (used when parsing mixed blobs / directories)
// ---------------------------------------------------------------------------

function extractCss(document: Document): string {
  const styles: string[] = [];
  const styleTags = document.querySelectorAll('style');
  for (const tag of styleTags) {
    if (tag.textContent) {
      styles.push(tag.textContent);
    }
    tag.remove();
  }
  return styles.join('\n');
}

function extractJs(document: Document): string {
  const scripts: string[] = [];
  const scriptTags = document.querySelectorAll('script');
  for (const tag of scriptTags) {
    if (
      tag.src &&
      (tag.src.includes('cdn') || tag.src.includes('unpkg') || tag.src.includes('jsdelivr'))
    ) {
      tag.remove();
      continue;
    }
    if (tag.type === 'application/json') {
      continue;
    }
    if (tag.textContent) {
      scripts.push(tag.textContent);
    }
    tag.remove();
  }
  return scripts.join('\n');
}

function extractHtml(document: Document): string {
  const jsonScripts = document.querySelectorAll('script[type="application/json"]');
  for (const tag of jsonScripts) {
    tag.remove();
  }

  const body = document.body;
  return body ? body.innerHTML.trim() : '';
}

/**
 * Extract InteractConfig from JS source and/or DOM.
 * Strategies in priority order:
 * 1. Interact.create(...) call with inline object or variable reference
 * 2. Variable with InteractConfig type annotation
 * 3. <script type="application/json"> tag
 */
function extractConfig(js: string, document: Document): InteractConfig {
  const fromJs = extractConfigFromJs(js);
  if (fromJs) return fromJs;

  const jsonScripts = document.querySelectorAll('script[type="application/json"]');
  for (const jsonScript of jsonScripts) {
    if (!jsonScript.textContent) continue;
    try {
      const parsed = JSON.parse(jsonScript.textContent);
      if (isLikelyConfig(parsed)) {
        return parsed as InteractConfig;
      }
    } catch {
      // not valid JSON, try next
    }
  }

  throw new Error(
    'Could not extract InteractConfig. Expected Interact.create(config) in JS or a <script type="application/json"> with the config.',
  );
}

/**
 * Extract config object from JS source code.
 * Uses balanced brace matching to handle deeply nested configs.
 * Tries all occurrences of Interact.create() to skip comment mentions.
 */
function extractConfigFromJs(js: string): InteractConfig | null {
  if (!js) return null;

  // Strategy 1: Find all Interact.create(...) calls and try each
  let searchPos = 0;
  while (searchPos < js.length) {
    const createIdx = js.indexOf('Interact.create(', searchPos);
    if (createIdx < 0) break;

    const afterCreate = createIdx + 'Interact.create('.length;
    const trimmed = js.slice(afterCreate).trimStart();

    if (trimmed.startsWith('{')) {
      const braceIdx = afterCreate + js.slice(afterCreate).indexOf('{');
      const objStr = extractBalancedBraces(js, braceIdx);
      if (objStr) {
        const config = tryParseConfig(objStr);
        if (config) return config;
      }
    } else if (!trimmed.startsWith(')')) {
      // Variable reference: Interact.create(configVar)
      const varRefMatch = trimmed.match(/^(\w+)/);
      if (varRefMatch) {
        const config = extractConfigFromVariable(js, varRefMatch[1]);
        if (config) return config;
      }
    }

    searchPos = afterCreate;
  }

  // Strategy 2: TypeScript-annotated variable
  const typedMatch = js.match(/(?:const|let|var)\s+(\w+)\s*:\s*InteractConfig\s*=/);
  if (typedMatch) {
    const config = extractConfigFromVariable(js, typedMatch[1]);
    if (config) return config;
  }

  return null;
}

function extractConfigFromVariable(js: string, varName: string): InteractConfig | null {
  const varDeclRegex = new RegExp(
    `(?:const|let|var)\\s+${escapeRegex(varName)}\\s*(?::\\s*\\w+)?\\s*=\\s*`,
  );
  const match = varDeclRegex.exec(js);
  if (!match) return null;

  const afterEquals = match.index + match[0].length;
  const rest = js.slice(afterEquals).trimStart();
  if (!rest.startsWith('{')) return null;

  const objStr = extractBalancedBraces(js, afterEquals + js.slice(afterEquals).indexOf('{'));
  if (!objStr) return null;

  return tryParseConfig(objStr);
}

/**
 * Extract a balanced brace-delimited string starting from `startIdx`.
 * Handles nested braces, strings, template literals, and comments.
 */
function extractBalancedBraces(source: string, startIdx: number): string | null {
  if (source[startIdx] !== '{') return null;

  let depth = 0;
  let i = startIdx;
  const len = source.length;

  while (i < len) {
    const ch = source[i];

    if (ch === '/' && i + 1 < len) {
      if (source[i + 1] === '/') {
        const nl = source.indexOf('\n', i);
        i = nl < 0 ? len : nl + 1;
        continue;
      }
      if (source[i + 1] === '*') {
        const end = source.indexOf('*/', i + 2);
        i = end < 0 ? len : end + 2;
        continue;
      }
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i);
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(startIdx, i + 1);
      }
    }

    i++;
  }

  return null;
}

function skipString(source: string, start: number): number {
  const quote = source[start];
  let i = start + 1;
  const len = source.length;

  while (i < len) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (quote === '`' && source[i] === '$' && i + 1 < len && source[i + 1] === '{') {
      let depth = 1;
      i += 2;
      while (i < len && depth > 0) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') depth--;
        else if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
          i = skipString(source, i);
          continue;
        }
        i++;
      }
      continue;
    }
    if (source[i] === quote) {
      return i + 1;
    }
    i++;
  }

  return len;
}

function tryParseConfig(objStr: string): InteractConfig | null {
  try {
    const cleaned = normalizeJsObjectToJson(objStr);
    const parsed = JSON.parse(cleaned);
    if (isLikelyConfig(parsed)) return parsed as InteractConfig;
  } catch {
    // JSON.parse failed — try Function constructor as fallback
  }

  try {
    // Fallback: use Function constructor to evaluate the object literal.
    // This handles JS-specific syntax that normalizeJsObjectToJson can't convert.
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${objStr})`);
    const parsed = fn();
    if (isLikelyConfig(parsed)) return parsed as InteractConfig;
  } catch {
    // eval also failed
  }

  return null;
}

/**
 * Best-effort conversion of a JS object literal to valid JSON.
 */
function normalizeJsObjectToJson(source: string): string {
  let result = source;

  // Remove single-line comments
  result = result.replace(/\/\/[^\n]*/g, '');
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Replace single quotes with double quotes (outside of already-double-quoted strings)
  result = result.replace(/'/g, '"');

  // Quote unquoted property keys
  result = result.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
  // Handle keys at start of line (after newline)
  result = result.replace(/\n\s*(\w+)\s*:/g, '\n"$1":');

  // Remove trailing commas
  result = result.replace(/,\s*([}\]])/g, '$1');

  // Replace function expressions with placeholder strings
  result = result.replace(
    /:\s*(?:function\s*\([\s\S]*?\)\s*\{[\s\S]*?\}|\([\s\S]*?\)\s*=>\s*(?:\{[\s\S]*?\}|[^,}\]]+))/g,
    ':"[function]"',
  );

  // Replace undefined/null-like JS values
  result = result.replace(/:\s*undefined\b/g, ':null');

  // Replace spread operators with nothing (best effort)
  result = result.replace(/\.\.\.\w+\s*,?/g, '');

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Framework / effect detection
// ---------------------------------------------------------------------------

function detectFramework(js: string): FrameworkType {
  if (js.includes('@wix/interact/react') || /<Interaction[\s>]/.test(js)) {
    return 'react';
  }
  if (js.includes('@wix/interact/web') || js.includes('<interact-element')) {
    return 'web';
  }
  return 'vanilla';
}

function extractRegisteredEffects(js: string): string[] {
  const effects: string[] = [];

  const registerMatch = js.match(/registerEffects\(\s*\[([\s\S]*?)\]\s*\)/);
  if (registerMatch) {
    const arrayContent = registerMatch[1];
    const nameMatches = arrayContent.matchAll(/(\w+)/g);
    for (const m of nameMatches) {
      effects.push(m[1]);
    }
  }

  const spreadMatch = js.match(/registerEffects\(\s*([^)]+)\)/);
  if (spreadMatch && !spreadMatch[1].trim().startsWith('[')) {
    const names = spreadMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const name of names) {
      if (/^\w+$/.test(name) && !effects.includes(name)) {
        effects.push(name);
      }
    }
  }

  return effects;
}

// ---------------------------------------------------------------------------
// Low-level extraction helpers (exported for advanced use cases)
// ---------------------------------------------------------------------------

export function extractDataInteractKeys(html: string): string[] {
  const keys: string[] = [];
  const regex = /data-interact-key=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

export function extractDataInteractInitials(html: string): Map<string, boolean> {
  const initials = new Map<string, boolean>();
  const regex = /data-interact-key=["']([^"']+)["'][^>]*data-interact-initial=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    initials.set(match[1], match[2] === 'true');
  }
  const regex2 = /data-interact-initial=["']([^"']+)["'][^>]*data-interact-key=["']([^"']+)["']/g;
  while ((match = regex2.exec(html)) !== null) {
    initials.set(match[2], match[1] === 'true');
  }
  return initials;
}

export function hasInteractElements(html: string): boolean {
  return /<interact-element[\s>]/i.test(html);
}

export function extractInteractElementKeys(html: string): string[] {
  const keys: string[] = [];
  const dom = new JSDOM(html);
  const elements = dom.window.document.querySelectorAll('interact-element');
  for (const el of elements) {
    const key =
      el.getAttribute('data-interact-key') ??
      el.getAttribute('interact-key') ??
      el.getAttribute('key');
    if (key) keys.push(key);
  }
  return keys;
}

export function hasGenerateCss(js: string | undefined): boolean {
  if (!js) return false;
  return /generate\s*\(/.test(js);
}

export function hasSetupCall(js: string | undefined): boolean {
  if (!js) return false;
  return /Interact\.setup\s*\(/.test(js);
}

export function hasDestroyCall(js: string | undefined): boolean {
  if (!js) return false;
  return /(?:Interact\.destroy|\.destroy)\s*\(/.test(js);
}

export function hasAllowA11yTriggers(js: string | undefined): boolean {
  if (!js) return false;
  return /Interact\.allowA11yTriggers\s*=\s*true/.test(js);
}
