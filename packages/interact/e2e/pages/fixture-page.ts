import type { Page } from '@playwright/test';
import type { InteractConfig } from '@wix/interact/web';

export type Mode = 'css' | 'runtime';

declare global {
  interface Window {
    mountCSS(config: InteractConfig, html: string): void;
    mountRuntime(config: InteractConfig, html: string): void;
    fixtureReady?: boolean;
  }
}

export class FixturePage {
  constructor(
    readonly page: Page,
    readonly mode: Mode,
  ) {}

  async mount(config: InteractConfig, html: string, width: number): Promise<void> {
    await this.page.setViewportSize({ width, height: 600 });
    await this.page.goto('/');
    await this.page.waitForFunction(() => window.fixtureReady);
    await this.page.evaluate(
      ([mode, config, html]) =>
        mode === 'css' ? window.mountCSS(config, html) : window.mountRuntime(config, html),
      [this.mode, config, html] as const,
    );
    await this.page.waitForTimeout(100);
  }

  async resize(width: number): Promise<void> {
    await this.page.setViewportSize({ width, height: 600 });
    await this.page.waitForTimeout(100);
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector);
    await this.page.waitForTimeout(100);
  }

  /**
   * The animations playing on each matching element: CSS animations by keyframes name, and web animations
   * by the id of their effect.
   */
  async animations(selector: string): Promise<string[][]> {
    return this.page.evaluate(
      ([mode, selector]) =>
        [...document.querySelectorAll(selector)].map((element) =>
          mode === 'css'
            ? getComputedStyle(element)
                .animationName.split(', ')
                .filter((name) => name !== 'none')
            : element.getAnimations().map(({ id }) => id.replace(/-\d+$/, '')),
        ),
      [this.mode, selector] as const,
    );
  }

  async style(selector: string, property: string): Promise<string> {
    return this.page.evaluate(
      ([selector, property]) =>
        getComputedStyle(document.querySelector(selector)!).getPropertyValue(property).trim(),
      [selector, property] as const,
    );
  }
}
