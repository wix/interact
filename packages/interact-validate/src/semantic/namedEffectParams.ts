import { Interact } from '@wix/interact';
import type { AnyEffect, EffectParamSchema, EffectSchema, Path, SemanticIssue } from '../types';

const LENGTH_REGEX = /^-?\d*\.?\d+(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?$/i;
const ANGLE_REGEX = /^-?\d*\.?\d+(deg|rad|grad|turn)?$/i;
const CALC_REGEX = /^calc\(.+\)$/i;
const SIDES = ['top', 'right', 'bottom', 'left'];

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const matches = (value: unknown, regex: RegExp) =>
  typeof value === 'string' && (regex.test(value.trim()) || CALC_REGEX.test(value.trim()));

// [is valid, expected value description] per param type - unknown types are not validated
const PARAM_TYPES: Record<
  string,
  {
    isValid: (value: unknown, param: EffectParamSchema) => boolean;
    expected: (param: EffectParamSchema) => string;
  }
> = {
  number: {
    isValid: (value, { min = -Infinity, max = Infinity }) =>
      isNumber(value) && value >= min && value <= max,
    expected: ({ min, max }) =>
      `a number${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`,
  },
  bool: {
    isValid: (value) => typeof value === 'boolean',
    expected: () => 'a boolean',
  },
  enum: {
    isValid: (value, { values = [] }) => values.includes(value),
    expected: ({ values = [] }) => `one of ${values.map((v) => JSON.stringify(v)).join(' | ')}`,
  },
  length: {
    isValid: (value) =>
      isNumber(value) ||
      matches(value, LENGTH_REGEX) ||
      (typeof value === 'object' &&
        value !== null &&
        typeof (value as { unit?: unknown }).unit === 'string' &&
        (isNumber((value as { value?: unknown }).value) ||
          matches((value as { value?: unknown }).value, LENGTH_REGEX))),
    expected: () => "a length (number, '<number><unit>', calc() or { value, unit })",
  },
  angle: {
    isValid: (value) =>
      isNumber(value) ||
      matches(value, ANGLE_REGEX) ||
      (typeof value === 'string' && SIDES.includes(value.trim())),
    expected: () =>
      `an angle (number, '<number>deg', calc() or ${SIDES.map((s) => `'${s}'`).join(' | ')})`,
  },
};

const issue = (
  path: Path,
  domainCode: string,
  message: string,
  severity: SemanticIssue['severity'],
) => ({ code: 'custom', path, message, params: { domainCode }, severity }) as SemanticIssue;

// the namedEffect's params against the schema of the effect registered on Interact under its type
export function checkNamedEffectParams(path: Path, effect: AnyEffect): SemanticIssue[] {
  const { type, ...params } = effect.namedEffect ?? {};
  const module = typeof type === 'string' ? Interact.getRegisteredEffect?.(type, false) : null;
  const schema = (module as { schema?: EffectSchema } | null | undefined)?.schema;
  if (!schema) return [];

  return Object.entries(params).flatMap(([key, value]) => {
    const paramPath = [...path, 'namedEffect', key];
    const param = schema[key];
    if (!param) {
      return [
        issue(
          paramPath,
          'NAMED_EFFECT_UNKNOWN_PARAM',
          `'${key}' is not a parameter of ${type} (expected one of ${Object.keys(schema).join(', ')}).`,
          'warning',
        ),
      ];
    }
    const paramType = PARAM_TYPES[param.type];
    if (value === undefined || !paramType || paramType.isValid(value, param)) return [];
    return [
      issue(
        paramPath,
        'NAMED_EFFECT_INVALID_PARAM',
        `${type} \`${key}\` must be ${paramType.expected(param)}; got ${JSON.stringify(value)}.`,
        'error',
      ),
    ];
  });
}
