import { ScrubAnimationOptions, AnimationExtraOptions, BounceMouse, TrackMouse } from '../../types';
import { parseLength } from '../../utils';
import createTrack from './TrackMouse';

const DEFAULT_DISTANCE = { value: 80, unit: 'px' };

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const namedEffect = options.namedEffect as BounceMouse;
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const { transitionEasing = 'elastic' } = options;
  return createTrack({
    ...options,
    transitionEasing,
    namedEffect: { ...options.namedEffect, distance } as TrackMouse,
  });
}
