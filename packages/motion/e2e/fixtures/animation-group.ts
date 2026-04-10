import { getWebAnimation } from '@wix/motion';
import type { AnimationGroup } from '@wix/motion';
import { ANIMATION_GROUP_IDS } from '../constants/animation-group';

type AnimationGroupFixtureWindow = typeof window & {
  animationGroup: AnimationGroup;
  lifecycleEvents: string[];
  play: () => Promise<void>;
  pause: () => void;
  reverse: () => Promise<void>;
  cancel: () => void;
};

const items = [
  document.getElementById(ANIMATION_GROUP_IDS.item1) as HTMLElement,
  document.getElementById(ANIMATION_GROUP_IDS.item2) as HTMLElement,
  document.getElementById(ANIMATION_GROUP_IDS.item3) as HTMLElement,
];

const lifecycleEvents: string[] = [];

function recordEvent(name: string) {
  lifecycleEvents.push(name);
}

const groups = items.map((item, i) =>
  getWebAnimation(item, {
    keyframeEffect: {
      name: `group-item-${i}`,
      keyframes: [
        { offset: 0, opacity: 0, transform: 'scale(0.5)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
      ],
    },
    duration: 800,
    delay: i * 100,
    fill: 'both',
    easing: 'linear',
  }),
) as AnimationGroup[];

async function play(): Promise<void> {
  recordEvent('play');
  await Promise.all(groups.map((g) => g.play()));
  recordEvent('play:ready');
  groups[0].onFinish(() => recordEvent('finish'));
}

function pause(): void {
  recordEvent('pause');
  groups.forEach((g) => g.pause());
}

async function reverse(): Promise<void> {
  recordEvent('reverse');
  await Promise.all(groups.map((g) => g.reverse()));
  recordEvent('reverse:ready');
}

function cancel(): void {
  recordEvent('cancel');
  groups.forEach((g) => g.cancel());
}

// Expose the first group as animationGroup — tests read progress/playState from it
(window as AnimationGroupFixtureWindow).animationGroup = groups[0];
(window as AnimationGroupFixtureWindow).lifecycleEvents = lifecycleEvents;
(window as AnimationGroupFixtureWindow).play = play;
(window as AnimationGroupFixtureWindow).pause = pause;
(window as AnimationGroupFixtureWindow).reverse = reverse;
(window as AnimationGroupFixtureWindow).cancel = cancel;
