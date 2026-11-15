import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motionMocks = vi.hoisted(() => ({ getAnimation: vi.fn() }));

vi.mock('@wix/motion', () => ({
  getAnimation: motionMocks.getAnimation,
  getScrubScene: vi.fn(),
}));

class CSSUnitValue {
  constructor(
    public value: number,
    public unit: string,
  ) {}
}

class CSSMathSum {
  values: CSSUnitValue[];
  constructor(...values: CSSUnitValue[]) {
    this.values = values;
  }
}

const px = (value: number) => new CSSUnitValue(value, 'px');
const percent = (value: number) => new CSSUnitValue(value, 'percent');

// an element whose cover range runs from scroll position -662px (0%) to 279px (100%),
// i.e. at the top of the page it is already at 70.35% of its cover range
const createAboveFoldAnimation = (overrides: Record<string, unknown> = {}) => ({
  timeline: { startOffset: px(-662), endOffset: px(279) },
  rangeStart: { rangeName: 'cover', offset: percent(50) } as unknown,
  rangeEnd: { rangeName: 'cover', offset: percent(100) } as unknown,
  ...overrides,
});

const outEffect = {
  namedEffect: { type: 'SlideScroll', range: 'out', direction: 'bottom' },
  rangeStart: { name: 'cover', offset: { value: 50, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
} as any;

describe('viewProgress handler', () => {
  let viewProgressHandler: any;
  let source: HTMLElement;

  const addHandler = (effect: any, animations: unknown[], isCSS = true) => {
    motionMocks.getAnimation.mockReturnValue({
      animations,
      isCSS,
      play: vi.fn(),
      cancel: vi.fn(),
      ready: Promise.resolve(),
    });
    viewProgressHandler.add(source, source, effect, {}, {});
  };

  beforeEach(async () => {
    vi.resetModules();
    viewProgressHandler = ((await import('../src/handlers/viewProgress')) as any).default;

    vi.stubGlobal('ViewTimeline', class {});
    vi.stubGlobal('CSSUnitValue', CSSUnitValue);
    vi.stubGlobal('CSSMathSum', CSSMathSum);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    document.body.innerHTML = '';
    source = document.createElement('div');
    document.body.appendChild(source);
  });

  afterEach(() => {
    viewProgressHandler.remove(source);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('out effects on elements already past rangeStart at the top of the page', () => {
    it('starts the animation from the element position at the top of the page', () => {
      const animation = createAboveFoldAnimation();

      addHandler(outEffect, [animation]);

      expect(animation.rangeStart).toBe(`cover ${(662 / 941) * 100}%`);
    });

    it('also applies to web animations', () => {
      const animation = createAboveFoldAnimation();

      addHandler(outEffect, [animation], false);

      expect(animation.rangeStart).toBe(`cover ${(662 / 941) * 100}%`);
    });

    it('resolves calc() range ends', () => {
      const animation = createAboveFoldAnimation({
        rangeEnd: { rangeName: 'cover', offset: new CSSMathSum(percent(100), px(7.68)) },
      });

      addHandler(outEffect, [animation]);

      expect(animation.rangeStart).toBe(`cover ${(662 / 941) * 100}%`);
    });

    it('waits for the timeline offsets to resolve', () => {
      const timeline = { startOffset: null as unknown, endOffset: null as unknown };
      const animation = createAboveFoldAnimation({ timeline });
      let frames = 0;
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frames += 1;
        if (frames === 3) {
          timeline.startOffset = px(-662);
          timeline.endOffset = px(279);
        }
        callback(0);
        return 0;
      });

      addHandler(outEffect, [animation]);

      expect(frames).toBe(3);
      expect(animation.rangeStart).toBe(`cover ${(662 / 941) * 100}%`);
    });
  });

  describe('leaves the range unchanged', () => {
    it('when the element reaches rangeStart by scrolling', () => {
      // cover range from -200px to 900px: 18% at the top of the page
      const animation = createAboveFoldAnimation({
        timeline: { startOffset: px(-200), endOffset: px(900) },
      });
      const { rangeStart } = animation;

      addHandler(outEffect, [animation]);

      expect(animation.rangeStart).toBe(rangeStart);
    });

    it('for effects that are not out effects', () => {
      const animation = createAboveFoldAnimation();
      const { rangeStart } = animation;

      addHandler({ ...outEffect, namedEffect: { ...outEffect.namedEffect, range: 'in' } }, [
        animation,
      ]);

      expect(animation.rangeStart).toBe(rangeStart);
    });

    it('for ranges other than cover', () => {
      const animation = createAboveFoldAnimation({
        rangeStart: { rangeName: 'exit', offset: percent(0) },
      });
      const { rangeStart } = animation;

      addHandler(outEffect, [animation]);

      expect(animation.rangeStart).toBe(rangeStart);
    });

    it('when the element is past rangeEnd at the top of the page', () => {
      const animation = createAboveFoldAnimation({
        rangeEnd: { rangeName: 'cover', offset: percent(60) },
      });
      const { rangeStart } = animation;

      addHandler(outEffect, [animation]);

      expect(animation.rangeStart).toBe(rangeStart);
    });
  });
});
