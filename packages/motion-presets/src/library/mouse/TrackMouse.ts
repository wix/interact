import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  TrackMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import {
  getCssUnits,
  getMouseTransitionEasing,
  mapRange,
  parseLength,
  parseDirection,
} from '../../utils';
import { CustomMouse } from './CustomMouse';

export const AXES = ['both', 'horizontal', 'vertical'] as const;

export const schema = {
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 200, unit: 'px' } },
  inverted: { type: 'bool', default: false },
} as const;

class TrackMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, distance, axis } = this.options;

    let translateX = 0;
    let translateY = 0;

    // if progressX === 0, translateX === -distance
    // if progressX === 0.5, translateX === 0
    // if progressX === 1, translateX === distance
    if (axis === 'both' || axis === 'horizontal') {
      translateX = mapRange(0, 1, -distance.value, distance.value, progressX) * invert;
    }

    if (axis === 'both' || axis === 'vertical') {
      translateY = mapRange(0, 1, -distance.value, distance.value, progressY) * invert;
    }

    const units = getCssUnits(distance.unit);

    this.target.style.transform = `translateX(${translateX}${units}) translateY(${translateY}${units}) rotate(var(--motion-rotate, 0deg))`;
  }
  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as TrackMouse;
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const distance = parseLength(namedEffect.distance, schema.distance.default);
  const axis = parseDirection(namedEffect.axis, AXES, schema.axis.default) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    axis,
  };

  return (target: HTMLElement) => new TrackMouseAnimation(target, animationOptions);
}

create.schema = schema;
