import { getWebAnimation } from '@wix/motion';
import type { AnimationGroup } from '@wix/motion';

const subject = document.getElementById('h-scroller-subject') as HTMLElement;

// The same call @wix/interact's view-progress handler makes for a subject that sits
// inside a horizontal slider (a repeater item, say).
const group = getWebAnimation(
  subject,
  {
    keyframeEffect: {
      name: 'h-scroller-fade',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
    },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
    fill: 'both',
    easing: 'linear',
  },
  { trigger: 'view-progress', element: subject },
) as AnimationGroup;

group.ready.then(() => group.play());

Object.assign(window, {
  supportsViewTimeline: typeof window.ViewTimeline !== 'undefined',
  readTimeline: () => {
    const animation = subject.getAnimations()[0];
    const timeline = animation?.timeline as (AnimationTimeline & { source?: Element }) | null;
    return {
      source: timeline?.source
        ? timeline.source === document.scrollingElement
          ? 'document.scrollingElement'
          : `${timeline.source.tagName}#${timeline.source.id}`
        : null,
      progress: animation?.effect?.getComputedTiming().progress ?? null,
    };
  },
});
