import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { watchViewTimeline } from '../src/api/viewTimeline';

// checks run synchronously, so each event below is checked right away
vi.mock('fastdom', () => ({
  default: {
    measure: vi.fn((fn) => fn()),
    mutate: vi.fn((fn) => fn()),
    clear: vi.fn(),
  },
}));

type Sizes = { scrollTop: number; scrollLeft: number; scrollHeight: number; clientHeight: number };

// a scroll container whose sizes and scroll position the test can change
function aScroller(style: Partial<CSSStyleDeclaration>, sizes: Partial<Sizes>) {
  const scroller = document.createElement('div');
  Object.assign(scroller.style, style);
  const all: Sizes = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 200,
    clientHeight: 200,
    ...sizes,
  };
  Object.entries(all).forEach(([name, value]) =>
    Object.defineProperty(scroller, name, { value, writable: true, configurable: true }),
  );
  return scroller as HTMLElement & Sizes;
}

const aSlider = (sizes: Partial<Sizes> = {}) =>
  aScroller({ overflowX: 'scroll', overflowY: 'auto' }, sizes);
const aVerticalScroller = (sizes: Partial<Sizes> = {}) => aScroller({ overflowY: 'auto' }, sizes);

describe('watchViewTimeline()', () => {
  const subject = document.createElement('div');
  let source: Element;
  let onChange: ReturnType<typeof vi.fn>;
  let stop: () => void;

  beforeEach(() => {
    onChange = vi.fn();
    Object.defineProperty(document, 'scrollingElement', {
      value: document.documentElement,
      configurable: true,
    });
    (globalThis as any).ViewTimeline = vi.fn(function () {
      return { source };
    });
  });

  afterEach(() => {
    stop?.();
    delete (globalThis as any).ViewTimeline;
    delete (document as any).scrollingElement;
  });

  const scrollPage = () => window.dispatchEvent(new Event('scroll'));
  const scroll = (scroller: Element) => scroller.dispatchEvent(new Event('scroll'));

  test('reports the answer right away', () => {
    source = aSlider();
    stop = watchViewTimeline(subject, onChange);

    expect(onChange.mock.calls).toEqual([[false]]);
  });

  test('reports false once, and watches nothing, without ViewTimeline support', () => {
    delete (globalThis as any).ViewTimeline;
    const addEventListener = vi.spyOn(window, 'addEventListener');

    stop = watchViewTimeline(subject, onChange);

    expect(onChange.mock.calls).toEqual([[false]]);
    expect(addEventListener).not.toHaveBeenCalled();
    addEventListener.mockRestore();
  });

  // a slider whose item has an entrance transform at setup: scrollable until the transform ends
  test('moves to the fallback when the page scrolls after the scroller lost its range', () => {
    const slider = aSlider({ scrollHeight: 240 });
    source = slider;
    stop = watchViewTimeline(subject, onChange);
    expect(onChange.mock.calls).toEqual([[true]]);

    scrollPage();
    expect(onChange.mock.calls).toEqual([[true]]);

    slider.scrollHeight = 200;
    scrollPage();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  // a vertical scroller whose content arrives after setup
  test('moves to the native timeline once the scroller scrolls on the block axis', () => {
    const scroller = aVerticalScroller({ scrollHeight: 300, clientHeight: 300 });
    source = scroller;
    stop = watchViewTimeline(subject, onChange);
    expect(onChange.mock.calls).toEqual([[false]]);

    scroller.scrollHeight = 900;
    scrollPage();
    expect(onChange.mock.calls).toEqual([[false]]);

    scroller.scrollTop = 120;
    scroll(scroller);
    expect(onChange.mock.calls).toEqual([[false], [true]]);
  });

  // e.g. an item scaled on hover while the slider is swiped sideways
  test('stays on the fallback for a passing range without a block-axis scroll', () => {
    const slider = aSlider();
    source = slider;
    stop = watchViewTimeline(subject, onChange);

    slider.scrollHeight = 205;
    slider.scrollLeft = 300;
    scroll(slider);
    scrollPage();

    expect(onChange.mock.calls).toEqual([[false]]);
  });

  test('checks the scroller again on resize', () => {
    source = document.documentElement;
    stop = watchViewTimeline(subject, onChange);
    expect(onChange.mock.calls).toEqual([[true]]);

    // a slider appears below a breakpoint
    source = aSlider();
    window.dispatchEvent(new Event('resize'));
    expect(onChange.mock.calls).toEqual([[true], [false]]);

    source = document.documentElement;
    window.dispatchEvent(new Event('resize'));
    expect(onChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  test('stops watching when stopped', () => {
    const slider = aSlider({ scrollHeight: 240 });
    source = slider;
    stop = watchViewTimeline(subject, onChange);
    stop();

    slider.scrollHeight = 200;
    scrollPage();
    window.dispatchEvent(new Event('resize'));

    expect(onChange.mock.calls).toEqual([[true]]);
  });
});
