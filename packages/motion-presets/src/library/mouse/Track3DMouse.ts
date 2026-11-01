import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  Track3DMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseLengthLazy, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<Track3DMouse> = {
  type: 'Track3DMouse',
  angle: 5,
  direction: 'both',
  inverted: false,
  perspective: 800,
  travel: { value: 200, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class Track3DMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, travel, angle, direction, perspective } = this.options;

    let translateX = 0;
    let translateY = 0;
    let rotateX = 0;
    let rotateY = 0;
    // if progressX === 0, translateX === -travel
    // if progressX === 0.5, translateX === 0
    // if progressX === 1, translateX === travel
    // if progressX === 0, rotateX === -angle, if progressX === 0.5, rotateX === 0, if progressX === 1, rotateX === angle
    if (direction === 'both' || direction === 'horizontal') {
      translateX = mapRange(0, 1, -1, 1, progressX);
      rotateY = mapRange(0, 1, -angle, angle, progressX) * invert;
    }
    if (direction === 'both' || direction === 'vertical') {
      translateY = mapRange(0, 1, -1, 1, progressY);
      rotateX = mapRange(0, 1, angle, -angle, progressY) * invert;
    }

    this.target.style.transform = `perspective(${perspective}px) translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as Track3DMouse;
  const {
    inverted = DEFAULTS.inverted,
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
  } = namedEffect;
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
    angle,
    perspective,
  };

  return (target: HTMLElement) => new Track3DMouseAnimation(target, animationOptions);
}
