import { PanScroll, ScrubAnimationOptions, DomApi } from '../../types';
import {
  getCssUnits,
  toKeyframeValue,
  parseDirection,
  parseLength,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<PanScroll> = {
  type: 'PanScroll',
  direction: 'right',
  distance: { value: 400, unit: 'px' },
  range: 'in',
  startFromOffScreen: true,
};

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  distance: { type: 'length', default: DEFAULTS.distance },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  startFromOffScreen: { type: 'bool', default: DEFAULTS.startFromOffScreen },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-panScroll'], options.suffix);
}

export function prepare(options: ScrubAnimationOptions, dom?: DomApi) {
  const { startFromOffScreen = DEFAULTS.startFromOffScreen } = options.namedEffect as PanScroll;
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
  const namedEffect = options.namedEffect as PanScroll;
  const direction = parseDirection(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    DEFAULTS.direction,
  );
  const { startFromOffScreen = DEFAULTS.startFromOffScreen, range = DEFAULTS.range } = namedEffect;
  const distance = parseLength(namedEffect.distance, DEFAULTS.distance);
  const travel = distance.value * (direction === 'right' ? 1 : -1);
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
    [startX, endX] = direction === 'right' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];
  }

  const fromValue = range === 'out' ? 0 : startX;
  const toValue = range === 'in' ? 0 : endX;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [panScroll] = getNames(options);

  const custom = {
    '--motion-pan-from': fromValue,
    '--motion-pan-to': toValue,
  };

  // use transform: translateX(<value>) and not translate: <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  const animations = [
    {
      ...options,
      name: panScroll,
      fill,
      ...offsets,
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

  return suffixCustomProperties(animations, options.suffix);
}
