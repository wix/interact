import { Interact } from '@wix/interact';
import { walkConfig } from '../walkConfig';
import type {
  AnyConfig,
  EffectParamSchema,
  EffectSchema,
  ValidateOptions,
  ValidationError,
} from '../types';

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

function getSchema(type: string, effects: ValidateOptions['effects']): EffectSchema | undefined {
  const module = effects ? effects[type] : Interact.getRegisteredEffect?.(type, false);
  return (module as { schema?: EffectSchema } | null | undefined)?.schema;
}

// validates namedEffect params against the schema of the effect registered under their type
export function checkNamedEffectParams(
  config: AnyConfig,
  effects: ValidateOptions['effects'],
): ValidationError[] {
  const errors: ValidationError[] = [];

  walkConfig(config, {
    onEffect: (path, effect) => {
      const { type, ...params } = effect.namedEffect ?? {};
      const schema = typeof type === 'string' ? getSchema(type, effects) : undefined;
      if (!schema) return;

      Object.entries(params).forEach(([key, value]) => {
        const paramPath = [...path, 'namedEffect', key];
        const param = schema[key];
        if (!param) {
          errors.push({
            code: 'NAMED_EFFECT_UNKNOWN_PARAM',
            message: `'${key}' is not a parameter of ${type} (expected one of ${Object.keys(schema).join(', ')}).`,
            path: paramPath,
            severity: 'warning',
          });
          return;
        }
        const paramType = PARAM_TYPES[param.type];
        if (value !== undefined && paramType && !paramType.isValid(value, param)) {
          errors.push({
            code: 'NAMED_EFFECT_INVALID_PARAM',
            message: `${type} \`${key}\` must be ${paramType.expected(param)}; got ${JSON.stringify(value)}.`,
            path: paramPath,
            severity: 'error',
          });
        }
      });
    },
    onSequence: () => {},
  });

  return errors;
}
