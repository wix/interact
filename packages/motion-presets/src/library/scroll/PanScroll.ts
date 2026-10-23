import {
  PanScroll,
  ScrubAnimationOptions,
  DomApi,
  AnimationFillMode,
  EffectTwoSides,
} from '../../types';
import { toKeyframeValue, parseDirection, parseLengthOrCalc, scaleLength } from '../../utils';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: 'right' },
  distance: { type: 'length', default: { value: 400, unit: 'px' } },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  startFromOffScreen: { type: 'bool', default: true },
} as const;

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-panScroll'].map((name) => name + suffix);
}

export function prepare(options: ScrubAnimationOptions, dom?: DomApi) {
  const { startFromOffScreen = schema.startFromOffScreen.default } = (options.namedEffect ||
    {}) as PanScroll;
  if (startFromOffScreen && dom) {
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
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as PanScroll;
  const toDirection = parseDirection<EffectTwoSides>(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    schema.direction.default,
  );
  const { startFromOffScreen = schema.startFromOffScreen.default, range = schema.range.default } =
    namedEffect;
  const direction = range === 'out' ? toDirection : toDirection === 'left' ? 'right' : 'left';
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const sign = direction === 'left' ? 1 : -1;
  let startX = scaleLength(distance, -sign);
  let endX = scaleLength(distance, sign);
  if (startFromOffScreen) {
    const startXLeft = `calc(${toKeyframeValue(
      {},
      '--motion-left',
      false,
      'calc(100vw - 100%)',
    )} * -1 - 100%)`;
    const endXLeft = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
    [startX, endX] = direction === 'left' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];
  }

  const fromValue = range === 'out' ? 0 : startX;
  const toValue = range === 'in' ? 0 : range === 'out' ? startX : endX;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [panScroll] = getNames(options);

  const custom = {
    [`--motion-pan-from${suffix}`]: fromValue,
    [`--motion-pan-to${suffix}`]: toValue,
  };

  // use transform: translateX(<value>) and not translate: <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  return [
    {
      ...options,
      name: panScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            `--motion-pan-from${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            `--motion-pan-to${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
