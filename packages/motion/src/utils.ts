import { cssEasings, jsEasings } from './easings';

export function getCssUnits(unit: 'percentage' | string) {
  return unit === 'percentage' ? '%' : unit || 'px';
}

export function getEasing(easing?: keyof typeof cssEasings | string): string {
  return easing ? cssEasings[easing as keyof typeof cssEasings] || easing : cssEasings.linear;
}

function cubicBezierEasing(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
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

function parseCubicBezier(str: string): ((t: number) => number) | undefined {
  const m = str.match(
    /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/,
  );

  if (!m) return undefined;

  const x1 = parseFloat(m[1]);
  const y1 = parseFloat(m[2]);
  const x2 = parseFloat(m[3]);
  const y2 = parseFloat(m[4]);

  if ([x1, y1, x2, y2].some(isNaN)) return undefined;

  return cubicBezierEasing(x1, y1, x2, y2);
}

function parseCssLinear(str: string): ((t: number) => number) | undefined {
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

  const resolved = stops as Array<{ output: number; pos: number }>;

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

export function getJsEasing(
  easing?: keyof typeof jsEasings | string,
): ((t: number) => number) | undefined {
  if (!easing) return undefined;

  const named = jsEasings[easing as keyof typeof jsEasings];

  if (named) return named;

  return parseCubicBezier(easing) ?? parseCssLinear(easing) ?? jsEasings.linear;
}
