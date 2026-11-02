import { getCSSAnimation, getWebAnimation, prepareAnimation, registerEffects } from '@wix/motion';
import type { AnimationGroup, AnimationOptions } from '@wix/motion';
import * as presets from '../../src';
// the CSS interact's generate() writes for the keyframes
import { keyframesToCSS } from '../../../interact/src/core/cssUtils';

registerEffects(presets);

const ONGOING = [
  'Bounce',
  'Breathe',
  'Cross',
  'Flash',
  'Flip',
  'Fold',
  'Jello',
  'Poke',
  'Pulse',
  'Spin',
  'Swing',
  'Wiggle',
];
const MARKERS = [
  [0, 0],
  [99, 0],
  [0, 99],
  [99, 99],
];

// the entrance, scroll and ongoing presets
export function presetNames() {
  return Object.keys(presets)
    .filter((name) => /In$|Scroll$/.test(name) || ONGOING.includes(name))
    .sort();
}

export type Variant = { scroll?: Record<string, unknown>; ongoing?: Record<string, unknown> };

function variantOf(name: string, variant: Variant) {
  return /Scroll$/.test(name)
    ? variant.scroll
    : ONGOING.includes(name)
      ? variant.ongoing
      : undefined;
}

function createTarget() {
  const parent = document.createElement('div');
  parent.className = 'parent';
  const target = document.createElement('div');
  target.className = 'target';
  target.innerHTML = MARKERS.map(
    ([x, y]) => `<i class="marker" style="left:${x}px;top:${y}px"></i>`,
  ).join('');
  parent.append(target);
  document.getElementById('root')!.append(parent);
  return target;
}

// the corner markers' positions and the opacity, through the whole iteration
function sample(target: HTMLElement, animations: Animation[]) {
  const end = Math.max(
    ...animations.map((animation) => Number(animation.effect!.getComputedTiming().endTime) || 1000),
  );
  return Array.from({ length: 41 }, (_, step) => {
    animations.forEach((animation) => {
      animation.pause();
      animation.currentTime = (step / 40) * end;
    });
    const markers = [...target.querySelectorAll('.marker')].flatMap((marker) => {
      const { left, top } = marker.getBoundingClientRect();
      return [left, top];
    });
    return [...markers, Number(getComputedStyle(target).opacity) * 100];
  });
}

const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

// the largest difference between each preset's WAAPI and CSS animations (px, or opacity in %)
export async function parity(variant: Variant = {}) {
  const custom = new Set<string>();
  const rules: string[] = [];
  const runs: { name: string; web: HTMLElement; group: AnimationGroup; css: HTMLElement }[] = [];

  presetNames().forEach((name, index) => {
    const extra = variantOf(name, variant);
    if ((variant.scroll || variant.ongoing) && !extra) {
      return;
    }
    const options = {
      namedEffect: { type: name, ...extra },
      duration: 1000,
      fill: 'both',
      iterations: 1,
    } as AnimationOptions;

    const web = createTarget();
    const group = getWebAnimation(web, structuredClone(options)) as AnimationGroup;

    const css = createTarget();
    css.id = `css-${index}`;
    prepareAnimation(css, structuredClone(options));
    const animations = getCSSAnimation(null, structuredClone(options));
    // as interact's generate(): the effects' custom properties are registered as not inherited
    animations
      .filter(({ part }) => !part)
      .forEach((animation) =>
        Object.keys(animation.custom || {}).forEach((key) => custom.add(key)),
      );
    const declarations = animations.flatMap(({ custom: values }) =>
      Object.entries(values || {})
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value};`),
    );
    rules.push(
      `#${css.id} { ${declarations.join(' ')} animation: ${animations.map((a) => a.animation).join(', ')}; animation-composition: ${animations.map((a) => a.composition || 'replace').join(', ')}; }`,
      ...animations.map((animation) => keyframesToCSS(animation.name!, animation.keyframes)),
    );
    runs.push({ name, web, group, css });
  });

  const style = document.createElement('style');
  style.textContent = [
    ...[...custom].map((key) => `@property ${key} { syntax: "*"; inherits: false; }`),
    ...rules,
  ].join('\n');
  document.head.append(style);

  await Promise.all(runs.map(({ group }) => group.ready));
  await nextFrame();

  return runs.map(({ name, web, group, css }) => {
    const a = sample(web, group.animations);
    const b = sample(css, css.getAnimations());
    return {
      name,
      difference: Math.max(...a.flatMap((frame, i) => frame.map((v, j) => Math.abs(v - b[i][j])))),
    };
  });
}

// starts the preset looping on a single target, for tracing
export async function play(name: string) {
  const group = getWebAnimation(createTarget(), {
    namedEffect: { type: name },
    duration: 2000,
    iterations: Infinity,
  } as AnimationOptions) as AnimationGroup;
  await group.ready;
  group.play();
}

Object.assign(window, { harness: { presetNames, parity, play } });
