import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

const fade = { namedEffect: { type: 'FadeIn' }, duration: 300 };
const slide = { namedEffect: { type: 'SlideIn' }, duration: 600 };
const dim = { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } };

const issuesOf = (config: unknown, code: string) =>
  validateInteractConfig(config).errors.filter((e) => e.code === code);

describe('reducedMotionPolicy', () => {
  it('accepts the field at every level', () => {
    const result = validateInteractConfig({
      effects: { fade: { ...fade, reducedMotionPolicy: 'ignore' } },
      sequences: { seq: { reducedMotionPolicy: 'cancel', effects: [{ effectId: 'fade' }] } },
      interactions: [
        {
          key: 'el',
          trigger: 'click',
          reducedMotionPolicy: 'fade',
          effects: [{ ...slide, reducedMotionPolicy: 'fade' }],
          sequences: [{ sequenceId: 'seq', reducedMotionPolicy: 'collapse' }],
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects it on the config, where the instance sets it', () => {
    expect(
      issuesOf(
        {
          reducedMotionPolicy: 'ignore',
          interactions: [{ key: 'el', trigger: 'click', effects: [slide] }],
        },
        'SCHEMA_UNRECOGNIZED_KEYS',
      ),
    ).toHaveLength(1);
  });

  it('counts a replacement as a reference of its effect', () => {
    expect(
      issuesOf(
        {
          effects: { fade },
          interactions: [
            { key: 'el', trigger: 'click', effects: [{ ...slide, reducedMotionPolicy: 'fade' }] },
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
            { key: 'el', trigger: 'click', effects: [{ ...slide, reducedMotionPolicy: 'nope' }] },
          ],
        },
        'REDUCED_MOTION_EFFECT_NOT_FOUND',
      );

      expect(rest).toEqual([]);
      expect(issue).toMatchObject({
        severity: 'error',
        path: ['interactions', 0, 'effects', 0, 'reducedMotionPolicy'],
      });
    });

    it('is a warning where effects inherit it', () => {
      const issues = issuesOf(
        {
          interactions: [
            { key: 'el', trigger: 'click', reducedMotionPolicy: 'nope', effects: [slide] },
          ],
        },
        'REDUCED_MOTION_EFFECT_NOT_FOUND',
      );

      expect(issues).toEqual([
        expect.objectContaining({
          severity: 'warning',
          path: ['interactions', 0, 'reducedMotionPolicy'],
        }),
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
                effects: [{ ...slide, reducedMotionPolicy: 'dim' }],
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
            effects: { fade },
            interactions: [
              {
                key: 'el',
                trigger: 'click',
                reducedMotionPolicy: 'fade',
                effects: [{ effectId: 'fade' }, dim],
              },
              {
                key: 'el',
                trigger: 'viewProgress',
                reducedMotionPolicy: 'fade',
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
              reducedMotionPolicy: 'collapse',
              effects: [slide, { ...slide, iterations: 0 }],
            },
            {
              key: 'el',
              trigger: 'viewProgress',
              reducedMotionPolicy: 'collapse',
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

  describe('sequence definitions', () => {
    it('reports what an effect inherits where its sequence is referenced, once per reference', () => {
      expect(
        issuesOf(
          {
            effects: { dim },
            sequences: { seq: { reducedMotionPolicy: 'dim', effects: [slide] } },
            interactions: [
              { key: 'a', trigger: 'click', sequences: [{ sequenceId: 'seq' }] },
              { key: 'b', trigger: 'hover', sequences: [{ sequenceId: 'seq' }] },
            ],
          },
          'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
        ).map(({ severity, path }) => ({ severity, path })),
      ).toEqual([
        { severity: 'warning', path: ['interactions', 0, 'sequences', 0] },
        { severity: 'warning', path: ['interactions', 1, 'sequences', 0] },
      ]);
    });

    it("reports an effect's own policy once, on the definition", () => {
      expect(
        issuesOf(
          {
            sequences: {
              seq: { effects: [{ ...slide, iterations: 0, reducedMotionPolicy: 'collapse' }] },
            },
            interactions: [
              { key: 'a', trigger: 'click', sequences: [{ sequenceId: 'seq' }] },
              { key: 'b', trigger: 'hover', sequences: [{ sequenceId: 'seq' }] },
            ],
          },
          'REDUCED_MOTION_COLLAPSE_CANCELS',
        ).map(({ path }) => path),
      ).toEqual([['sequences', 'seq', 'effects', 0]]);
    });
  });

  it('tells a time replacement from a scrub one by the effect schema it validates against', () => {
    expect(
      issuesOf(
        {
          effects: { fade, scrub: { namedEffect: { type: 'FadeScroll' } } },
          interactions: [
            {
              key: 'el',
              trigger: 'click',
              effects: [
                { ...slide, reducedMotionPolicy: 'fade' },
                { ...slide, reducedMotionPolicy: 'scrub' },
              ],
            },
          ],
        },
        'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
      ).map(({ path }) => path),
    ).toEqual([['interactions', 0, 'effects', 1]]);
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
              effects: [{ effectId: 'fade', reducedMotionPolicy: 'fade' }],
            },
          ],
        },
        'REDUCED_MOTION_SELF_REFERENCE',
      ),
    ).toHaveLength(1);
  });

  it('warns about an effect id shadowed by a policy mode', () => {
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
    const configWith = (sourcePolicy?: string, definitionHandling?: string) => ({
      effects: { fade: { ...fade, reducedMotionPolicy: definitionHandling } },
      interactions: [
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ effectId: 'fade', reducedMotionPolicy: sourcePolicy }],
        },
        { key: 'b', trigger: 'animationEnd', params: { effectId: 'fade' }, effects: [slide] },
      ],
    });

    it('warns when the source resolves a different policy at its use site', () => {
      expect(
        issuesOf(configWith('cancel'), 'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH'),
      ).toEqual([expect.objectContaining({ path: ['interactions', 0, 'effects', 0] })]);
    });

    it('accepts a policy set on the definition', () => {
      expect(
        issuesOf(configWith(undefined, 'cancel'), 'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH'),
      ).toHaveLength(0);
    });
  });
});
