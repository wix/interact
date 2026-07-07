import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// D15 — viewEnter `inset` is like view-timeline-inset: 1–4 whitespace-separated CSS
// lengths/percentages (or `auto`). Source: viewenter `inset`.

const CODE = 'INVALID_INSET';

describe('viewInset — INVALID_INSET', () => {
  it('warns for a non-length inset token', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          params: { inset: 'foo bar' },
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'params', 'inset']);
  });

  it('warns for more than four inset tokens', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          params: { inset: '1px 2px 3px 4px 5px' },
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn for a single negative length', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            params: { inset: '-100px' },
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for two-value inset', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            params: { inset: '-50px 0px' },
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
