import type { ArcScroll, AnimationFillMode, DomApi, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

const ROTATION = 68;
const DEFAULT_DIRECTION: (typeof AXIS_DIRECTIONS)[number] = 'horizontal';

const ROTATE_DIRECTION_MAP = {
  vertical: 'rotateX',
  horizontal: 'rotateY',
};

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-arcScroll'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ArcScroll;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULT_DIRECTION);
  const { range = 'in', perspective = 500 } = namedEffect;
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const rotateAxis = ROTATE_DIRECTION_MAP[direction];
  const fromValue = range === 'out' ? 0 : -ROTATION;
  const toValue = range === 'in' ? 0 : ROTATION;
  const easing = 'linear';

  const [arcScroll] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-arc-from': `${rotateAxis}(${fromValue}deg)`,
    '--motion-arc-to': `${rotateAxis}(${toValue}deg)`,
  };

  return [
    {
      ...options,
      name: arcScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(-300px) ${toKeyframeValue(
            custom,
            '--motion-arc-from',
            asWeb,
          )} translateZ(300px) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(-300px) ${toKeyframeValue(
            custom,
            '--motion-arc-to',
            asWeb,
          )} translateZ(300px) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
      ],
    },
  ];
}
