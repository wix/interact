import { getCssUnits, getMouseTransitionEasing, mapRange, parseLengthOrCalc } from '../../utils';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, BlobMouse, Progress } from '../../types';

export const schema = {
  distance: { type: 'length', default: { value: 200, unit: 'px' } },
  inverted: { type: 'bool', default: false },
  scale: { type: 'number', min: 0, default: 1.4 },
} as const;

class BlobMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { distance, scale, invert } = this.options;
    const distanceValue = typeof distance === 'string' ? 1 : distance.value;
    const translateX = mapRange(0, 1, -distanceValue, distanceValue, progressX) * invert;
    const translateY = mapRange(0, 1, -distanceValue, distanceValue, progressY) * invert;

    // if progressX === 0 || progressX === 1, scaleX === scale, if progressX === 0.5, scaleX === 1
    const scaleX =
      progressX < 0.5
        ? mapRange(0, 0.5, scale, 1, progressX)
        : mapRange(0.5, 1, 1, scale, progressX);

    // if progressY === 0 || progressY === 1, scaleY === scale, if progressY === 0.5, scaleY === 1
    const scaleY =
      progressY < 0.5
        ? mapRange(0, 0.5, scale, 1, progressY)
        : mapRange(0.5, 1, 1, scale, progressY);

    const toLength = (value: number) =>
      typeof distance === 'string'
        ? `calc(${value} * ${distance})`
        : `${value}${getCssUnits(distance.unit)}`;

    this.target.style.transform = `translateX(${toLength(translateX)}) translateY(${toLength(translateY)}) scale(${scaleX}, ${scaleY}) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as BlobMouse;
  const { inverted = schema.inverted.default, scale = schema.scale.default } = namedEffect;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);

  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    scale,
  };

  return (target: HTMLElement) => new BlobMouseAnimation(target, animationOptions);
}

create.schema = schema;
