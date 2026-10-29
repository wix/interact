import type { ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import {
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  getScrollParallax,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<Spin3dScroll> = {
  type: 'Spin3dScroll',
  angle: 100,
  perspective: 1000,
  range: 'in',
  speed: 1,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-spin3dScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const {
    angle = DEFAULTS.angle,
    speed = DEFAULTS.speed,
    range = DEFAULTS.range,
    perspective = DEFAULTS.perspective,
  } = options.namedEffect as Spin3dScroll;
  const easing = 'linear';
  const fill = getScrollFill(options, range);

  const { from, to, ...rangeOffsets } = getScrollParallax(options, range, speed);

  const [spin3dScroll] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-travel-from': from,
    '--motion-travel-to': to,
    '--motion-rot-from': `${range === 'out' ? 0 : -angle}deg`,
    '--motion-rot-to': `${range === 'in' ? 0 : angle}deg`,
  };

  const getTransform = (edge: 'from' | 'to') => {
    const rotation = toKeyframeValue(custom, `--motion-rot-${edge}`, asWeb);
    return `perspective(${toKeyframeValue(
      custom,
      '--motion-perspective',
      asWeb,
    )}) translateY(${toKeyframeValue(
      custom,
      `--motion-travel-${edge}`,
      asWeb,
    )}) rotateX(${rotation}) rotateY(${rotation}) rotateZ(${rotation}) rotate(${toKeyframeValue(
      {},
      '--motion-rotate',
      false,
      '0deg',
    )})`;
  };

  const animations = [
    {
      ...options,
      ...rangeOffsets,
      name: spin3dScroll,
      fill,
      easing,
      custom,
      keyframes: [{ transform: getTransform('from') }, { transform: getTransform('to') }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
