import type { Page } from '@playwright/test';
import { BaseFixturePage } from './base-fixture-page';
import { ANIMATION_GROUP_IDS } from '../constants/animation-group';

type FixtureWindow = {
  play(): Promise<void>;
  pause(): void;
  reverse(): Promise<void>;
  cancel(): void;
  animationGroup: {
    getProgress(): number;
    playState: string;
    progress(p: number): void;
  };
  lifecycleEvents: string[];
};

export class AnimationGroupPage extends BaseFixturePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('animation-group');
  }

  play() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).play());
  }

  pause() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).pause());
  }

  reverse() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).reverse());
  }

  cancel() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).cancel());
  }

  getProgress() {
    return this.page.evaluate(() =>
      (window as unknown as FixtureWindow).animationGroup.getProgress(),
    );
  }

  setProgress(p: number) {
    return this.page.evaluate(
      (progress) => (window as unknown as FixtureWindow).animationGroup.progress(progress),
      p,
    );
  }

  getGroupItemOpacity() {
    return this.page.evaluate((targetId) => {
      const el = document.getElementById(targetId);
      return el ? parseFloat(getComputedStyle(el).opacity) : 0;
    }, ANIMATION_GROUP_IDS.item1);
  }

  getPlayState() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).animationGroup.playState);
  }

  getPlaybackRate() {
    return this.page.evaluate(() => {
      const fixtureWindow = window as unknown as {
        animationGroup: { animations: Array<{ playbackRate: number }> };
      };

      return fixtureWindow.animationGroup.animations[0]?.playbackRate;
    });
  }

  getLifecycleEvents() {
    return this.page.evaluate(() => (window as unknown as FixtureWindow).lifecycleEvents);
  }
}
