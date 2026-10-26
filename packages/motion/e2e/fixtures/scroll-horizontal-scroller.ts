import { canUseViewTimeline, getScrubScene, getWebAnimation } from '@wix/motion';
import type { AnimationGroup, ScrubAnimationOptions, ScrubScrollScene } from '@wix/motion';

const SUBJECT_IDS = ['h-scroller-subject', 'control-subject', 'v-scroller-subject'];

const fadeOptions = (name: string): ScrubAnimationOptions => ({
  keyframeEffect: { name, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  fill: 'both',
  easing: 'linear',
});

// The subject's cover progress against the page's scroll: what @wix/interact's fallback measures
// (fizban's Scroll with `root: document.body`), for the `cover 0%`-`cover 100%` range used here.
function pageCoverProgress(subject: HTMLElement): number {
  const { top, height } = subject.getBoundingClientRect();
  return Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
}

// What @wix/interact's view-progress handler does for a subject that is its own source.
function addViewProgress(subject: HTMLElement): 'native' | 'fallback' {
  const trigger = { trigger: 'view-progress' as const, element: subject };

  if (canUseViewTimeline(subject)) {
    const group = getWebAnimation(subject, fadeOptions(subject.id), trigger) as AnimationGroup;
    group.ready.then(() => group.play());
    return 'native';
  }

  const scenes = getScrubScene(subject, fadeOptions(subject.id), trigger) as ScrubScrollScene[];
  const scrub = () => scenes.forEach((scene) => scene.effect({}, pageCoverProgress(subject)));
  Promise.all(scenes.map((scene) => scene.ready)).then(() => {
    window.addEventListener('scroll', scrub, { passive: true });
    scrub();
  });
  return 'fallback';
}

const paths = Object.fromEntries(
  SUBJECT_IDS.map((id) => [id, addViewProgress(document.getElementById(id) as HTMLElement)]),
);

Object.assign(window, {
  supportsViewTimeline: typeof window.ViewTimeline !== 'undefined',
  readTimeline: (id: string) => {
    const animation = document.getElementById(id)!.getAnimations()[0];
    const timeline = animation?.timeline as (AnimationTimeline & { source?: Element }) | null;
    return {
      path: paths[id],
      source: timeline?.source
        ? timeline.source === document.scrollingElement
          ? 'document.scrollingElement'
          : `${timeline.source.tagName}#${timeline.source.id}`
        : null,
      progress: animation?.effect?.getComputedTiming().progress ?? null,
    };
  },
});
