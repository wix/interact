import { ScrubAnimationOptions, AnimationExtraOptions, BounceMouse, TrackMouse } from '../../types';
import createTrack from './TrackMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<BounceMouse> = {
  type: 'BounceMouse',
  direction: 'both',
  inverted: false,
  travel: { value: 80, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const namedEffect = options.namedEffect as BounceMouse;
  const { travel = DEFAULTS.travel } = namedEffect;
  const { transitionEasing = 'elastic' } = options;
  return createTrack({
    ...options,
    transitionEasing,
    namedEffect: { ...options.namedEffect, travel } as TrackMouse,
  });
}
