import type { AnimationFillMode, ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { SCROLL_RANGES } from '../../consts';
import { getPresetScrollParallax } from '../../parallaxUtils';

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

// the rotation on each axis relative to angle - spinning on x twice as fast
const [FACTOR_X, FACTOR_Y, FACTOR_Z] = [2, 1, 1];

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
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  // spinning into place on 'in' and continuing the same spin on 'out'
  const fromSign = range === 'out' ? 0 : 1;
  const toSign = range === 'in' ? 0 : -1;
  const fromValues = {
    rotationX: fromSign * FACTOR_X * angle,
    rotationY: fromSign * FACTOR_Y * angle,
    rotationZ: fromSign * FACTOR_Z * angle,
  };
  const toValues = {
    rotationX: toSign * FACTOR_X * angle,
    rotationY: toSign * FACTOR_Y * angle,
    rotationZ: toSign * FACTOR_Z * angle,
  };

  const [spin3dScroll] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rot-x-from': `${fromValues.rotationX}deg`,
    '--motion-rot-x-to': `${toValues.rotationX}deg`,
    '--motion-rot-y-from': `${fromValues.rotationY}deg`,
    '--motion-rot-y-to': `${toValues.rotationY}deg`,
    '--motion-rot-z-from': `${fromValues.rotationZ}deg`,
    '--motion-rot-z-to': `${toValues.rotationZ}deg`,
  };
  const rangeOffsets = getPresetScrollParallax(options, range, speed)(
    custom,
    '--motion-spin3d',
    asWeb,
  );

  const animations = [
    {
      ...options,
      name: spin3dScroll,
      fill,
      easing,
      custom,
      ...rangeOffsets,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-spin3d-parallax-from',
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-rot-z-from', asWeb)})) rotateY(${toKeyframeValue(
            custom,
            '--motion-rot-y-from',
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, '--motion-rot-x-from', asWeb)})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-spin3d-parallax-to',
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-rot-z-to', asWeb)})) rotateY(${toKeyframeValue(
            custom,
            '--motion-rot-y-to',
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, '--motion-rot-x-to', asWeb)})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
