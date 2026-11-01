import type { AnimationFillMode, DomApi, ScrubAnimationOptions, TurnScroll } from '../../types';
import { toKeyframeValue, parseDirection, suffixNames, suffixCustomProperties } from '../../utils';
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
  const direction = parseDirection(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    DEFAULTS.direction,
  );
  const spin = parseDirection(namedEffect?.spin, SPIN_DIRECTIONS, DEFAULTS.spin);
  const { angle = DEFAULTS.angle, scale = DEFAULTS.scale, range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const startXLeft = `calc(-1 * ${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} - 100%)`;
  const endXLeft = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  // direction is where the element moves to
  const [startX, endX] = direction === 'right' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];

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

  const getTransform = (edge: 'from' | 'to') =>
    `translateX(${toKeyframeValue(custom, `--motion-turn-translate-${edge}`, asWeb)}) scale(${toKeyframeValue(
      custom,
      `--motion-turn-scale-${edge}`,
      asWeb,
    )}) rotate(calc(${toKeyframeValue({}, '--motion-rotate', false, '0deg')} + ${toKeyframeValue(
      custom,
      `--motion-turn-rotation-${edge}`,
      asWeb,
    )}))`;

  const keyframes = [{ transform: getTransform('from') }, { transform: getTransform('to') }];

  if (range === 'continuous') {
    keyframes.splice(1, 0, {
      // the movement keeps its speed through the middle, while the turn and the scale pass through rest
      transform: `translateX(calc((${toKeyframeValue(
        custom,
        '--motion-turn-translate-from',
        asWeb,
      )} + ${toKeyframeValue(custom, '--motion-turn-translate-to', asWeb)}) / 2)) scale(1) rotate(${toKeyframeValue(
        {},
        '--motion-rotate',
        false,
        '0deg',
      )})`,
    });
  }

  const animations = [
    {
      ...options,
      name: turnScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
