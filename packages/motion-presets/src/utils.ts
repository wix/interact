import { cssEasings } from '@wix/motion';
import type { LengthInput, LengthValue, Point, ScrubTransitionEasing } from './types';

export function mapRange(
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
  num: number,
): number {
  return ((num - sourceMin) * (targetMax - targetMin)) / (sourceMax - sourceMin) + targetMin;
}

export function distance2d([x1, y1]: Point, [x2, y2]: Point): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function getAngleInDeg(p1: Point = [0, 0], p2: Point = [0, 0], offset: number = 0): number {
  const angle = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
  return (360 + offset + angle) % 360;
}

export function getCssUnits(unit: 'percentage' | string) {
  return unit === 'percentage' ? '%' : unit || 'px';
}

export function getEasing(easing?: keyof typeof cssEasings | string): string {
  return easing ? cssEasings[easing as keyof typeof cssEasings] || easing : cssEasings.linear;
}

export function getEasingFamily(easing: string) {
  if (!cssEasings[easing as keyof typeof cssEasings]) {
    return {
      in: easing,
      inOut: easing,
      out: easing,
    };
  }

  const ease = easing.replace(/In|Out/g, '');
  if (ease === 'linear') {
    return {
      in: `linear`,
      inOut: `linear`,
      out: `linear`,
    };
  }

  return {
    in: `${ease}In`,
    inOut: `${ease}InOut`,
    out: `${ease}Out`,
  };
}

const MOUSE_TRANSITION_EASING_MAP: Record<ScrubTransitionEasing, string> = {
  linear: 'linear',
  easeOut: 'ease-out',
  hardBackOut: 'cubic-bezier(0.58, 2.5, 0, 0.95)',
  elastic:
    'linear( 0, 0.2178 2.1%, 1.1144 8.49%, 1.2959 10.7%, 1.3463 11.81%, 1.3705 12.94%, 1.3726, 1.3643 14.48%, 1.3151 16.2%, 1.0317 21.81%, 0.941 24.01%, 0.8912 25.91%, 0.8694 27.84%, 0.8698 29.21%, 0.8824 30.71%, 1.0122 38.33%, 1.0357, 1.046 42.71%, 1.0416 45.7%, 0.9961 53.26%, 0.9839 57.54%, 0.9853 60.71%, 1.0012 68.14%, 1.0056 72.24%, 0.9981 86.66%, 1 )',
  bounce:
    'linear( 0, 0.0039, 0.0157, 0.0352, 0.0625 9.09%, 0.1407, 0.25, 0.3908, 0.5625, 0.7654, 1, 0.8907, 0.8125 45.45%, 0.7852, 0.7657, 0.7539, 0.75, 0.7539, 0.7657, 0.7852, 0.8125 63.64%, 0.8905, 1 72.73%, 0.9727, 0.9532, 0.9414, 0.9375, 0.9414, 0.9531, 0.9726, 1, 0.9883, 0.9844, 0.9883, 1 )',
};

export function getMouseTransitionEasing(value?: ScrubTransitionEasing) {
  return (value && MOUSE_TRANSITION_EASING_MAP[value]) || 'linear';
}

export function getElementOffset(element: HTMLElement, parent?: HTMLElement) {
  let left = element.offsetLeft;
  let top = element.offsetTop;
  let offsetParent = element.offsetParent as HTMLElement;

  while (offsetParent) {
    if (parent && offsetParent === parent) {
      break;
    }

    left += offsetParent.offsetLeft;
    top += offsetParent.offsetTop;
    offsetParent = offsetParent.offsetParent as HTMLElement;
  }

  return { left, top };
}

export function roundNumber(num: number, precision = 2) {
  return parseFloat(num.toFixed(precision));
}

export function toKeyframeValue(
  custom: Record<string, string | number>,
  key: string,
  useValue: boolean | undefined = false,
  fallback: string | undefined = undefined,
) {
  return useValue ? custom[key] : `var(${key}${fallback !== undefined ? `, ${fallback}` : ''})`;
}

export function declareCustom<K extends string>(
  prefix: string,
  entries: Record<K, [string | number, string]>,
  asWeb: boolean = false,
) {
  const custom: Record<string, string | number> = {};
  const vars = {} as Record<K, string | number>;

  for (const [key, [value, fallback]] of Object.entries(entries) as [
    K,
    [string | number, string],
  ][]) {
    const name = `${prefix}-${key}`;
    custom[name] = value;
    vars[key] = toKeyframeValue(custom, name, asWeb, fallback);
  }

  return { custom, vars };
}

const CSS_UNIT_REGEX = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/i;

/**
 * Normalize unit string to internal format
 */
function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase();
  return lower === '%' ? 'percentage' : lower;
}

/**
 * Parse length value from number, string, or object format
 * @param input - Number, String (e.g., "100px", "50%", "100"), or object { value, type }
 * @param defaultValue - Fallback value if input is invalid
 * @returns Normalized length object { value, type }
 */
export function parseLength(input: LengthInput, defaultValue: LengthValue): LengthValue {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  // Handle number input - use default unit type
  if (typeof input === 'number') {
    return { value: input, unit: defaultValue.unit };
  }

  // Handle object input { value, unit }
  if (typeof input === 'object' && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      return { value, unit: normalizeUnit(input.unit) };
    }
    return defaultValue;
  }

  // Handle string input
  if (typeof input === 'string') {
    const trimmed = input.trim();

    // Try parsing as number + unit (e.g., "100px", "50%")
    const match = trimmed.match(CSS_UNIT_REGEX);
    if (match) {
      return { value: parseFloat(match[1]), unit: normalizeUnit(match[2]) };
    }

    // Try parsing as plain number string (e.g., "100", "100.5")
    if (trimmed !== '') {
      const numValue = Number(trimmed);
      if (!isNaN(numValue)) {
        return { value: numValue, unit: defaultValue.unit };
      }
    }
  }

  return defaultValue;
}

export type DirectionKeywords = readonly string[];

/**
 * Parse direction value from keyword, number (degrees), or string with "deg" suffix
 * @param input - String keyword, number, or "45deg" string
 * @param allowedKeywords - Array of valid keyword strings for this preset
 * @param defaultValue - Fallback value if input is invalid
 * @param acceptAngles - Whether to accept numeric angle values (default: false)
 * @returns Normalized direction value (number for angles, string for keywords)
 */
export function parseDirection<T extends string | number>(
  input: string | number | undefined,
  allowedKeywords: DirectionKeywords,
  defaultValue: T,
  acceptAngles = false,
): T {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  if (typeof input === 'number') {
    return acceptAngles ? (input as T) : defaultValue;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();

    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }

    if (acceptAngles) {
      // Check if it's a degree string (e.g., "45deg", "90DEG")
      const degMatch = trimmed.match(/^(-?\d*\.?\d+)deg$/i);
      if (degMatch) {
        return parseFloat(degMatch[1]) as T;
      }

      // Check if it's just a number as string
      if (trimmed !== '') {
        const numValue = Number(trimmed);
        if (!isNaN(numValue)) {
          return numValue as T;
        }
      }
    }
  }

  return defaultValue;
}

const CSS_UNIT_REGEX_NO_I = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/;
export const CSS_CALC_REGEX = /^calc\(.*\)$/;
export const stripCalc = (str: string) => str.replace(/calc/g, '');

// should not be used to compare direction against preset's default because undefined !== <default>
export function compareKeywordToNonDefaults(direction: string | undefined, compare: string[]) {
  const normalized = direction?.trim().toLowerCase();
  return compare.some((keyword) => normalized === keyword);
}

export function parseLengthLazy(input: LengthInput, defaultValue: LengthValue) {
  const parsedLength = { ...defaultValue };

  if (typeof input === 'number') {
    parsedLength.value = input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    if (CSS_CALC_REGEX.test(trimmed) || CSS_UNIT_REGEX_NO_I.test(trimmed)) {
      return trimmed;
    }
    if (trimmed && !isNaN(Number(trimmed))) {
      parsedLength.value = Number(trimmed);
    }
  }

  if (typeof input === 'object' && input !== null && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      parsedLength.value = value;
      parsedLength.unit = input.unit.toLowerCase();
    }
  }

  return `${parsedLength.value}${getCssUnits(parsedLength.unit)}`;
}

export function parseKeywordLazy<T extends string>(
  input: string | number | undefined,
  allowedKeywords: readonly string[],
  defaultValue: T,
) {
  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }
  }
  return defaultValue;
}
