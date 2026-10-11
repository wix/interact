import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// A2 — hover/click/interest/activate or pointerMove (hitArea !== 'root') effects that change
// size/position (transform: translate*/scale*/matrix*) on the SAME source+target element shift
// the hit area and cause jittery re-entry. Only keyframeEffect keyframes are statically inspectable.
// Source: hover.md, pointermove.md, full-lean.md Common-Pitfalls.

const CODE = 'HIT_AREA_SHIFT';

describe('hitAreaShift — HIT_AREA_SHIFT', () => {
  it('warns for a hover keyframeEffect with a translate transform on the same element', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [
            {
              triggerType: 'alternate',
              duration: 200,
              fill: 'both',
              keyframeEffect: { name: 'lift', keyframes: [{ transform: 'translateY(-4px)' }] },
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    expect(result.valid).toBe(true);
  });

  it('does not warns for a pointerMove keyframeEffect with a scale transform (default hitArea: root)', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'pointerMove',
          effects: [
            {
              fill: 'both',
              keyframeEffect: { name: 'grow', keyframes: [{ transform: 'scale(1.2)' }] },
            },
          ],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(false);
  });

  it('warns for an individual `scale` transform property, not just a transform string', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [
            {
              triggerType: 'alternate',
              duration: 200,
              fill: 'both',
              keyframeEffect: { name: 'grow', keyframes: [{ scale: '1.2' }] },
            },
          ],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('warns for a box metric that resizes the element', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [
            {
              triggerType: 'alternate',
              duration: 200,
              fill: 'both',
              keyframeEffect: { name: 'widen', keyframes: [{ width: '200px' }] },
            },
          ],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('warns for a rotate() transform function', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [
            {
              triggerType: 'alternate',
              duration: 200,
              fill: 'both',
              keyframeEffect: { name: 'turn', keyframes: [{ transform: 'rotate(10deg)' }] },
            },
          ],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn when the effect targets a child via selector', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                selector: '.inner',
                triggerType: 'alternate',
                duration: 200,
                fill: 'both',
                keyframeEffect: { name: 'lift', keyframes: [{ transform: 'translateY(-4px)' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a non-positional keyframe (e.g. opacity)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                triggerType: 'alternate',
                duration: 200,
                fill: 'both',
                keyframeEffect: { name: 'fade', keyframes: [{ opacity: '0.5' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for pointerMove with hitArea: root', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            params: { hitArea: 'root' },
            effects: [
              {
                fill: 'both',
                keyframeEffect: { name: 'grow', keyframes: [{ transform: 'scale(1.2)' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a namedEffect (not statically inspectable)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                namedEffect: { type: 'Pulse' },
                duration: 200,
                triggerType: 'alternate',
                fill: 'both',
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
