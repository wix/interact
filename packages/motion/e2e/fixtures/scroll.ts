import { getWebAnimation, getScrubScene } from '@wix/motion';
import type { AnimationGroup, RangeOffset, ScrubScrollScene } from '@wix/motion';
import { SCROLL_IDS, SCROLL_TEST_IDS } from '../constants/scroll';

type ScrollFixtureWindow = typeof window & {
  scrubScene: AnimationGroup;
  destroyScrubScene: () => void;
  getScrollProgress: () => number;
  getScrubSceneMode: () => 'native' | 'polyfill';
  supportsViewTimeline: boolean;
  getNativeCustomValues: () => { progress: number; shift: number };
};

const target = document.getElementById(SCROLL_IDS.viewProgressTarget) as HTMLElement;
const scrubSceneTarget = document.getElementById(SCROLL_IDS.scrubSceneTarget) as HTMLElement;
const nativeCustomTarget = document.getElementById(SCROLL_IDS.nativeCustomTarget) as HTMLElement;
const progressDisplay = document.querySelector(
  `[data-testid="${SCROLL_TEST_IDS.progressDisplay}"]`,
) as HTMLElement;
const supportsViewTimeline = typeof window.ViewTimeline !== 'undefined';

function calculateProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
  return Math.max(0, Math.min(1, progress));
}

const animationGroup = getWebAnimation(target, {
  keyframeEffect: {
    name: 'scroll-fade-slide',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateY(60px)' },
      { offset: 1, opacity: 1, transform: 'translateY(0px)' },
    ],
  },
  duration: 1000,
  fill: 'both',
  easing: 'linear',
}) as AnimationGroup;

let scrubSceneDestroyed = false;

animationGroup.ready.then(() => {
  if (scrubSceneDestroyed) return;

  function onScroll() {
    if (scrubSceneDestroyed) return;
    const p = calculateProgress(target);
    animationGroup.progress(p);
    if (progressDisplay) {
      progressDisplay.textContent = `progress: ${p.toFixed(3)}`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

// Staggered scrub cards
const cards = [SCROLL_IDS.scrubCard1, SCROLL_IDS.scrubCard2, SCROLL_IDS.scrubCard3];
cards.forEach((id, i) => {
  const card = document.getElementById(id) as HTMLElement;

  const cardAnimation = getWebAnimation(card, {
    keyframeEffect: {
      name: `card-enter-${i}`,
      keyframes: [
        { offset: 0, opacity: 0, transform: 'translateX(-40px)' },
        { offset: 1, opacity: 1, transform: 'translateX(0px)' },
      ],
    },
    duration: 600,
    delay: i * 80,
    fill: 'both',
    easing: 'ease-out',
  }) as AnimationGroup;

  cardAnimation.ready.then(() => {
    function onCardScroll() {
      cardAnimation.progress(calculateProgress(card));
    }
    window.addEventListener('scroll', onCardScroll, { passive: true });
    onCardScroll();
  });
});

(window as ScrollFixtureWindow).scrubScene = animationGroup;
(window as ScrollFixtureWindow).destroyScrubScene = () => {
  scrubSceneDestroyed = true;
  animationGroup.cancel();
};
(window as ScrollFixtureWindow).getScrollProgress = () => calculateProgress(target);

// ---------------------------------------------------------------------------
// Range offset scene — tests that startOffset/endOffset flow through the pipeline
// ---------------------------------------------------------------------------

const RANGE_START: RangeOffset = { name: 'entry' };
const RANGE_END: RangeOffset = { name: 'exit' };

const rangeSceneResult = getScrubScene(
  scrubSceneTarget,
  {
    keyframeEffect: {
      name: 'scroll-range-test',
      keyframes: [
        { offset: 0, opacity: 0.2, transform: 'translateX(-60px)' },
        { offset: 1, opacity: 1, transform: 'translateX(0px)' },
      ],
    },
    startOffset: RANGE_START,
    endOffset: RANGE_END,
    fill: 'both',
  },
  { trigger: 'view-progress', element: scrubSceneTarget },
);

// getScrubScene returns ScrubScrollScene[] in the fallback path (no native ViewTimeline)
const rangeScene = Array.isArray(rangeSceneResult)
  ? (rangeSceneResult[0] as ScrubScrollScene)
  : null;

if (Array.isArray(rangeSceneResult)) {
  const abortController = new AbortController();
  const applyPolyfilledScrub = () => {
    const progress = calculateProgress(scrubSceneTarget);
    rangeSceneResult.forEach((scene) => scene.effect({}, progress as never));
  };

  window.addEventListener('scroll', applyPolyfilledScrub, {
    passive: true,
    signal: abortController.signal,
  });
  applyPolyfilledScrub();
}

const nativeCustomEffectGroup = getWebAnimation(
  nativeCustomTarget,
  {
    customEffect: (element: Element | null, progress: number | null) => {
      const htmlElement = element as HTMLElement | null;
      if (!htmlElement) {
        return;
      }

      if (progress === null) {
        htmlElement.style.removeProperty('--native-custom-progress');
        htmlElement.style.removeProperty('--native-custom-shift');
        return;
      }

      htmlElement.style.setProperty('--native-custom-progress', progress.toFixed(3));
      htmlElement.style.setProperty('--native-custom-shift', `${(progress * 80).toFixed(1)}px`);
    },
    startOffset: RANGE_START,
    endOffset: RANGE_END,
    fill: 'both',
    easing: 'linear',
  },
  { trigger: 'view-progress', element: nativeCustomTarget },
) as AnimationGroup;

(window as ScrollFixtureWindow).supportsViewTimeline = supportsViewTimeline;
(window as ScrollFixtureWindow).getScrubSceneMode = () =>
  rangeScene && !supportsViewTimeline ? 'polyfill' : 'native';
(window as ScrollFixtureWindow).getNativeCustomValues = () => {
  const style = getComputedStyle(nativeCustomTarget);
  return {
    progress: Number.parseFloat(style.getPropertyValue('--native-custom-progress')) || 0,
    shift: Number.parseFloat(style.getPropertyValue('--native-custom-shift')) || 0,
  };
};

nativeCustomEffectGroup.ready.then(() => {
  if (supportsViewTimeline) {
    nativeCustomEffectGroup.play();
  }
});
