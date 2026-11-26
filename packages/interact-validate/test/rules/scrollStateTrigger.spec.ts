import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// scrollState is an on/off trigger like hover / interest: it accepts time-based effects,
// state effects and sequences. `params` is optional (offset 0, axis 'y', scroller 'root').

describe('scrollState trigger', () => {
  it('accepts a state effect with Form 2 params', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'site-header',
          trigger: 'scrollState',
          params: { offset: 120, direction: 'end' },
          effects: [
            {
              transition: {
                duration: 300,
                easing: 'cubicOut',
                styleProperties: [{ name: 'translate', value: '0 -100%' }],
              },
            },
          ],
        },
      ],
    });
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('accepts a time effect with a LengthPercentage offset and all params set', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'panel',
          trigger: 'scrollState',
          params: {
            offset: { value: 10, unit: 'vh' },
            direction: 'start',
            axis: 'x',
            scroller: 'nearest',
          },
          effects: [
            {
              selector: '.inner',
              triggerType: 'alternate',
              duration: 200,
              fill: 'both',
              keyframeEffect: { name: 'shrink', keyframes: [{ opacity: 0.8 }] },
            },
          ],
        },
      ],
    });
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('accepts an interaction without params', () => {
    const result = validateInteractConfig({
      effects: { pop: { namedEffect: { type: 'Pulse' }, duration: 300, fill: 'both' } },
      interactions: [{ key: 'el', trigger: 'scrollState', effects: [{ effectId: 'pop' }] }],
    });
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('rejects unknown params', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'scrollState',
          params: { offset: 80, threshold: 0.5 },
          effects: [
            { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects an invalid direction / scroller', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'scrollState',
          params: { direction: 'down', scroller: 'window' },
          effects: [
            { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects an interaction with no effects or sequences', () => {
    const result = validateInteractConfig({
      interactions: [{ key: 'el', trigger: 'scrollState', params: { offset: 80 } }],
    });
    expect(result.valid).toBe(false);
  });
});
