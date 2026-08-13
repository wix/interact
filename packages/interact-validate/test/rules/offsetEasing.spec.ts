import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

const EFFECTS = [{ namedEffect: { type: 'FadeIn' }, duration: 400 }];

describe('offsetEasing', () => {
  describe('FUNCTION_OFFSET_EASING (warning)', () => {
    it('warns on an inline sequence with a function offsetEasing', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            sequences: [{ offset: 100, offsetEasing: (p: number) => p ** 2, effects: EFFECTS }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'FUNCTION_OFFSET_EASING');

      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['interactions', 0, 'sequences', 0, 'offsetEasing']);
      expect(result.valid).toBe(true);
    });

    it('warns once, at the definition, for a referenced registry sequence', () => {
      const result = validateInteractConfig({
        sequences: {
          stagger: { offset: 100, offsetEasing: (p: number) => p ** 2, effects: EFFECTS },
        },
        interactions: [
          { key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'stagger' }] },
          { key: 'el2', trigger: 'viewEnter', sequences: [{ sequenceId: 'stagger' }] },
        ],
      });
      const errs = result.errors.filter((e) => e.code === 'FUNCTION_OFFSET_EASING');

      expect(errs).toHaveLength(1);
      expect(errs[0].path).toEqual(['sequences', 'stagger', 'offsetEasing']);
    });

    it('warns when a reference overrides a string easing with a function', () => {
      const result = validateInteractConfig({
        sequences: { stagger: { offset: 100, offsetEasing: 'quadIn', effects: EFFECTS } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            sequences: [{ sequenceId: 'stagger', offsetEasing: (p: number) => p ** 2 }],
          },
        ],
      });
      const errs = result.errors.filter((e) => e.code === 'FUNCTION_OFFSET_EASING');

      expect(errs).toHaveLength(1);
      expect(errs[0].path).toEqual(['interactions', 0, 'sequences', 0, 'offsetEasing']);
    });

    it.each(['linear', 'quadIn', 'cubic-bezier(0.25, 0.1, 0.25, 1)', 'linear(0, 0.5 50%, 1)'])(
      'does not warn for the string easing %s',
      (offsetEasing) => {
        const result = validateInteractConfig({
          interactions: [
            {
              key: 'el',
              trigger: 'viewEnter',
              sequences: [{ offset: 100, offsetEasing, effects: EFFECTS }],
            },
          ],
        });

        expect(result.errors.filter((e) => e.code === 'FUNCTION_OFFSET_EASING')).toHaveLength(0);
      },
    );

    it('does not warn when offsetEasing is omitted', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            sequences: [{ offset: 100, effects: EFFECTS }],
          },
        ],
      });

      expect(result.errors.filter((e) => e.code === 'FUNCTION_OFFSET_EASING')).toHaveLength(0);
    });
  });

  describe('OFFSET_EASING rule category', () => {
    const config = {
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          sequences: [{ offset: 100, offsetEasing: (p: number) => p ** 2, effects: EFFECTS }],
        },
      ],
    };

    it('can be silenced via severityOverrides', () => {
      const result = validateInteractConfig(config, {
        severityOverrides: { OFFSET_EASING: 'off' },
      });

      expect(result.errors.filter((e) => e.code === 'FUNCTION_OFFSET_EASING')).toHaveLength(0);
    });

    it('can be demoted to info', () => {
      const result = validateInteractConfig(config, {
        severityOverrides: { OFFSET_EASING: 'info' },
      });

      expect(result.errors.find((e) => e.code === 'FUNCTION_OFFSET_EASING')?.severity).toBe('info');
    });

    it('is promoted to an error by strict', () => {
      const result = validateInteractConfig(config, { strict: true });

      expect(result.errors.find((e) => e.code === 'FUNCTION_OFFSET_EASING')?.severity).toBe(
        'error',
      );
      expect(result.valid).toBe(false);
    });
  });
});
