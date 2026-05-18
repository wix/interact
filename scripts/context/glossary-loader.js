import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { validateGlossary } from './glossary-schema.js';

export function buildTermIndex(terms) {
  const index = new Map();
  for (const term of terms) {
    index.set(term.id, term);
  }
  return index;
}

export function loadGlossaryFromFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  try {
    return parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse YAML in ${filePath}: ${e.message}`);
  }
}

export function loadAndValidateGlossary(filePath) {
  const data = loadGlossaryFromFile(filePath);
  const { errors, warnings } = validateGlossary(data);
  return { data, errors, warnings };
}
