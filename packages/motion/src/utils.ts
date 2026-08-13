import { cssEasings, jsEasings, jsEasingsInCSS, cubicBezierCalc } from './easings';

export function getCssUnits(unit: 'percentage' | string) {
  return unit === 'percentage' ? '%' : unit || 'px';
}

// A vendor-prefixed property is `webkitTransform` as an IDL attribute and
// `-webkit-transform` as a CSS property - the leading dash has to be restored.
const VENDOR_PREFIX = /^(webkit|moz|ms|o)(?=[A-Z])/;

// Keyframe keys that are not plain CSS property names. `offset`, `easing` and
// `composite` keep their WAAPI meaning, so the CSS `offset` shorthand is only
// reachable as `cssOffset`.
// null-prototype so that keys like `constructor` or `toString` don't resolve
// to an inherited member
const KEYFRAME_CSS_TO_WAAPI: Record<string, string> = Object.assign(Object.create(null), {
  float: 'cssFloat',
  'animation-timing-function': 'easing',
  'animation-composition': 'composite',
});

/**
 * Converts a CSS property name to its kebab-case form, for use in CSS text.
 * Already kebab-case names are returned as-is, and custom properties (`--*`)
 * are left untouched since they are case-sensitive.
 */
export function toCSSPropertyName(name: string): string {
  if (name.startsWith('--')) {
    return name;
  }

  const prefixed = VENDOR_PREFIX.test(name) ? `-${name}` : name;

  return prefixed.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/**
 * Converts a CSS property name to its camelCase form, for use with the Web
 * Animations API. Already camelCase names are returned as-is, and custom
 * properties (`--*`) are left untouched since they are case-sensitive.
 */
export function toWAAPIPropertyName(name: string): string {
  if (name.startsWith('--') || !name.includes('-')) {
    return name;
  }

  return name.replace(/^-/, '').replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function toWAAPIKeyframeKey(name: string): string {
  return KEYFRAME_CSS_TO_WAAPI[name] || toWAAPIPropertyName(name);
}

function keyframeNeedsNormalizing(frame: Record<string, any>): boolean {
  for (const name in frame) {
    if (Object.hasOwn(frame, name) && toWAAPIKeyframeKey(name) !== name) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes keyframe property names to the camelCase form WAAPI expects, so
 * that both camelCase and kebab-case are valid input. Returns the same array
 * (and the same frame objects) when everything is already normalized, without
 * allocating - the common case is keyframes that are already camelCase.
 */
export function normalizeKeyframes<T extends Record<string, any>>(keyframes: T[]): T[] {
  if (!Array.isArray(keyframes)) {
    return keyframes;
  }

  let normalized: T[] | undefined;

  keyframes.forEach((frame, index) => {
    if (!frame || typeof frame !== 'object' || !keyframeNeedsNormalizing(frame)) {
      return;
    }

    // first frame that needs normalizing - copy the array, keeping every other frame by reference
    normalized ??= keyframes.slice();

    const normalizedFrame: Record<string, unknown> = {};

    for (const name in frame) {
      if (Object.hasOwn(frame, name)) {
        normalizedFrame[toWAAPIKeyframeKey(name)] = frame[name];
      }
    }

    normalized[index] = normalizedFrame as T;
  });

  return normalized || keyframes;
}

export function getEasing(easing?: keyof typeof cssEasings | string): string {
  return easing ? cssEasings[easing as keyof typeof cssEasings] || easing : cssEasings.linear;
}

export function cubicBezierEasing(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solveT(x: number): number {
    let t = x;

    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;

      if (Math.abs(dx) < 1e-7) return t;

      const d = sampleDX(t);

      if (Math.abs(d) < 1e-6) break;

      t -= dx / d;
    }
    // Bisection fallback
    let lo = 0,
      hi = 1;
    t = (lo + hi) / 2;

    while (hi - lo > 1e-7) {
      const xMid = sampleX(t);
      if (Math.abs(xMid - x) < 1e-7) return t;
      if (x > xMid) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }

    return t;
  }

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleY(solveT(t));
  };
}

function parseCubicBezierParams(str: string): [number, number, number, number] | undefined {
  const m = str.match(
    /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/,
  );

  if (!m) return undefined;

  const x1 = parseFloat(m[1]);
  const y1 = parseFloat(m[2]);
  const x2 = parseFloat(m[3]);
  const y2 = parseFloat(m[4]);

  if ([x1, y1, x2, y2].some(isNaN)) return undefined;

  return [x1, y1, x2, y2];
}

function parseCubicBezier(str: string): ((t: number) => number) | undefined {
  const params = parseCubicBezierParams(str);

  if (!params || params.some(isNaN)) return undefined;

  return cubicBezierEasing(...params);
}

function parseCubicBezierToCalc(str: string): ((t: string) => string) | undefined {
  const params = parseCubicBezierParams(str);

  if (!params || params.some(isNaN)) return undefined;

  return (t) => cubicBezierCalc(t, ...params);
}

function parseCssLinearStops(str: string): Array<{ output: number; pos: number }> | undefined {
  const m = str.match(/^linear\((.+)\)$/);
  if (!m) return undefined;

  const parts = m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return undefined;

  type Stop = { output: number; pos: number | null };
  const stops: Stop[] = [];

  for (const part of parts) {
    const tokens = part.split(/\s+/);
    const output = parseFloat(tokens[0]);

    if (isNaN(output)) return undefined;

    const pcts: number[] = [];

    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i].endsWith('%')) {
        const v = parseFloat(tokens[i]) / 100;
        if (isNaN(v)) return undefined;
        pcts.push(v);
      }
    }

    if (pcts.length === 0) {
      stops.push({ output, pos: null });
    } else if (pcts.length === 1) {
      stops.push({ output, pos: pcts[0] });
    } else {
      // Two percentages: creates a plateau between the two positions
      stops.push({ output, pos: pcts[0] });
      stops.push({ output, pos: pcts[1] });
    }
  }

  if (stops.length === 0) return undefined;
  if (stops[0].pos === null) stops[0].pos = 0;
  if (stops[stops.length - 1].pos === null) stops[stops.length - 1].pos = 1;

  // Distribute positions for stops without an explicit position
  let i = 0;

  while (i < stops.length) {
    if (stops[i].pos === null) {
      const start = i - 1;
      let end = i;

      while (end < stops.length && stops[end].pos === null) end++;

      const startPos = stops[start].pos!;
      const endPos = stops[end].pos!;
      const span = end - start;

      for (let k = start + 1; k < end; k++) {
        stops[k].pos = startPos + ((endPos - startPos) * (k - start)) / span;
      }

      i = end + 1;
    } else {
      i++;
    }
  }

  // Clamp: each stop must be no earlier than the previous one
  for (let j = 1; j < stops.length; j++) {
    if (stops[j].pos! < stops[j - 1].pos!) stops[j].pos = stops[j - 1].pos;
  }

  return stops as Array<{ output: number; pos: number }>;
}

function parseCssLinear(str: string): ((t: number) => number) | undefined {
  const resolved = parseCssLinearStops(str);
  if (!resolved) return undefined;

  return (t: number) => {
    if (t <= resolved[0].pos) return resolved[0].output;

    const last = resolved[resolved.length - 1];

    if (t >= last.pos) return last.output;

    let lo = 0,
      hi = resolved.length - 1;

    while (lo < hi - 1) {
      const mid = (lo + hi) >>> 1;

      if (resolved[mid].pos <= t) lo = mid;
      else hi = mid;
    }

    const a = resolved[lo];
    const b = resolved[hi];
    if (b.pos === a.pos) return b.output;
    return a.output + ((b.output - a.output) * (t - a.pos)) / (b.pos - a.pos);
  };
}

function parseCssLinearToCalc(str: string): ((t: string) => string) | undefined {
  const resolved = parseCssLinearStops(str);
  if (!resolved) return undefined;

  return (t: string) => {
    const terms: string[] = [`${resolved[0].output}`];
    for (let i = 1; i < resolved.length; i++) {
      const dx = resolved[i].pos - resolved[i - 1].pos;
      const dy = resolved[i].output - resolved[i - 1].output;

      if (dx === 0 && resolved[i - 1].pos === 0) {
        terms.push(`${dy}`);
      } else {
        const clampMid =
          dx === 0
            ? `round(${t} / ${2 * resolved[i - 1].pos})`
            : `(${t} - ${resolved[i - 1].pos}) / ${dx}`;
        terms.push(`clamp(0, ${clampMid}, 1) * ${dy}`);
      }
    }
    return `(${terms.join(' + ')})`;
  };
}

export function getJsEasing(
  easing?: keyof typeof jsEasings | string,
): ((t: number) => number) | undefined {
  if (!easing) return undefined;

  const named = jsEasings[easing as keyof typeof jsEasings];

  if (named) return named;

  return parseCubicBezier(easing) ?? parseCssLinear(easing) ?? jsEasings.linear;
}

export function getJsEasingInCSS(
  easing?: keyof typeof jsEasingsInCSS | string,
): ((t: string) => string) | undefined {
  if (!easing) return undefined;

  const named = jsEasingsInCSS[easing as keyof typeof jsEasingsInCSS];

  if (named) return named;

  return parseCubicBezierToCalc(easing) ?? parseCssLinearToCalc(easing) ?? jsEasingsInCSS.linear;
}
