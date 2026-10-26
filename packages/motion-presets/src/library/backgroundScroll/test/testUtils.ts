import type { ScrubAnimationOptions } from '../../../types';

export const baseMockOptions: ScrubAnimationOptions = {
  id: '1',
};

// the animations of a preset, without the animations declaring only the static styles of its parts
export const animationsOf = <T extends object>(animations: T[]) =>
  animations.filter((animation) => 'name' in animation && animation.name);
