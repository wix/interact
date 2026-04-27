import {
  PanScroll,
  ScrubAnimationOptions,
  DomApi,
  AnimationFillMode,
  EffectTwoSides,
} from '../../types';
import { getCssUnits, toKeyframeValue, parseDirection, parseLength } from '../../utils';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectTwoSides = 'left';
const DEFAULT_DISTANCE = { value: 400, unit: 'px' };

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-panScroll'];
}

export function prepare(options: ScrubAnimationOptions, dom?: DomApi) {
  if (options.namedEffect && (options.namedEffect as PanScroll).startFromOffScreen && dom) {
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
  const namedEffect = options.namedEffect as PanScroll;
  const direction = parseDirection(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULT_DIRECTION);
  const { startFromOffScreen = true, range = 'in' } = namedEffect;
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const travel = distance.value * (direction === 'left' ? 1 : -1);
  let startX = `${-travel}${getCssUnits(distance.unit)}`;
  let endX = `${travel}${getCssUnits(distance.unit)}`;
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
    '--motion-pan-from': fromValue,
    '--motion-pan-to': toValue,
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
            '--motion-pan-from',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            '--motion-pan-to',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
