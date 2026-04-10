import { getScrubScene, registerEffects } from '@wix/motion';
import type { ScrubPointerScene } from '@wix/motion';
import { POINTER_IDS, POINTER_TEST_IDS } from '../constants/pointer';

type PointerFixtureWindow = typeof window & {
  pointerScene: {
    cancel(): void;
    playState: 'idle' | 'running';
  };
};

const pointerArea = document.getElementById(POINTER_IDS.area) as HTMLElement;
const xAxisTarget = document.getElementById(POINTER_IDS.xAxisTarget) as HTMLElement;
const yAxisTarget = document.getElementById(POINTER_IDS.yAxisTarget) as HTMLElement;
const compositeTarget = document.getElementById(POINTER_IDS.compositeTarget) as HTMLElement;
const namedTarget = document.getElementById(POINTER_IDS.namedTarget) as HTMLElement;
const customTarget = document.getElementById(POINTER_IDS.customTarget) as HTMLElement;
const progressDisplay = document.querySelector(
  `[data-testid="${POINTER_TEST_IDS.progressDisplay}"]`,
) as HTMLElement;

type PointerProgress = { x: number; y: number };
type PointerMouseInstance = {
  target: HTMLElement;
  play(): void;
  progress(progress: PointerProgress): void;
  cancel(): void;
};

registerEffects({
  TestPointerNamed: (animationOptions: { centeredToTarget?: boolean }) => {
    return (element: HTMLElement): PointerMouseInstance => ({
      target: element,
      play() {},
      progress(progress: PointerProgress) {
        const distance = (progress.x - 0.5) * 140;
        const centeredOffset = animationOptions.centeredToTarget ? 12 : 0;
        element.style.transform = `translateX(${(distance + centeredOffset).toFixed(2)}px)`;
        element.style.opacity = `${(0.4 + progress.x * 0.6).toFixed(3)}`;
      },
      cancel() {
        element.style.transform = '';
        element.style.opacity = '';
      },
    });
  },
  CustomMouse: (animationOptions: {
    customEffect?: {
      ranges?: Array<{ name: string; min: number; max: number }>;
    };
  }) => {
    return (element: HTMLElement): PointerMouseInstance => ({
      target: element,
      play() {},
      progress(progress: PointerProgress) {
        const ranges =
          animationOptions.customEffect &&
          typeof animationOptions.customEffect === 'object' &&
          'ranges' in animationOptions.customEffect
            ? (animationOptions.customEffect.ranges ?? [])
            : [];
        const valueByRangeName: Record<string, number> = {};

        ranges.forEach((range) => {
          const mappedValue = range.min + (range.max - range.min) * progress.y;
          valueByRangeName[range.name] = mappedValue;
          element.style.setProperty(`--custom-${range.name}`, mappedValue.toFixed(3));
        });

        const opacity = valueByRangeName.opacity ?? 1;
        const scale = valueByRangeName.scale ?? 1;
        element.style.opacity = `${opacity}`;
        element.style.transform = `scale(${scale})`;
      },
      cancel() {
        element.style.removeProperty('--custom-opacity');
        element.style.removeProperty('--custom-scale');
        element.style.opacity = '';
        element.style.transform = '';
      },
    });
  },
} as any);

function createPointerTrigger(element: HTMLElement, axis: 'x' | 'y') {
  return {
    trigger: 'pointer-move',
    element,
    axis,
  } as Parameters<typeof getScrubScene>[2];
}

const xAxisScene = getScrubScene(
  xAxisTarget,
  {
    keyframeEffect: {
      name: 'pointer-x',
      keyframes: [
        { offset: 0, transform: 'translateX(-80px)' },
        { offset: 1, transform: 'translateX(80px)' },
      ],
    },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  },
  createPointerTrigger(pointerArea, 'x'),
) as ScrubPointerScene | null;

const yAxisArea = document.getElementById(POINTER_IDS.yAxisArea) as HTMLElement;
const yAxisScene = getScrubScene(
  yAxisTarget,
  {
    keyframeEffect: {
      name: 'pointer-y',
      keyframes: [
        { offset: 0, transform: 'translateY(-40px)' },
        { offset: 1, transform: 'translateY(40px)' },
      ],
    },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  },
  createPointerTrigger(yAxisArea, 'y'),
) as ScrubPointerScene | null;

const compositeArea = document.getElementById(POINTER_IDS.compositeArea) as HTMLElement;
const compositeScaleXScene = getScrubScene(
  compositeTarget,
  {
    keyframeEffect: {
      name: 'pointer-scale-x',
      keyframes: [
        { offset: 0, transform: 'scaleX(0.5)' },
        { offset: 1, transform: 'scaleX(1.5)' },
      ],
    },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  },
  createPointerTrigger(compositeArea, 'x'),
) as ScrubPointerScene | null;

const compositeScaleYScene = getScrubScene(
  compositeTarget,
  {
    keyframeEffect: {
      name: 'pointer-scale-y',
      keyframes: [
        { offset: 0, transform: 'scaleY(0.5)' },
        { offset: 1, transform: 'scaleY(1.5)' },
      ],
    },
    duration: 1000,
    fill: 'both',
    easing: 'linear',
  },
  createPointerTrigger(compositeArea, 'y'),
) as ScrubPointerScene | null;

const namedArea = document.getElementById(POINTER_IDS.namedArea) as HTMLElement;
const namedEffectScene = getScrubScene(
  namedTarget,
  {
    namedEffect: { type: 'TestPointerNamed' },
    centeredToTarget: true,
    transitionDuration: 120,
    transitionEasing: 'easeOut',
    fill: 'both',
  },
  createPointerTrigger(namedArea, 'x'),
) as ScrubPointerScene | null;

const customArea = document.getElementById(POINTER_IDS.customArea) as HTMLElement;
const customEffectScene = getScrubScene(
  customTarget,
  {
    customEffect: {
      ranges: [
        { name: 'opacity', min: 0.2, max: 1 },
        { name: 'scale', min: 0.75, max: 1.35 },
      ],
    },
    transitionDuration: 120,
    transitionEasing: 'easeOut',
    fill: 'both',
  },
  createPointerTrigger(customArea, 'y'),
) as ScrubPointerScene | null;

function getRelativeProgress(area: HTMLElement, clientX: number, clientY: number) {
  const rect = area.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  return { x, y };
}

const pointerSceneControllers: AbortController[] = [];

function bindPointerScene(area: HTMLElement, scene: ScrubPointerScene | null) {
  if (!scene) {
    return;
  }

  const abortController = new AbortController();
  pointerSceneControllers.push(abortController);

  let isReady = true;
  let pendingProgress: { x: number; y: number } | null = null;

  if (scene.ready) {
    isReady = false;
    scene.ready.then(() => {
      isReady = true;
      if (!pendingProgress) {
        return;
      }

      scene.effect({}, pendingProgress);
      pendingProgress = null;
    });
  }

  area.addEventListener(
    'pointermove',
    (event) => {
      if (scene.disabled) {
        return;
      }

      const progress = getRelativeProgress(area, event.clientX, event.clientY);
      if (!isReady) {
        pendingProgress = progress;
        return;
      }

      scene.effect({}, progress);
    },
    { signal: abortController.signal },
  );
}

bindPointerScene(pointerArea, xAxisScene);
bindPointerScene(yAxisArea, yAxisScene);
bindPointerScene(compositeArea, compositeScaleXScene);
bindPointerScene(compositeArea, compositeScaleYScene);
bindPointerScene(namedArea, namedEffectScene);
bindPointerScene(customArea, customEffectScene);

// Pointer area readout (scene driving is handled by getScrubScene)
pointerArea.addEventListener('pointermove', (e) => {
  const progress = getRelativeProgress(pointerArea, e.clientX, e.clientY);

  if (progressDisplay) {
    progressDisplay.textContent = `x: ${progress.x.toFixed(3)} y: ${progress.y.toFixed(3)}`;
  }
});

const pointerSceneHandle: PointerFixtureWindow['pointerScene'] = {
  playState: 'running',
  cancel() {
    xAxisScene?.destroy();
    yAxisScene?.destroy();
    compositeScaleXScene?.destroy();
    compositeScaleYScene?.destroy();
    namedEffectScene?.destroy();
    customEffectScene?.destroy();
    pointerSceneControllers.forEach((controller) => controller.abort());
    this.playState = 'idle';
  },
};

(window as PointerFixtureWindow).pointerScene = pointerSceneHandle;
