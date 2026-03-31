import * as presets from '@wix/motion-presets';

export interface PresetEntry {
  name: string;
  category: string;
}

const CATEGORIES: Record<string, string> = {
  entrance: 'Entrance',
  ongoing: 'Ongoing',
  scroll: 'Scroll',
  mouse: 'Mouse',
  backgroundScroll: 'Background Scroll',
};

const CATEGORY_PRESETS: Record<string, string[]> = {
  entrance: [
    'ArcIn',
    'BlurIn',
    'BounceIn',
    'CurveIn',
    'DropIn',
    'ExpandIn',
    'FadeIn',
    'FlipIn',
    'FloatIn',
    'FoldIn',
    'GlideIn',
    'RevealIn',
    'ShapeIn',
    'ShuttersIn',
    'SlideIn',
    'SpinIn',
    'TiltIn',
    'TurnIn',
    'WinkIn',
  ],
  ongoing: [
    'Bounce',
    'Breathe',
    'Cross',
    'Flash',
    'Flip',
    'Fold',
    'Jello',
    'Poke',
    'Pulse',
    'Rubber',
    'Spin',
    'Swing',
    'Wiggle',
  ],
  scroll: [
    'ArcScroll',
    'BlurScroll',
    'FadeScroll',
    'FlipScroll',
    'GrowScroll',
    'MoveScroll',
    'PanScroll',
    'ParallaxScroll',
    'RevealScroll',
    'ShapeScroll',
    'ShrinkScroll',
    'ShuttersScroll',
    'SkewPanScroll',
    'SlideScroll',
    'Spin3dScroll',
    'SpinScroll',
    'StretchScroll',
    'TiltScroll',
    'TurnScroll',
  ],
  mouse: [
    'AiryMouse',
    'BlobMouse',
    'BlurMouse',
    'BounceMouse',
    'ScaleMouse',
    'SkewMouse',
    'SpinMouse',
    'SwivelMouse',
    'Tilt3DMouse',
    'Track3DMouse',
    'TrackMouse',
  ],
  backgroundScroll: [
    'BgCloseUp',
    'BgFade',
    'BgFadeBack',
    'BgFake3D',
    'BgPan',
    'BgParallax',
    'BgPullBack',
    'BgReveal',
    'BgRotate',
    'BgSkew',
    'BgZoom',
    'ImageParallax',
  ],
};

export const presetCatalog: PresetEntry[] = [];

for (const [category, names] of Object.entries(CATEGORY_PRESETS)) {
  for (const name of names) {
    presetCatalog.push({ name, category: CATEGORIES[category] ?? category });
  }
}

export function getPresetsByCategory(allowedCategories?: string[]): Map<string, PresetEntry[]> {
  const map = new Map<string, PresetEntry[]>();
  for (const entry of presetCatalog) {
    if (allowedCategories && !allowedCategories.includes(entry.category)) continue;
    const list = map.get(entry.category) ?? [];
    list.push(entry);
    map.set(entry.category, list);
  }
  return map;
}

export function getAllPresets(): Record<string, unknown> {
  return presets as unknown as Record<string, unknown>;
}
