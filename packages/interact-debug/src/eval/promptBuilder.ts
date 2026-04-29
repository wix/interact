import type { EvalScenario } from './types';

const RULE_FILES = [
  'full-lean.md',
  'integration.md',
  'viewenter.md',
  'viewprogress.md',
  'hover.md',
  'click.md',
  'pointermove.md',
];

const BASE_SYSTEM_PROMPT = `You are an expert web developer building animated web pages using the @wix/interact library. You MUST follow the rules and patterns documented below exactly.

Your task is to generate a complete, single-file HTML document with inline <style> and <script> tags that implements the requested animation scenario using @wix/interact.

Requirements for every artifact you generate:
- Output ONLY the HTML document. No explanations, no markdown fences, no commentary.
- The HTML must be a complete document (<!DOCTYPE html>, <html>, <head>, <body>).
- All CSS goes inside a <style> tag in <head>.
- All JavaScript goes inside a <script type="module"> tag at the end of <body>.
- The InteractConfig must be passed to Interact.create() in the script.
- Every interaction key must have a matching element with data-interact-key attribute in the HTML.
- Use import statements for @wix/interact and @wix/motion-presets (ESM).
- Include registerEffects() before Interact.create() when using namedEffect presets.
- Include proper cleanup with destroy().
- Follow all accessibility, FOUC, and best-practice rules from the documentation.`;

/**
 * Build the system prompt by reading all rules files and concatenating them.
 */
export async function buildSystemPrompt(rulesDir?: string): Promise<string> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const resolvedDir = rulesDir ?? findRulesDir(path);
  const sections: string[] = [];

  for (const file of RULE_FILES) {
    const filePath = path.join(resolvedDir, file);
    try {
      const content = await fs.readFile(filePath, { encoding: 'utf-8' });
      sections.push(`--- ${file} ---\n${content}`);
    } catch {
      // Rule file not found — skip
    }
  }

  return (
    BASE_SYSTEM_PROMPT + '\n\n=== @wix/interact Rules Documentation ===\n\n' + sections.join('\n\n')
  );
}

/**
 * Build a system prompt using only a specific subset of rule files.
 * Pass an empty array to get the base prompt with no rules.
 */
export async function buildSystemPromptFromFiles(
  ruleFiles: string[],
  rulesDir?: string,
): Promise<string> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const resolvedDir = rulesDir ?? findRulesDir(path);
  const sections: string[] = [];

  for (const file of ruleFiles) {
    const filePath = path.join(resolvedDir, file);
    try {
      const content = await fs.readFile(filePath, { encoding: 'utf-8' });
      sections.push(`--- ${file} ---\n${content}`);
    } catch {
      // Rule file not found — skip
    }
  }

  return (
    BASE_SYSTEM_PROMPT +
    (sections.length > 0
      ? `\n\n=== @wix/interact Rules Documentation ===\n\n${sections.join('\n\n')}`
      : '')
  );
}

/**
 * Build the user prompt for a specific scenario.
 */
export function buildUserPrompt(scenario: EvalScenario): string {
  return scenario.prompt;
}

/**
 * Locate the rules directory relative to common entry points.
 * Works from both source (src/eval/) and built (dist/) contexts.
 */
function findRulesDir(path: typeof import('node:path')): string {
  const candidates = [
    path.resolve(__dirname, '../../../interact/rules'),
    path.resolve(__dirname, '../../../../packages/interact/rules'),
    path.resolve(process.cwd(), 'packages/interact/rules'),
    path.resolve(process.cwd(), '../interact/rules'),
  ];

  const fs = require('node:fs');
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* continue */
    }
  }

  return candidates[0];
}
