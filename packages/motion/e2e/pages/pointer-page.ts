import type { Page } from '@playwright/test';
import { BaseFixturePage } from './base-fixture-page';
import { movePointerWithinElement } from '../utils/pointer-helpers';

export class PointerPage extends BaseFixturePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('pointer');
  }

  movePointerWithinElement(containerSelector: string, ratioX: number, ratioY: number) {
    return movePointerWithinElement(this.page, containerSelector, ratioX, ratioY);
  }

  cancelPointerScene() {
    return this.page.evaluate(() =>
      (window as unknown as { pointerScene: { cancel(): void } }).pointerScene.cancel(),
    );
  }

  getPointerScenePlayState() {
    return this.page.evaluate(
      () => (window as unknown as { pointerScene: { playState: string } }).pointerScene.playState,
    );
  }
}
