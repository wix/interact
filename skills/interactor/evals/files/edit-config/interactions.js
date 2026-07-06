import { Interact, generate } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);

export const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'hero-in' }],
    },
  ],
  effects: {
    'hero-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' },
      triggerType: 'once',
    },
  },
};

const style = document.createElement('style');
style.textContent = generate(config, true);
document.head.appendChild(style);

Interact.create(config);
