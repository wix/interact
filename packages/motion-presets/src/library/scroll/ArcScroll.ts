import type { ArcScroll, DomApi, ScrubAnimationOptions } from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const ROTATION = 68;

const DEFAULTS: Required<ArcScroll> = {
  type: 'ArcScroll',
  direction: 'horizontal',
  perspective: 500,
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

const ROTATE_DIRECTION_MAP = {
  vertical: 'rotateX',
  horizontal: 'rotateY',
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-arcScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ArcScroll;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULTS.direction);
  const { range = DEFAULTS.range, perspective = DEFAULTS.perspective } = namedEffect;
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

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

  const animations = [
    {
      ...options,
      name: arcScroll,
      fill,
      ...offsets,
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

  return suffixCustomProperties(animations, options.suffix);
}
