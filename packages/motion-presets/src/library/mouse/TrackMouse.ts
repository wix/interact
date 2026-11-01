import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  TrackMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseLengthLazy, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<TrackMouse> = {
  type: 'TrackMouse',
  direction: 'both',
  inverted: false,
  travel: { value: 200, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class TrackMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, travel, direction } = this.options;

    let translateX = 0;
    let translateY = 0;

    // if progressX === 0, translateX === -travel
    // if progressX === 0.5, translateX === 0
    // if progressX === 1, translateX === travel
    if (direction === 'both' || direction === 'horizontal') {
      translateX = mapRange(0, 1, -1, 1, progressX) * invert;
    }

    if (direction === 'both' || direction === 'vertical') {
      translateY = mapRange(0, 1, -1, 1, progressY) * invert;
    }

    this.target.style.transform = `translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) rotate(var(--motion-rotate, 0deg))`;
  }
  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as TrackMouse;
  const inverted = namedEffect.inverted ?? DEFAULTS.inverted;
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
    direction,
  };

  return (target: HTMLElement) => new TrackMouseAnimation(target, animationOptions);
}
