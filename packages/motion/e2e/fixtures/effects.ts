import { registerEffects, getWebAnimation, getCSSAnimation } from '@wix/motion';
import type { AnimationGroup } from '@wix/motion';
import type { CssAnimationData, CustomEffectLogEntry } from '../types';
import { EFFECTS_NAMES, EFFECTS_TARGET_IDS, EFFECTS_TEST_IDS } from '../constants/effects';

type EffectsFixtureWindow = typeof window & {
  namedWaapiGroup: AnimationGroup;
  namedCssData: CssAnimationData[];
  keyframeWaapiGroup: AnimationGroup;
  keyframeCssData: CssAnimationData[];
  customEffectGroup: AnimationGroup;
  customEffectLog: CustomEffectLogEntry[];
  runNamedWaapi: () => void;
  runNamedCss: () => void;
  runNamedCssApplied: () => void;
  runKeyframeWaapi: () => void;
  runKeyframeCss: () => void;
  runKeyframeCssApplied: () => void;
  runCustomEffect: () => void;
  runPlayback: () => void;
  runPlaybackReverse: () => void;
  runPlaybackPause: () => void;
  runPlaybackResume: () => void;
};

type EffectOptions = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Register ad-hoc named effects (self-contained, no @wix/motion-presets dep)
// ---------------------------------------------------------------------------

registerEffects({
  TestFadeIn: {
    getNames: () => ['test-fadeIn'],
    web: (options: EffectOptions) => [
      {
        ...options,
        name: 'test-fadeIn',
        easing: 'linear',
        keyframes: [
          { offset: 0, opacity: 0 },
          { offset: 1, opacity: 1 },
        ],
      },
    ],
    style: (options: EffectOptions) => [
      {
        ...options,
        name: 'test-fadeIn',
        easing: 'linear',
        keyframes: [
          { offset: 0, opacity: 0 },
          { offset: 1, opacity: 1 },
        ],
      },
    ],
  },
  TestScale: {
    getNames: () => ['test-scale'],
    web: (options: EffectOptions) => [
      {
        ...options,
        name: 'test-scale',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
    style: (options: EffectOptions) => [
      {
        ...options,
        name: 'test-scale',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
  },
});

// ---------------------------------------------------------------------------
// Element references
// ---------------------------------------------------------------------------

const namedWaapiEl = document.getElementById(EFFECTS_TARGET_IDS.namedWaapi) as HTMLElement;
const keyframeWaapiEl = document.getElementById(EFFECTS_TARGET_IDS.keyframeWaapi) as HTMLElement;
const customEffectEl = document.getElementById(EFFECTS_TARGET_IDS.customEffect) as HTMLElement;
const playbackEl = document.getElementById(EFFECTS_TARGET_IDS.playback) as HTMLElement;
const playbackStateDisplay = document.querySelector(
  `[data-testid="${EFFECTS_TEST_IDS.playbackStateDisplay}"]`,
) as HTMLElement;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const customEffectLog: CustomEffectLogEntry[] = [];
let namedWaapiGroup: AnimationGroup;
let namedCssData: CssAnimationData[];
let keyframeWaapiGroup: AnimationGroup;
let keyframeCssData: CssAnimationData[];
let customEffectGroup: AnimationGroup;
let playbackGroup: AnimationGroup;

// ---------------------------------------------------------------------------
// Named Effect — WAAPI path
// ---------------------------------------------------------------------------

function runNamedWaapi() {
  namedWaapiGroup = getWebAnimation(namedWaapiEl, {
    namedEffect: { type: 'TestFadeIn' },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  }) as AnimationGroup;

  namedWaapiGroup.play();
  (window as EffectsFixtureWindow).namedWaapiGroup = namedWaapiGroup;
}

// ---------------------------------------------------------------------------
// Named Effect — CSS path
// ---------------------------------------------------------------------------

function runNamedCss() {
  namedCssData = getCSSAnimation(EFFECTS_TARGET_IDS.namedCss, {
    namedEffect: { type: EFFECTS_NAMES.namedCssEffectType },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  }) as CssAnimationData[];

  (window as EffectsFixtureWindow).namedCssData = namedCssData;
}

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function getCssTargetElement(target: string): HTMLElement | null {
  const selector =
    target.startsWith('#') || target.startsWith('.') || target.startsWith('[')
      ? target
      : `#${target}`;
  return document.querySelector(selector) as HTMLElement | null;
}

function formatKeyframeDeclaration([property, value]: [string, unknown]): string {
  return `${toKebabCase(property)}: ${String(value)};`;
}

function formatKeyframeBlock(keyframe: Keyframe): string {
  const declarations = Object.entries(keyframe)
    .filter(([property, value]) => property !== 'offset' && value !== undefined)
    .map(formatKeyframeDeclaration)
    .join(' ');
  const percent =
    typeof keyframe.offset === 'number' ? `${Math.round(keyframe.offset * 100)}%` : '0%';
  return `${percent} { ${declarations} }`;
}

/**
 * Fixture-side adapter for browser validation.
 * This applies getCSSAnimation() output to DOM (inject keyframes + set style.animation)
 * so E2E can verify descriptor usability in a real browser. It does not validate
 * internal descriptor-generation logic itself (covered by unit tests).
 */
function applyCssAnimationData(data: CssAnimationData[]): void {
  const firstAnimation = data[0];
  if (!firstAnimation?.name) {
    return;
  }

  const target = getCssTargetElement(firstAnimation.target);
  if (!target) {
    return;
  }

  const styleId = `generated-css-keyframes-${firstAnimation.name}`;
  let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `@keyframes ${firstAnimation.name} { ${firstAnimation.keyframes.map(formatKeyframeBlock).join(' ')} }`;

  target.style.animation = 'none';
  void target.offsetWidth;
  target.style.animation = firstAnimation.animation;
}

function runNamedCssApplied() {
  runNamedCss();
  applyCssAnimationData(namedCssData);
}

// ---------------------------------------------------------------------------
// Keyframe Effect — WAAPI path
// ---------------------------------------------------------------------------

function runKeyframeWaapi() {
  keyframeWaapiGroup = getWebAnimation(keyframeWaapiEl, {
    keyframeEffect: {
      name: EFFECTS_NAMES.keyframeWaapiName,
      keyframes: [
        { offset: 0, transform: 'translateX(-100%)' },
        { offset: 1, transform: 'translateX(0%)' },
      ],
    },
    duration: 800,
    fill: 'both',
    easing: 'ease-out',
  }) as AnimationGroup;

  keyframeWaapiGroup.play();
  (window as EffectsFixtureWindow).keyframeWaapiGroup = keyframeWaapiGroup;
}

// ---------------------------------------------------------------------------
// Keyframe Effect — CSS path
// ---------------------------------------------------------------------------

function runKeyframeCss() {
  keyframeCssData = getCSSAnimation(EFFECTS_TARGET_IDS.keyframeCss, {
    keyframeEffect: {
      name: EFFECTS_NAMES.keyframeCssName,
      keyframes: [
        { offset: 0, transform: 'rotate(0deg)' },
        { offset: 1, transform: 'rotate(360deg)' },
      ],
    },
    duration: 800,
    fill: 'both',
    easing: 'linear',
  }) as CssAnimationData[];

  (window as EffectsFixtureWindow).keyframeCssData = keyframeCssData;
}

function runKeyframeCssApplied() {
  runKeyframeCss();
  applyCssAnimationData(keyframeCssData);
}

// ---------------------------------------------------------------------------
// Custom Effect — WAAPI path
// ---------------------------------------------------------------------------

function runCustomEffect() {
  customEffectLog.length = 0;

  customEffectGroup = getWebAnimation(customEffectEl, {
    customEffect: (element: Element | null, progress: number | null) => {
      const htmlElement = element as HTMLElement | null;
      customEffectLog.push({
        elementId: htmlElement?.id ?? null,
        tagName: htmlElement?.tagName ?? null,
        progress,
      });
      if (element && progress !== null) {
        (element as HTMLElement).style.opacity = String(progress);
        (element as HTMLElement).style.transform = `scale(${0.5 + progress * 0.5})`;
      }
    },
    duration: 600,
    fill: 'both',
    easing: 'linear',
  }) as AnimationGroup;

  customEffectGroup.play();
  (window as EffectsFixtureWindow).customEffectGroup = customEffectGroup;
  (window as EffectsFixtureWindow).customEffectLog = customEffectLog;
}

// ---------------------------------------------------------------------------
// Playback controls
// ---------------------------------------------------------------------------

function ensurePlaybackGroup() {
  if (!playbackGroup) {
    playbackGroup = getWebAnimation(playbackEl, {
      keyframeEffect: {
        name: EFFECTS_NAMES.playbackName,
        keyframes: [
          { offset: 0, opacity: 0, transform: 'translateX(-60px)' },
          { offset: 1, opacity: 1, transform: 'translateX(0px)' },
        ],
      },
      duration: 2000,
      fill: 'both',
      easing: 'linear',
    }) as AnimationGroup;
  }
}

function updatePlaybackDisplay() {
  if (playbackStateDisplay) {
    playbackStateDisplay.textContent = `state: ${playbackGroup?.playState ?? 'idle'}`;
  }
}

function runPlayback() {
  ensurePlaybackGroup();
  playbackGroup.play().then(updatePlaybackDisplay);
  updatePlaybackDisplay();
}

function runPlaybackReverse() {
  ensurePlaybackGroup();
  playbackGroup.reverse().then(updatePlaybackDisplay);
  updatePlaybackDisplay();
}

function runPlaybackPause() {
  ensurePlaybackGroup();
  playbackGroup.pause();
  updatePlaybackDisplay();
}

function runPlaybackResume() {
  ensurePlaybackGroup();
  playbackGroup.play().then(updatePlaybackDisplay);
  updatePlaybackDisplay();
}

// ---------------------------------------------------------------------------
// Expose to tests
// ---------------------------------------------------------------------------

(window as EffectsFixtureWindow).customEffectLog = customEffectLog;
(window as EffectsFixtureWindow).runNamedWaapi = runNamedWaapi;
(window as EffectsFixtureWindow).runNamedCss = runNamedCss;
(window as EffectsFixtureWindow).runNamedCssApplied = runNamedCssApplied;
(window as EffectsFixtureWindow).runKeyframeWaapi = runKeyframeWaapi;
(window as EffectsFixtureWindow).runKeyframeCss = runKeyframeCss;
(window as EffectsFixtureWindow).runKeyframeCssApplied = runKeyframeCssApplied;
(window as EffectsFixtureWindow).runCustomEffect = runCustomEffect;
(window as EffectsFixtureWindow).runPlayback = runPlayback;
(window as EffectsFixtureWindow).runPlaybackReverse = runPlaybackReverse;
(window as EffectsFixtureWindow).runPlaybackPause = runPlaybackPause;
(window as EffectsFixtureWindow).runPlaybackResume = runPlaybackResume;
