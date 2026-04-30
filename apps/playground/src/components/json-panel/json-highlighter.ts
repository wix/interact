export type JsonHighlightKind = 'key' | 'string' | 'number' | 'literal' | 'punctuation';

export interface JsonTokenSpan {
  kind: JsonHighlightKind;
  start: number;
  end: number;
}

export const JSON_HIGHLIGHT_NAMES: Record<JsonHighlightKind, string> = {
  key: 'pg-json-key',
  string: 'pg-json-string',
  number: 'pg-json-number',
  literal: 'pg-json-literal',
  punctuation: 'pg-json-punctuation',
};

const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;

export function tokenizeJson(text: string): JsonTokenSpan[] {
  const tokens: JsonTokenSpan[] = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if ('{}[]:,'.includes(char)) {
      tokens.push({ kind: 'punctuation', start: index, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '"') {
      const end = findStringEnd(text, index);
      tokens.push({
        kind: isObjectKey(text, end) ? 'key' : 'string',
        start: index,
        end,
      });
      index = end;
      continue;
    }

    const numberMatch = NUMBER_RE.exec(text.slice(index));
    if (numberMatch) {
      tokens.push({
        kind: 'number',
        start: index,
        end: index + numberMatch[0].length,
      });
      index += numberMatch[0].length;
      continue;
    }

    const literal = readLiteral(text, index);
    if (literal) {
      tokens.push({
        kind: 'literal',
        start: index,
        end: index + literal.length,
      });
      index += literal.length;
      continue;
    }

    index += 1;
  }

  return tokens;
}

function findStringEnd(text: string, start: number): number {
  let index = start + 1;

  while (index < text.length) {
    if (text[index] === '\\') {
      index += 2;
      continue;
    }

    if (text[index] === '"') {
      return index + 1;
    }

    index += 1;
  }

  return text.length;
}

function isObjectKey(text: string, stringEnd: number): boolean {
  let index = stringEnd;
  while (index < text.length && isWhitespace(text[index])) {
    index += 1;
  }
  return text[index] === ':';
}

function readLiteral(text: string, start: number): string | null {
  for (const literal of ['true', 'false', 'null']) {
    if (text.startsWith(literal, start) && isLiteralBoundary(text[start + literal.length])) {
      return literal;
    }
  }
  return null;
}

function isLiteralBoundary(char: string | undefined): boolean {
  return !char || /[\s,\]}:]/.test(char);
}

function isWhitespace(char: string | undefined): boolean {
  return !!char && /\s/.test(char);
}
