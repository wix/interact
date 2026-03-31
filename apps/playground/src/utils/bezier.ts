import { cssEasings } from '@wix/motion';

export type BezierPoints = [number, number, number, number];

const NAMED_KEYWORD_POINTS: Record<string, BezierPoints> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

export const EASING_PRESETS: Map<string, BezierPoints> = new Map();

for (const [name, value] of Object.entries(cssEasings)) {
  const points = parseCubicBezier(value);
  if (points) {
    EASING_PRESETS.set(name, points);
  }
}

export function parseCubicBezier(str: string): BezierPoints | null {
  if (!str) return null;

  const trimmed = str.trim();

  // Named keyword
  if (NAMED_KEYWORD_POINTS[trimmed]) {
    return [...NAMED_KEYWORD_POINTS[trimmed]];
  }

  // cubic-bezier(x1, y1, x2, y2)
  const match = trimmed.match(
    /^cubic-bezier\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)$/,
  );
  if (!match) return null;

  const nums = match.slice(1).map(Number);
  if (nums.some(isNaN)) return null;

  return nums as unknown as BezierPoints;
}

export function formatCubicBezier(x1: number, y1: number, x2: number, y2: number): string {
  const fmt = (n: number) => Math.round(n * 1000) / 1000;
  return `cubic-bezier(${fmt(x1)}, ${fmt(y1)}, ${fmt(x2)}, ${fmt(y2)})`;
}

const MATCH_TOLERANCE = 0.01;

export function matchPreset(x1: number, y1: number, x2: number, y2: number): string | null {
  for (const [name, [px1, py1, px2, py2]] of EASING_PRESETS) {
    if (
      Math.abs(x1 - px1) < MATCH_TOLERANCE &&
      Math.abs(y1 - py1) < MATCH_TOLERANCE &&
      Math.abs(x2 - px2) < MATCH_TOLERANCE &&
      Math.abs(y2 - py2) < MATCH_TOLERANCE
    ) {
      return name;
    }
  }
  return null;
}

export function sampleBezierCurve(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps = 64,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic bezier with P0=(0,0) and P3=(1,1)
    const x = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    const y = 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    points.push({ x, y });
  }
  return points;
}
