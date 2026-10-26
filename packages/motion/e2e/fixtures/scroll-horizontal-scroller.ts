import { getScrubScene, getWebAnimation, watchViewTimeline } from '@wix/motion';
import type { AnimationGroup, ScrubAnimationOptions, ScrubScrollScene } from '@wix/motion';

const SUBJECT_IDS = [
  'h-scroller-subject',
  'control-subject',
  'v-scroller-subject',
  'r-slider-subject',
  't-slider-subject',
  'bp-slider-subject',
  'lazy-scroller-subject',
];

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

function playOnViewTimeline(subject: HTMLElement): () => void {
  const trigger = { trigger: 'view-progress' as const, element: subject, useViewTimeline: true };
  const group = getWebAnimation(subject, fadeOptions(subject.id), trigger) as AnimationGroup;
  let stopped = false;
  group.ready.then(() => !stopped && group.play());

  return () => {
    stopped = true;
    group.cancel();
  };
}

function scrubOnScroll(subject: HTMLElement): () => void {
  const trigger = { trigger: 'view-progress' as const, element: subject, useViewTimeline: false };
  const scenes = getScrubScene(subject, fadeOptions(subject.id), trigger) as ScrubScrollScene[];
  const scrub = () => scenes.forEach((scene) => scene.effect({}, pageCoverProgress(subject)));
  let stopped = false;
  Promise.all(scenes.map((scene) => scene.ready)).then(() => {
    if (stopped) return;
    window.addEventListener('scroll', scrub, { passive: true });
    scrub();
  });

  return () => {
    stopped = true;
    window.removeEventListener('scroll', scrub);
    scenes.forEach((scene) => scene.destroy());
  };
}

const paths: Record<string, 'native' | 'fallback'> = {};

// What @wix/interact's view-progress handler does for a subject that is its own source.
function addViewProgress(subject: HTMLElement) {
  let stop: (() => void) | undefined;

  watchViewTimeline(subject, (useViewTimeline) => {
    stop?.();
    paths[subject.id] = useViewTimeline ? 'native' : 'fallback';
    stop = useViewTimeline ? playOnViewTimeline(subject) : scrubOnScroll(subject);
  });
}

SUBJECT_IDS.forEach((id) => addViewProgress(document.getElementById(id) as HTMLElement));

Object.assign(window, {
  supportsViewTimeline: typeof window.ViewTimeline !== 'undefined',
  readTimeline: (id: string) => {
    const animations = document.getElementById(id)!.getAnimations();
    const animation = animations[animations.length - 1];
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
