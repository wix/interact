import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  SkewMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseLengthLazy, parseDirection } from '../../utils';
import { circInOut } from '@wix/motion';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<SkewMouse> = {
  type: 'SkewMouse',
  angle: 25,
  direction: 'both',
  inverted: false,
  travel: { value: 200, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class SkewMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    let skewX = 0;
    let skewY = 0;
    const { travel, angle, direction, invert } = this.options;

    if (direction !== 'vertical') {
      translateX = mapRange(0, 1, -1, 1, progressX) * invert;
      skewX = mapRange(0, 1, angle, -angle, progressX) * invert;
    }
    if (direction !== 'horizontal') {
      translateY = mapRange(0, 1, -1, 1, progressY) * invert;
      skewY = mapRange(0, 1, angle, -angle, progressY) * invert;
    }
    if (direction === 'both') {
      // We want to do `skewX *= progressY < 0.5 ? 1 : -1`
      // but normalize it by y progress (so it will be 0 when y is 0.5)
      // and apply a circInOut easing on the progress so it will feel more natural
      skewX *= mapRange(0, 1, 1, -1, circInOut(progressY));

      // we want to do `skewY *= progressX < 0.5 ? 1 : -1`
      // but normalize it by x progress (so it will be 0 when x is 0.5)
      // and apply a circInOut easing on the progress so it will feel more natural
      skewY *= mapRange(0, 1, 1, -1, circInOut(progressX));
    }

    const transform = `translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) skew(${skewX}deg, ${skewY}deg) rotate(var(--motion-rotate, 0deg))`;

    this.target.style.transform = transform;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as SkewMouse;
  const { inverted = DEFAULTS.inverted, angle = DEFAULTS.angle } = namedEffect;
  const travel = parseLengthLazy(namedEffect.travel, DEFAULTS.travel as LengthValue);
  const direction = parseDirection(
    namedEffect.direction,
    AXES,
    DEFAULTS.direction,
  ) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    travel,
    angle,
    direction,
  };

  return (target: HTMLElement) => new SkewMouseAnimation(target, animationOptions);
}
