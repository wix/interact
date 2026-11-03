import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

const fade = { namedEffect: { type: 'FadeIn' }, duration: 300 };
const slide = { namedEffect: { type: 'SlideIn' }, duration: 600 };
const dim = { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } };

const issuesOf = (config: unknown, code: string) =>
  validateInteractConfig(config).errors.filter((e) => e.code === code);

describe('reducedMotionHandling', () => {
  it('accepts the field at every level', () => {
    const result = validateInteractConfig({
      reducedMotionHandling: 'collapse',
      effects: { fade: { ...fade, reducedMotionHandling: 'ignore' } },
      sequences: { seq: { reducedMotionHandling: 'cancel', effects: [{ effectId: 'fade' }] } },
      interactions: [
        {
          key: 'el',
          trigger: 'click',
          reducedMotionHandling: 'fade',
          effects: [{ ...slide, reducedMotionHandling: 'fade' }],
          sequences: [{ sequenceId: 'seq', reducedMotionHandling: 'collapse' }],
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('counts a replacement as a reference of its effect', () => {
    expect(
      issuesOf(
        {
          effects: { fade },
          interactions: [
            { key: 'el', trigger: 'click', effects: [{ ...slide, reducedMotionHandling: 'fade' }] },
          ],
        },
        'UNUSED_EFFECT',
      ),
    ).toHaveLength(0);
  });

  describe('REDUCED_MOTION_EFFECT_NOT_FOUND', () => {
    it('is an error on an effect', () => {
      const [issue, ...rest] = issuesOf(
        {
          interactions: [
            { key: 'el', trigger: 'click', effects: [{ ...slide, reducedMotionHandling: 'nope' }] },
          ],
        },
        'REDUCED_MOTION_EFFECT_NOT_FOUND',
      );

      expect(rest).toEqual([]);
      expect(issue).toMatchObject({
        severity: 'error',
        path: ['interactions', 0, 'effects', 0, 'reducedMotionHandling'],
      });
    });

    it('is a warning where effects inherit it', () => {
      const issues = issuesOf(
        {
          reducedMotionHandling: 'nope',
          interactions: [{ key: 'el', trigger: 'click', effects: [slide] }],
        },
        'REDUCED_MOTION_EFFECT_NOT_FOUND',
      );

      expect(issues).toEqual([
        expect.objectContaining({ severity: 'warning', path: ['reducedMotionHandling'] }),
      ]);
    });
  });

  describe('REDUCED_MOTION_INCOMPATIBLE_EFFECT', () => {
    it('is an error when set on the effect', () => {
      expect(
        issuesOf(
          {
            effects: { dim },
            interactions: [
              {
                key: 'el',
                trigger: 'click',
                effects: [{ ...slide, reducedMotionHandling: 'dim' }],
              },
            ],
          },
          'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
        ),
      ).toEqual([
        expect.objectContaining({ severity: 'error', path: ['interactions', 0, 'effects', 0] }),
      ]);
    });

    it('is a warning when inherited', () => {
      expect(
        issuesOf(
          {
            reducedMotionHandling: 'fade',
            effects: { fade },
            interactions: [
              { key: 'el', trigger: 'click', effects: [{ effectId: 'fade' }, dim] },
              {
                key: 'el',
                trigger: 'viewProgress',
                effects: [{ namedEffect: { type: 'FadeScroll' } }],
              },
            ],
          },
          'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
        ).map(({ severity, path }) => ({ severity, path })),
      ).toEqual([
        { severity: 'warning', path: ['interactions', 0, 'effects', 1] },
        { severity: 'warning', path: ['interactions', 1, 'effects', 0] },
      ]);
    });
  });

  it('informs that collapsing an effect with no end state cancels it', () => {
    expect(
      issuesOf(
        {
          interactions: [
            {
              key: 'el',
              trigger: 'click',
              reducedMotionHandling: 'collapse',
              effects: [slide, { ...slide, iterations: 0 }],
            },
            {
              key: 'el',
              trigger: 'viewProgress',
              reducedMotionHandling: 'collapse',
              effects: [{ namedEffect: { type: 'FadeScroll' } }],
            },
          ],
        },
        'REDUCED_MOTION_COLLAPSE_CANCELS',
      ).map(({ severity, path }) => ({ severity, path })),
    ).toEqual([
      { severity: 'info', path: ['interactions', 0, 'effects', 1] },
      { severity: 'info', path: ['interactions', 1, 'effects', 0] },
    ]);
  });

  it('resolves sequence effects through the sequence definition', () => {
    expect(
      issuesOf(
        {
          effects: { dim },
          sequences: { seq: { reducedMotionHandling: 'dim', effects: [slide] } },
          interactions: [{ key: 'el', trigger: 'click', sequences: [{ sequenceId: 'seq' }] }],
        },
        'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
      ),
    ).toEqual([
      expect.objectContaining({ severity: 'warning', path: ['sequences', 'seq', 'effects', 0] }),
    ]);
  });

  it('warns about a replacement by the effect itself', () => {
    expect(
      issuesOf(
        {
          effects: { fade },
          interactions: [
            {
              key: 'el',
              trigger: 'click',
              effects: [{ effectId: 'fade', reducedMotionHandling: 'fade' }],
            },
          ],
        },
        'REDUCED_MOTION_SELF_REFERENCE',
      ),
    ).toHaveLength(1);
  });

  it('warns about an effect id shadowed by a handling mode', () => {
    expect(
      issuesOf(
        {
          effects: { collapse: fade },
          interactions: [{ key: 'el', trigger: 'click', effects: [{ effectId: 'collapse' }] }],
        },
        'REDUCED_MOTION_SHADOWED_EFFECT_ID',
      ),
    ).toEqual([expect.objectContaining({ path: ['effects', 'collapse'] })]);
  });

  describe('REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH', () => {
    const configWith = (sourceHandling?: string, definitionHandling?: string) => ({
      effects: { fade: { ...fade, reducedMotionHandling: definitionHandling } },
      interactions: [
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ effectId: 'fade', reducedMotionHandling: sourceHandling }],
        },
        { key: 'b', trigger: 'animationEnd', params: { effectId: 'fade' }, effects: [slide] },
      ],
    });

    it('warns when the source resolves a different handling at its use site', () => {
      expect(
        issuesOf(configWith('collapse'), 'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH'),
      ).toEqual([expect.objectContaining({ path: ['interactions', 0, 'effects', 0] })]);
    });

    it('accepts a handling set on the definition', () => {
      expect(
        issuesOf(configWith(undefined, 'collapse'), 'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH'),
      ).toHaveLength(0);
    });
  });
});
