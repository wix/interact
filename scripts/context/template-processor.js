import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveRenderer } from './renderers.js';

const ESCAPE_PLACEHOLDER = '\x00ESC_BRACE\x00';

function processMarkers(line, termIndex, templatesDir, errors, resolveIncludes, options = {}) {
  const markerRe = /\{\{(term|include):([^}]+)\}\}/g;
  const safeLineInput = line.replace(/\\\{\{/g, ESCAPE_PLACEHOLDER);

  const processed = safeLineInput.replace(markerRe, (match, type, arg) => {
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
      return processLines(fileContent.split('\n'), termIndex, templatesDir, errors, false).result.join('\n');
    }

    return match;
  });

  return processed.replaceAll(ESCAPE_PLACEHOLDER, '{{');
}

function tryToggleFence(trimmed, currentFence) {
  const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
  if (!fenceMatch) return { fence: currentFence, matched: false };

  const fence = fenceMatch[1];
  if (currentFence === null) {
    return { fence, matched: true };
  }
  if (fence[0] === currentFence[0] && fence.length >= currentFence.length && trimmed.slice(fence.length).trim() === '') {
    return { fence: null, matched: true };
  }
  return { fence: currentFence, matched: false };
}

function processLines(lines, termIndex, templatesDir, errors, resolveIncludes, options = {}) {
  const result = [];
  let codeBlockFence = null;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const { fence, matched } = tryToggleFence(trimmed, codeBlockFence);
    codeBlockFence = fence;

    if (matched || codeBlockFence !== null) {
      result.push(line);
      continue;
    }

    result.push(processMarkers(line, termIndex, templatesDir, errors, resolveIncludes, options));
  }

  return { result, unterminatedFence: codeBlockFence !== null };
}

export function processTemplate(content, termIndex, templatesDir, options = {}) {
  const errors = [];
  const lines = content.split('\n');

  let inFrontmatter = lines.length > 0 && lines[0].trim() === '---';
  let frontmatterEnd = 0;

  if (inFrontmatter) {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        frontmatterEnd = i + 1;
        break;
      }
    }
    if (frontmatterEnd === 0) {
      errors.push('Unterminated frontmatter (opening --- without closing ---)');
      frontmatterEnd = lines.length;
    }
  }

  const frontmatterLines = lines.slice(0, frontmatterEnd);
  const bodyLines = lines.slice(frontmatterEnd);

  const { result: processedBody, unterminatedFence } = processLines(bodyLines, termIndex, templatesDir, errors, true, options);

  if (unterminatedFence) {
    errors.push('Unterminated code fence (odd number of ``` or ~~~ lines)');
  }

  const output = [...frontmatterLines, ...processedBody].join('\n');
  return { output, errors };
}
