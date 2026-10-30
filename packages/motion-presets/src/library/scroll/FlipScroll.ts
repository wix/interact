import type { DomApi, FlipScroll, ScrubAnimationOptions } from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<FlipScroll> = {
  type: 'FlipScroll',
  angle: 240,
  direction: 'horizontal',
  perspective: 800,
  range: 'continuous',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

const ROTATE_DIRECTION_MAP = {
  vertical: 'rotateX',
  horizontal: 'rotateY',
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-flipScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FlipScroll;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULTS.direction);
  const {
    angle = DEFAULTS.angle,
    range = DEFAULTS.range,
    perspective = DEFAULTS.perspective,
  } = namedEffect;

  const rotationAxis = ROTATE_DIRECTION_MAP[direction];

  const fromValue = range === 'out' ? 0 : -angle;
  const toValue = range === 'in' ? 0 : angle;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [flipScroll] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-flip-from': `${rotationAxis}(${fromValue}deg)`,
    '--motion-flip-to': `${rotationAxis}(${toValue}deg)`,
  };

  const animations = [
    {
      ...options,
      name: flipScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) ${toKeyframeValue(
            custom,
            '--motion-flip-from',
            asWeb,
          )} rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) ${toKeyframeValue(
            custom,
            '--motion-flip-to',
            asWeb,
          )} rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
