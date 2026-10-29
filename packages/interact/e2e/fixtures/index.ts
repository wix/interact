import { Interact, generate } from '@wix/interact/web';
import type { InteractConfig } from '@wix/interact/web';
import { BgCloseUp, BgParallax, Tilt3DMouse } from '@wix/motion-presets';

Interact.registerEffects({ BgCloseUp, BgParallax, Tilt3DMouse } as any);

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
