import { Interact, generate } from '@wix/interact/web';
import type { InteractConfig } from '@wix/interact/web';
import {
  BgCloseUp,
  BgPan,
  BgParallax,
  BgReveal,
  BgRotate,
  ImageParallax,
  Tilt3DMouse,
} from '@wix/motion-presets';

// declares a static style on each of its parts
const staticParts = (options: object) =>
  ['MEDIA_CLIP', 'MEDIA_WRAPPER'].map((part, index) => ({
    ...options,
    name: `static-parts-${index}`,
    part,
    style: part === 'MEDIA_CLIP' ? { overflow: 'clip' } : { outlineStyle: 'dashed' },
    keyframes: [{ opacity: 0.5 }, { opacity: 0.5 }],
  }));
const StaticParts = {
  web: staticParts,
  style: staticParts,
  getNames: () => ['static-parts-0', 'static-parts-1'],
};

Interact.registerEffects({
  BgCloseUp,
  BgPan,
  BgParallax,
  BgReveal,
  BgRotate,
  ImageParallax,
  Tilt3DMouse,
  StaticParts,
} as any);

const root = document.getElementById('root')!;

Object.assign(window, {
  mountCSS(config: InteractConfig, html: string) {
    const style = document.createElement('style');
    style.textContent = generate(config, true);
    document.head.append(style);
    root.innerHTML = html;
  },
  mountRuntime(config: InteractConfig, html: string) {
    root.innerHTML = html;
    Interact.create(config);
  },
  fixtureReady: true,
});
