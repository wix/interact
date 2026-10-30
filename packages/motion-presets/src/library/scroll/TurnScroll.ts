import type { DomApi, ScrubAnimationOptions, TurnScroll } from '../../types';
import {
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS, TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<TurnScroll> = {
  type: 'TurnScroll',
  angle: 45,
  direction: 'left',
  range: 'in',
  scale: 1,
  spin: 'clockwise',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spin: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.spin },
};

const ROTATE_DIRECTION_MAP = {
  clockwise: 1,
  'counter-clockwise': -1,
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-turnScroll'], options.suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  if (dom) {
    let left = 0;
    dom.measure((target) => {
      if (!target) {
        return;
      }
      left = target.getBoundingClientRect().left;
    });
    dom.mutate((target) => {
      target?.style.setProperty('--motion-left', `${left}px`);
    });
  }
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TurnScroll;
  const direction = parseKeywordLazy(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    DEFAULTS.direction,
  );
  const spin = parseKeywordLazy(namedEffect?.spin, SPIN_DIRECTIONS, DEFAULTS.spin);
  const { angle = DEFAULTS.angle, scale = DEFAULTS.scale, range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const leftX = `calc(-1 * ${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} - 100%)`;
  const rightX = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  const [startX, endX] = direction === 'left' ? [rightX, leftX] : [leftX, rightX];

  const rotate = angle * ROTATE_DIRECTION_MAP[spin];

  const fromValues = {
    rotation: range === 'out' ? 0 : -rotate,
    scale: range === 'out' ? 1 : scale,
    translate: range === 'out' ? '0px' : startX,
  };
  const toValues = {
    rotation: range === 'in' ? 0 : rotate,
    scale: range === 'in' ? 1 : scale,
    translate: range === 'in' ? '0px' : endX,
  };

  const [turnScroll] = getNames(options);

  const custom = {
    '--motion-turn-translate-from': fromValues.translate,
    '--motion-turn-translate-to': toValues.translate,
    '--motion-turn-scale-from': fromValues.scale,
    '--motion-turn-scale-to': toValues.scale,
    '--motion-turn-rotation-from': `${fromValues.rotation}deg`,
    '--motion-turn-rotation-to': `${toValues.rotation}deg`,
  };

  const getTransform = (
    translate: string | number,
    scaleValue: string | number,
    rotation: string | number,
  ) =>
    `translateX(${translate}) scale(${scaleValue}) rotate(calc(${toKeyframeValue(
      {},
      '--motion-rotate',
      false,
      '0deg',
    )} + ${rotation}))`;

  const keyframes = [
    {
      transform: getTransform(
        toKeyframeValue(custom, '--motion-turn-translate-from', asWeb),
        toKeyframeValue(custom, '--motion-turn-scale-from', asWeb),
        toKeyframeValue(custom, '--motion-turn-rotation-from', asWeb),
      ),
    },
    {
      transform: getTransform(
        toKeyframeValue(custom, '--motion-turn-translate-to', asWeb),
        toKeyframeValue(custom, '--motion-turn-scale-to', asWeb),
        toKeyframeValue(custom, '--motion-turn-rotation-to', asWeb),
      ),
    },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, {
      transform: getTransform(
        `calc((${toKeyframeValue(custom, '--motion-turn-translate-from', asWeb)} + ${toKeyframeValue(
          custom,
          '--motion-turn-translate-to',
          asWeb,
        )}) / 2)`,
        1,
        '0deg',
      ),
    });
  }

  const animations = [
    {
      ...options,
      name: turnScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
