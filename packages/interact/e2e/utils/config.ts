import type { InteractConfig, Effect } from '@wix/interact/web';

export const WIDE = 800;
export const NARROW = 500;

export const conditions: InteractConfig['conditions'] = {
  narrow: { type: 'media', predicate: '(max-width: 600px)' },
  on: { type: 'selector', predicate: '.on' },
};

export const TARGET = `<interact-element data-interact-key="a"><div id="a"></div></interact-element>`;

export const kf = (effectId: string, extra: Partial<Effect> = {}): Effect =>
  ({
    effectId,
    duration: 100000,
    fill: 'both',
    keyframeEffect: { name: effectId, keyframes: [{ opacity: 0.5 }, { opacity: 0.5 }] },
    ...extra,
  }) as Effect;

export const tr = (effectId: string, color: string, extra: Partial<Effect> = {}): Effect =>
  ({
    effectId,
    transition: { duration: 0, styleProperties: [{ name: 'backgroundColor', value: color }] },
    ...extra,
  }) as Effect;

export const click = (
  effects: Effect[],
  sequences?: InteractConfig['interactions'][number]['sequences'],
) => ({
  conditions,
  interactions: [{ key: 'a', trigger: 'click' as const, effects, sequences }],
});
