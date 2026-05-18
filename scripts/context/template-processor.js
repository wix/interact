import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveRenderer } from './renderers.js';

const MARKER_RE = /(?<!\\)\{\{(term|include):([^}]+)\}\}/g;

function processMarkers(line, termIndex, templatesDir, errors, resolveIncludes, options = {}) {
  return line.replace(MARKER_RE, (match, type, arg) => {
    if (type === 'term') {
      const dotIdx = arg.indexOf('.');
      if (dotIdx === -1) {
        errors.push(`Invalid term marker format: must be id.renderer — got "${arg}"`);
        return match;
      }
      const id = arg.slice(0, dotIdx);
      const renderer = arg.slice(dotIdx + 1);
      const term = termIndex.get(id);
      if (!term) {
        errors.push(`Unknown term ID "${id}"`);
        return match;
      }
      const result = resolveRenderer(term, renderer);
      if (result.error) {
        errors.push(result.error);
        return match;
      }
      if (options.verbose) {
        console.log(`    {{term:${id}.${renderer}}} → resolved`);
      }
      return result.value;
    }

    if (type === 'include') {
      if (!resolveIncludes) return match;
      const filePath = resolve(templatesDir, arg);
      let fileContent;
      try {
        fileContent = readFileSync(filePath, 'utf-8');
      } catch {
        errors.push(`Include file not found: ${arg}`);
        return match;
      }
      if (options.verbose) {
        console.log(`    {{include:${arg}}} → resolved`);
      }
      return processInclude(fileContent, termIndex, templatesDir, errors);
    }

    return match;
  });
}

function processInclude(content, termIndex, templatesDir, errors) {
  const lines = content.split('\n');
  const result = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      continue;
    }
    result.push(processMarkers(line, termIndex, templatesDir, errors, false));
  }

  return result.join('\n');
}

export function processTemplate(content, termIndex, templatesDir, options = {}) {
  const errors = [];
  const lines = content.split('\n');
  const result = [];
  let inCodeBlock = false;
  let inFrontmatter = lines.length > 0 && lines[0].trim() === '---';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inFrontmatter) {
      result.push(line);
      if (i > 0 && line.trim() === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    result.push(processMarkers(line, termIndex, templatesDir, errors, true, options));
  }

  if (inCodeBlock) {
    errors.push('Unterminated code fence (odd number of ``` or ~~~ lines)');
  }

  const output = result.join('\n').replace(/\\\{\{/g, '{{');

  return { output, errors };
}
