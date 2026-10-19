import type {
  AnimationFillMode,
  DomApi,
  EffectSpinDirection,
  EffectTwoSides,
  ScrubAnimationOptions,
  TurnScroll,
} from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS, TWO_SIDES_DIRECTIONS } from '../../consts';

export const schema = {
  angle: { type: 'number', default: 45 },
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: 'left' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  scale: { type: 'number', min: 0, default: 1 },
  spin: { type: 'enum', values: SPIN_DIRECTIONS, default: 'clockwise' },
} as const;

const ROTATE_DIRECTION_MAP = {
  clockwise: 1,
  'counter-clockwise': -1,
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-turnScroll'].map((name) => name + suffix);
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
  const toDirection = parseDirection<EffectTwoSides>(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    schema.direction.default,
  );
  const direction: EffectTwoSides = toDirection === 'left' ? 'right' : 'left';
  const spin = parseDirection<EffectSpinDirection>(
    namedEffect?.spin,
    SPIN_DIRECTIONS,
    schema.spin.default,
  );
  const {
    angle = schema.angle.default,
    scale = schema.scale.default,
    range = schema.range.default,
  } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const startXLeft = `calc(-1 * ${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} - 100%)`;
  const endXLeft = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  const [startX, endX] = direction === 'left' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];

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

  return [
    {
      ...options,
      name: turnScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            '--motion-turn-translate-from',
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            '--motion-turn-scale-from',
            asWeb,
          )}) rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-turn-rotation-from', asWeb)}))`,
        },
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            '--motion-turn-translate-to',
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            '--motion-turn-scale-to',
            asWeb,
          )}) rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-turn-rotation-to', asWeb)}))`,
        },
      ],
    },
  ];
}
