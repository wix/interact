import { describe, expect, it } from 'vitest';
import { resolveEffectForCSS, resolveSequenceForCSS } from '../src/core/resolvers';
import type { TriggerType, Effect, EffectRef } from '../src/types';

const EMPTY_CONFIG = {
  effects: {},
  interactions: [],
};
const BASE_INTERACTION = {
  key: 'interactionKey',
  trigger: 'viewEnter' as const,
};
const BASE_CONDITION = {
  type: 'media' as const,
  predicate: '(min-width: 100px)',
};
const BASE_SEQUENCE = { effects: [{}] };

describe('css resolvers', () => {
  describe('effect', () => {
    describe('key', () => {
      it('should use effect key if exists', () => {
        const result = resolveEffectForCSS({ key: 'effectKey' }, BASE_INTERACTION, EMPTY_CONFIG);
        expect(result?.key).toBe('effectKey');
      });
      it('should return null if key is a template', () => {
        expect(resolveEffectForCSS({ key: 'key[]' }, BASE_INTERACTION, EMPTY_CONFIG)).toBeNull();
      });
      it('should inherit key from interaction if does not exist on effect', () => {
        const result = resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG);
        expect(result?.key).toBe(BASE_INTERACTION.key);
      });
      it('should return null if both interaction and effect have no key', () => {
        expect(resolveEffectForCSS({}, { ...BASE_INTERACTION, key: '' }, EMPTY_CONFIG)).toBeNull();
      });
    });

    describe('ElementIdentifier', () => {
      it('should use selector refinements from effect', () => {
        const result = resolveEffectForCSS(
          {
            key: 'effectKey',
            selector: '.selector',
            listContainer: '.listContainer',
            listItemSelector: '.itemSelector',
          } as Effect,
          BASE_INTERACTION,
          EMPTY_CONFIG,
        );
        expect(result).toMatchObject({
          selector: '.selector',
          listContainer: '.listContainer',
          listItemSelector: '.itemSelector',
        });
      });
    });

    describe('effectId', () => {
      it('should use data from referenced effect if effectId exists', () => {
        const result = resolveEffectForCSS({ effectId: 'effectId' }, BASE_INTERACTION, {
          interactions: [],
          effects: { effectId: { namedEffect: { type: 'FadeIn' } } },
        });
        expect(result).toMatchObject({ effectId: 'effectId' });
        expect(result).toHaveProperty('namedEffect');
      });
      it('should generate id if effectId does not exist', () => {
        expect(resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG)?.effectId).toBeTruthy();
      });
    });

    describe('conditions', () => {
      it('should create empty array if conditions is undefined', () => {
        expect(resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG)?.conditions).toEqual([]);
      });
      it('should filter duplications from conditions', () => {
        const result = resolveEffectForCSS(
          { conditions: ['condition', 'condition'] },
          BASE_INTERACTION,
          { interactions: [], effects: {}, conditions: { condition: BASE_CONDITION } },
        );
        expect(result?.conditions).toEqual(['condition']);
      });
      it('should filter non-existing condition names from conditions', () => {
        const result = resolveEffectForCSS(
          { conditions: ['condition', 'garbage'] },
          BASE_INTERACTION,
          { interactions: [], effects: {}, conditions: { condition: BASE_CONDITION } },
        );
        expect(result?.conditions).toEqual(['condition']);
      });
    });

    describe('triggerType', () => {
      it('should default to once if does not exist', () => {
        expect(resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG)?.triggerType).toBe('once');
      });
    });

    describe('initial', () => {
      it('should be false when trigger is not viewEnter', () => {
        const triggers: TriggerType[] = ['click', 'hover', 'viewProgress', 'pointerMove'];
        triggers.forEach((trigger) => {
          expect(
            resolveEffectForCSS({}, { ...BASE_INTERACTION, trigger }, EMPTY_CONFIG)?.initial,
          ).toBe(false);
        });
      });
      it('should be false when trigger is viewEnter and type is different than once', () => {
        expect(
          resolveEffectForCSS(
            { triggerType: 'repeat' } as unknown as Effect,
            BASE_INTERACTION,
            EMPTY_CONFIG,
          )?.initial,
        ).toBe(false);
      });
      it('should be true when trigger is viewEnter and type is once', () => {
        expect(
          resolveEffectForCSS(
            { triggerType: 'once' } as unknown as Effect,
            BASE_INTERACTION,
            EMPTY_CONFIG,
          )?.initial,
        ).toBe(true);
      });
      it('should be true when trigger is viewEnter and type is undefined (default to once)', () => {
        expect(resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG)?.initial).toBe(true);
      });
    });

    describe('EffectProperty', () => {
      it('should have exactly one type of effect property if more are provided', () => {
        const result = resolveEffectForCSS(
          {
            namedEffect: { type: 'FadeIn' },
            keyframeEffect: { name: 'kf', keyframes: [{}] },
            customEffect: () => {},
            transition: { styleProperties: [] },
            transitionProperties: [],
          },
          BASE_INTERACTION,
          EMPTY_CONFIG,
        );
        expect(result).toHaveProperty('namedEffect');
        expect(result).not.toHaveProperty('keyframeEffect');
        expect(result).not.toHaveProperty('customEffect');
        expect(result).not.toHaveProperty('transition');
        expect(result).not.toHaveProperty('transitionProperties');
      });
      it('should return no effect property if none are provided', () => {
        const result = resolveEffectForCSS({}, BASE_INTERACTION, EMPTY_CONFIG);
        expect(result).not.toHaveProperty('namedEffect');
        expect(result).not.toHaveProperty('keyframeEffect');
        expect(result).not.toHaveProperty('customEffect');
        expect(result).not.toHaveProperty('transition');
        expect(result).not.toHaveProperty('transitionProperties');
      });
      it('should return null for namedEffect with no type', () => {
        expect(
          resolveEffectForCSS(
            { namedEffect: {} } as unknown as Effect,
            BASE_INTERACTION,
            EMPTY_CONFIG,
          ),
        ).toBeNull();
      });
      it('should return null for pointerMove with namedEffect', () => {
        expect(
          resolveEffectForCSS(
            { namedEffect: { type: 'BlurMouse' } },
            { ...BASE_INTERACTION, trigger: 'pointerMove' },
            EMPTY_CONFIG,
          ),
        ).toBeNull();
      });
      it('should return null for pointerMove with customEffect', () => {
        expect(
          resolveEffectForCSS(
            { customEffect: () => {} },
            { ...BASE_INTERACTION, trigger: 'pointerMove' },
            EMPTY_CONFIG,
          ),
        ).toBeNull();
      });
      it('should use effectId as keyframes name if name does not exist and has reference', () => {
        const result = resolveEffectForCSS({ effectId: 'effectId' }, BASE_INTERACTION, {
          interactions: [],
          effects: {
            effectId: { keyframeEffect: { name: '', keyframes: [{}] } },
          },
        });
        expect(result).toMatchObject({ keyframeEffect: { name: 'effectId' } });
      });
      it('should use effectId as keyframes name if name does not exist and has no reference', () => {
        const result = resolveEffectForCSS(
          { effectId: 'effectId', keyframeEffect: { name: '', keyframes: [{}] } },
          BASE_INTERACTION,
          EMPTY_CONFIG,
        );
        expect(result).toMatchObject({ keyframeEffect: { name: 'effectId' } });
      });
      it('should generate new name for keyframes if name does not exist and referenced keyframes are overrided', () => {
        const result = resolveEffectForCSS(
          { effectId: 'effectId', keyframeEffect: { name: '', keyframes: [{}] } },
          BASE_INTERACTION,
          {
            interactions: [],
            effects: {
              effectId: { keyframeEffect: { name: 'orig', keyframes: [{}] } },
            },
          },
        );
        expect(result?.keyframeEffect?.name).toBeTruthy();
        expect(result?.keyframeEffect?.name).not.toEqual('orig');
      });
    });
  });

  describe('sequence', () => {
    describe('sequenceId', () => {
      it('should use data from referenced sequence if sequenceId exists', () => {
        const result = resolveSequenceForCSS({ sequenceId: 'sequenceId' }, BASE_INTERACTION, {
          interactions: [],
          effects: {},
          sequences: {
            sequenceId: { sequenceId: 'sequenceId', effects: [{}], delay: 100 },
          },
        });
        expect(result).toMatchObject({ sequenceId: 'sequenceId', effects: [{}], delay: 100 });
      });
      it('should generate id if sequenceId does not exist', () => {
        expect(
          resolveSequenceForCSS(BASE_SEQUENCE, BASE_INTERACTION, EMPTY_CONFIG)?.sequenceId,
        ).toBeTruthy();
      });
    });

    describe('delay, offset, offsetEasing', () => {
      it('should default to 0, 0, linear(function)', () => {
        const result = resolveSequenceForCSS(BASE_SEQUENCE, BASE_INTERACTION, EMPTY_CONFIG);
        expect(result).toMatchObject({ delay: 0, offset: 0 });
        const randomVal = Math.random();
        expect(result?.offsetEasing(randomVal)).toBe(randomVal);
      });
    });

    describe('conditions', () => {
      it('should create empty array if conditions is undefined', () => {
        expect(
          resolveSequenceForCSS(BASE_SEQUENCE, BASE_INTERACTION, EMPTY_CONFIG)?.conditions,
        ).toEqual([]);
      });
      it('should filter duplications from conditions', () => {
        const result = resolveSequenceForCSS(
          { ...BASE_SEQUENCE, conditions: ['condition', 'condition'] },
          BASE_INTERACTION,
          { interactions: [], effects: {}, conditions: { condition: BASE_CONDITION } },
        );
        expect(result?.conditions).toEqual(['condition']);
      });
      it('should filter non-existing condition names from conditions', () => {
        const result = resolveSequenceForCSS(
          { ...BASE_SEQUENCE, conditions: ['condition', 'garbage'] },
          BASE_INTERACTION,
          { interactions: [], effects: {}, conditions: { condition: BASE_CONDITION } },
        );
        expect(result?.conditions).toEqual(['condition']);
      });
    });

    describe('effects', () => {
      it('should pass on conditions to all effects in sequence', () => {
        const effects = [{ effectId: 'e1' }, { effectId: 'e2' }];
        const result = resolveSequenceForCSS(
          { ...BASE_SEQUENCE, effects, conditions: ['condition'] },
          BASE_INTERACTION,
          { interactions: [], effects: {}, conditions: { condition: BASE_CONDITION } },
        );
        expect(result?.effects[0].conditions).toContain('condition');
        expect(result?.effects[1].conditions).toContain('condition');
      });
      it('should add offsets (delay) to all individual effects', () => {
        const result = resolveSequenceForCSS(
          {
            delay: 100,
            offset: 50,
            effects: [{ effectId: 'e1' }, { effectId: 'e2' }],
          },
          BASE_INTERACTION,
          EMPTY_CONFIG,
        );
        expect((result?.effects[0] as any).delay).toBe(100);
        expect((result?.effects[1] as any).delay).toBe(150);
      });
      it('should add correct offsets to effects by original order (even if null after resolving)', () => {
        const result = resolveSequenceForCSS(
          {
            offset: 100,
            effects: [
              { effectId: 'e1' } as EffectRef,
              { effectId: 'e2', key: 'x[]' } as Effect,
              { effectId: 'e3' } as EffectRef,
            ],
          },
          BASE_INTERACTION,
          EMPTY_CONFIG,
        );
        expect(result?.effects).toHaveLength(2);
        expect((result?.effects[0] as any).delay).toBe(0);
        expect((result?.effects[1] as any).delay).toBe(200);
      });
    });
  });
});
