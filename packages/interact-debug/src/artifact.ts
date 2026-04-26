import { JSDOM } from 'jsdom';
import type { InteractConfig } from './types';
import type { InteractArtifact, ArtifactInput, FrameworkType } from './types';

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
// Separated
// ---------------------------------------------------------------------------

function parseSeparated(input: {
  config: InteractConfig;
  html: string;
  css?: string;
  js?: string;
}): InteractArtifact {
  const framework = input.js ? detectFramework(input.js) : undefined;
  const registeredEffects = input.js ? extractRegisteredEffects(input.js) : undefined;

  return {
    config: input.config,
    html: input.html,
    css: input.css,
    js: input.js,
    framework,
    registeredEffects,
    sourceType: 'separated',
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
  const framework = js ? detectFramework(js) : undefined;
  const registeredEffects = js ? extractRegisteredEffects(js) : undefined;

  return {
    config,
    html,
    css: css || undefined,
    js: js || undefined,
    framework,
    registeredEffects,
    sourceType: 'mixed',
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
      existing !== null && typeof existing === 'object' && !Array.isArray(existing) &&
      value !== null && typeof value === 'object' && !Array.isArray(value)
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

  // Merge config from all JSON files that look like interact configs
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

  // Merge all HTML files; prioritize those with interact markers but include all
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

  // If any HTML file contains inline scripts/styles, parse as mixed and merge
  if (htmlContent && (htmlContent.includes('<script') || htmlContent.includes('<style'))) {
    const mixedArtifact = parseMixed(htmlContent);

    const finalCss = joinParts(mixedArtifact.css, cssContent);
    const finalJs = joinParts(mixedArtifact.js, jsContent);

    let finalConfig: Partial<InteractConfig>;
    if (foundConfig) {
      finalConfig = mergeConfigs(mixedArtifact.config as Partial<InteractConfig>, mergedConfig);
    } else {
      finalConfig = mixedArtifact.config;
    }

    const allJs = finalJs || mixedArtifact.js;
    return {
      config: finalConfig as InteractConfig,
      html: mixedArtifact.html,
      css: finalCss || undefined,
      js: finalJs || undefined,
      framework: allJs ? detectFramework(allJs) : mixedArtifact.framework,
      registeredEffects: allJs ? extractRegisteredEffects(allJs) : mixedArtifact.registeredEffects,
      sourceType: 'directory',
    };
  }

  // Try extracting config from JS if none found in JSON
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

  const framework = jsContent ? detectFramework(jsContent) : undefined;
  const registeredEffects = jsContent ? extractRegisteredEffects(jsContent) : undefined;

  return {
    config: mergedConfig as InteractConfig,
    html: htmlContent,
    css: cssContent || undefined,
    js: jsContent || undefined,
    framework,
    registeredEffects,
    sourceType: 'directory',
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
// Extraction helpers
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
    if (tag.src && (tag.src.includes('cdn') || tag.src.includes('unpkg') || tag.src.includes('jsdelivr'))) {
      tag.remove();
      continue;
    }
    if (tag.type === 'application/json') {
      // Leave in DOM for extractConfig to find, but don't collect as JS
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
 *
 * Returns a best-effort config. If nothing is found, returns an empty
 * shell so callers can merge additional sources into it.
 */
function extractConfig(js: string, document: Document): InteractConfig {
  const fromJs = extractConfigFromJs(js);
  if (fromJs) return fromJs;

  // Strategy 3: JSON in <script type="application/json">
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
 * Extract config object from JS source code using regex.
 * This is inherently best-effort since we're parsing JS as text.
 */
function extractConfigFromJs(js: string): InteractConfig | null {
  if (!js) return null;

  // Strategy 1a: Interact.create(inlineObject)
  const inlineMatch = js.match(/Interact\.create\(\s*(\{[\s\S]*?\})\s*[,)]/);
  if (inlineMatch) {
    try {
      const cleaned = normalizeJsObjectToJson(inlineMatch[1]);
      const parsed = JSON.parse(cleaned);
      if (isLikelyConfig(parsed)) {
        return parsed as InteractConfig;
      }
    } catch {
      // fall through to variable lookup
    }
  }

  // Strategy 1b: Interact.create(variableName) - find the variable declaration
  const varRefMatch = js.match(/Interact\.create\(\s*(\w+)\s*[,)]/);
  if (varRefMatch) {
    const varName = varRefMatch[1];
    const varDeclRegex = new RegExp(
      `(?:const|let|var)\\s+${escapeRegex(varName)}\\s*=\\s*(\\{[\\s\\S]*?\\});`,
    );
    const varMatch = js.match(varDeclRegex);
    if (varMatch) {
      try {
        const cleaned = normalizeJsObjectToJson(varMatch[1]);
        const parsed = JSON.parse(cleaned);
        if (isLikelyConfig(parsed)) {
          return parsed as InteractConfig;
        }
      } catch {
        // fall through
      }
    }
  }

  // Strategy 2: Variable with InteractConfig type annotation
  const typedMatch = js.match(
    /(?:const|let|var)\s+\w+\s*:\s*InteractConfig\s*=\s*(\{[\s\S]*?\});/,
  );
  if (typedMatch) {
    try {
      const cleaned = normalizeJsObjectToJson(typedMatch[1]);
      const parsed = JSON.parse(cleaned);
      if (isLikelyConfig(parsed)) {
        return parsed as InteractConfig;
      }
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Best-effort conversion of a JS object literal to valid JSON.
 * Handles unquoted keys, trailing commas, single-quoted strings, and function values.
 */
function normalizeJsObjectToJson(source: string): string {
  let result = source;

  // Replace single-quoted strings with double-quoted
  result = result.replace(/'/g, '"');

  // Quote unquoted keys: word characters followed by a colon
  result = result.replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');

  // Remove trailing commas before } or ]
  result = result.replace(/,\s*([}\]])/g, '$1');

  // Replace function values with a placeholder string
  result = result.replace(
    /:\s*(?:function\s*\([\s\S]*?\)\s*\{[\s\S]*?\}|\([\s\S]*?\)\s*=>\s*(?:\{[\s\S]*?\}|[^,}\]]+))/g,
    ':"[function]"',
  );

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

  // Match registerEffects(...) calls and extract the argument list
  const registerMatch = js.match(/registerEffects\(\s*\[([\s\S]*?)\]\s*\)/);
  if (registerMatch) {
    const arrayContent = registerMatch[1];
    const nameMatches = arrayContent.matchAll(/(\w+)/g);
    for (const m of nameMatches) {
      effects.push(m[1]);
    }
  }

  // Also handle registerEffects(effect1, effect2, ...) spread form
  const spreadMatch = js.match(/registerEffects\(\s*([^)]+)\)/);
  if (spreadMatch && !spreadMatch[1].trim().startsWith('[')) {
    const names = spreadMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (const name of names) {
      if (/^\w+$/.test(name) && !effects.includes(name)) {
        effects.push(name);
      }
    }
  }

  return effects;
}

// ---------------------------------------------------------------------------
// Metadata extraction helpers (used by validators)
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
  const regex =
    /data-interact-key=["']([^"']+)["'][^>]*data-interact-initial=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    initials.set(match[1], match[2] === 'true');
  }
  // Also check reverse order
  const regex2 =
    /data-interact-initial=["']([^"']+)["'][^>]*data-interact-key=["']([^"']+)["']/g;
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
