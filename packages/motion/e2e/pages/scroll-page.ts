import type { Page } from '@playwright/test';
import { BaseFixturePage } from './base-fixture-page';
import {
  scrollTo,
  scrollElementIntoView,
  getScrollProgress,
  getScrollY,
} from '../utils/scroll-helpers';

type FixtureWindow = {
  scrubScene: { cancel(): void; playState: string };
  destroyScrubScene(): void;
  supportsViewTimeline: boolean;
  getScrollProgress(): number;
  getScrubSceneMode(): 'native' | 'polyfill';
  getNativeCustomValues(): { progress: number; shift: number };
};

export class ScrollPage extends BaseFixturePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('scroll');
  }

  scrollTo(y: number) {
    return scrollTo(this.page, y);
  }

  scrollElementIntoView(selector: string) {
    return scrollElementIntoView(this.page, selector);
  }

  getScrollProgress() {
    return getScrollProgress(this.page);
  }

  getScrollY() {
    return getScrollY(this.page);
  }

  destroyScrubScene() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).destroyScrubScene());
  }

  getScrubScenePlayState() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).scrubScene.playState);
  }

  supportsNativeViewTimeline() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).supportsViewTimeline);
  }

  getScrubSceneMode() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).getScrubSceneMode());
  }

  getNativeCustomValues() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).getNativeCustomValues());
  }

  getElementVisualState(selector: string) {
    return this.page.evaluate((selector_) => {
      const element = document.querySelector(selector_) as HTMLElement | null;
      if (!element) {
        return null;
      }

      const style = getComputedStyle(element);
      return {
        opacity: style.opacity,
        transform: style.transform,
      };
    }, selector);
  }

  wait(ms: number) {
    return this.page.waitForTimeout(ms);
  }
}
