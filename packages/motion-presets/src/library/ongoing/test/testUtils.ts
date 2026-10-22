import { TimeAnimationOptions } from '../../../types';

export const baseMockOptions: TimeAnimationOptions = {
  id: 'test-id',
};

// [progress, percentage] points of a linear() easing
export function linearPoints(easing: string) {
  return easing
    .replace(/^linear\(|\)$/g, '')
    .split(',')
    .map((point) => point.trim().split(/\s+/).map(parseFloat) as [number, number]);
}

// progress of a linear() easing at a percentage (the last point wins at jumps)
export function progressAt(easing: string, percentage: number) {
  const points = linearPoints(easing);
  let result = points[0][0];
  for (let i = 0; i < points.length; i++) {
    const [value, at] = points[i];
    if (at <= percentage) {
      result = value;
      const next = points[i + 1];
      if (next && next[1] > percentage) {
        return value + ((next[0] - value) * (percentage - at)) / (next[1] - at);
      }
    }
  }
  return result;
}
