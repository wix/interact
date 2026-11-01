import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  SpinMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import { getMouseTransitionEasing, getAngleInDeg, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<SpinMouse> = {
  type: 'SpinMouse',
  direction: 'both',
  inverted: false,
};

export const schema = {
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
};

class SpinMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, direction } = this.options;

    const rotation =
      getAngleInDeg(
        [0.5, 0.5],
        [direction === 'vertical' ? 0 : progressX, direction === 'horizontal' ? 0 : progressY],
        90,
      ) * invert;

    this.target.style.transform = `rotate(calc(${rotation}deg + var(--motion-rotate, 0deg)))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing = 'linear' } = options;
  const namedEffect = options.namedEffect as SpinMouse;
  const inverted = namedEffect.inverted ?? DEFAULTS.inverted;
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
    direction,
  };

  return (target: HTMLElement) => new SpinMouseAnimation(target, animationOptions);
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions) {
  return create(options);
}
