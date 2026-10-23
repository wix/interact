import {
  getCssUnits,
  getMouseTransitionEasing,
  mapRange,
  parseLengthOrCalc,
  parseDirection,
} from '../../utils';
import type {
  ScrubAnimationOptions,
  AiryMouse,
  AnimationExtraOptions,
  Progress,
  MouseEffectAxis,
} from '../../types';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

export const schema = {
  angle: { type: 'number', default: 30 },
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 200, unit: 'px' } },
  inverted: { type: 'bool', default: false },
} as const;

class AiryMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    const { distance, invert, angle, axis } = this.options;
    const distanceValue = typeof distance === 'string' ? 1 : distance.value;

    if (axis !== 'vertical') {
      translateX = mapRange(0, 1, -distanceValue, distanceValue, progressX) * invert;
    }
    if (axis !== 'horizontal') {
      translateY = mapRange(0, 1, -distanceValue, distanceValue, progressY) * invert;
    }

    // if progress  === 0, rotate === angle, if progress === 0.5, rotate === 0, if progress === 1, rotate === angle
    const rotate = mapRange(0, 1, -angle, angle, progressX) * invert;
    const toLength = (value: number) =>
      typeof distance === 'string'
        ? `calc(${value} * ${distance})`
        : `${value}${getCssUnits(distance.unit)}`;

    this.target.style.transform = `translateX(${toLength(translateX)}) translateY(${toLength(translateY)}) rotate(calc(${rotate}deg + var(--motion-rotate, 0deg)))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as AiryMouse;
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const angle = parseDirection(namedEffect.angle, [], schema.angle.default, true) as number;
  const axis = parseDirection(namedEffect.axis, AXES, schema.axis.default) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    angle,
    axis,
  };

  return (target: HTMLElement) => new AiryMouseAnimation(target, animationOptions);
}

create.schema = schema;
