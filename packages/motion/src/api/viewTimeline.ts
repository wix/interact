import fastdom from 'fastdom';
import type { TriggerVariant } from '../types';

/**
 * The scroll container that a native view timeline on `subject` follows, when it isn't the page.
 * Null when it's the page, when the subject has no box yet, or without ViewTimeline support.
 *
 * A view timeline always follows its subject's nearest scroll container, and that can't be
 * overridden. `overflow-x: scroll` (a horizontal slider) makes a box a scroll container on both
 * axes, so inside a slider the block-axis timeline follows a box that doesn't scroll on that axis.
 */
function getViewTimelineScroller(subject: HTMLElement | null): Element | null {
  if (!window.ViewTimeline) {
    return null;
  }

  // the browser resolves the scroll container (Chrome already lays out to construct the timeline)
  // @ts-expect-error
  const { source } = new ViewTimeline({ subject }) as { source: Element | null };

  return source && source !== source.ownerDocument.scrollingElement ? source : null;
}

// the scroller's block axis, the axis motion's view timelines use; it's horizontal in vertical writing modes
function getBlockAxis(scroller: Element) {
  const style = getComputedStyle(scroller);

  return /^(vertical|sideways)/.test(style.writingMode)
    ? {
        overflow: style.overflowX,
        position: scroller.scrollLeft,
        range: scroller.scrollWidth - scroller.clientWidth,
      }
    : {
        overflow: style.overflowY,
        position: scroller.scrollTop,
        range: scroller.scrollHeight - scroller.clientHeight,
      };
}

/**
 * Whether the axis can move a view timeline: the user can scroll it, and it has more than a pixel
 * to scroll. Scroll and client sizes are rounded to whole pixels, so a 1px difference can come from
 * sub-pixel overflow alone, and a pixel of scrolling can't move a timeline visibly anyway.
 */
function canScroll({ overflow, range }: ReturnType<typeof getBlockAxis>): boolean {
  return (overflow === 'auto' || overflow === 'scroll') && range > 1;
}

/**
 * Whether a view-progress effect on `subject` runs on a native ViewTimeline: the browser supports it,
 * and the subject's scroll container is the page or can scroll on the timeline's axis. When it's
 * false, drive the effect with the scenes from `getScrubScene()` against the page's scroll.
 *
 * It reads layout at the time of the call. To follow layout changes, use `watchViewTimeline()`.
 */
function canUseViewTimeline(subject: HTMLElement | null): boolean {
  if (!window.ViewTimeline) {
    return false;
  }

  const scroller = getViewTimelineScroller(subject);

  return !scroller || canScroll(getBlockAxis(scroller));
}

// the trigger's `useViewTimeline`, or canUseViewTimeline() when it doesn't say
function resolveUseViewTimeline(
  trigger: Partial<TriggerVariant>,
  subject: HTMLElement | null,
): boolean {
  return !!window.ViewTimeline && (trigger.useViewTimeline ?? canUseViewTimeline(subject));
}

type Reason = 'resize' | 'page-scroll' | 'scroller-scroll';

/**
 * Calls `onChange` with canUseViewTimeline(subject) right away, and again each time the answer
 * changes, until the returned function is called. The answer depends on layout that can change after
 * setup, so it is checked again:
 *
 * - on resize, which can add or remove the scroller (e.g. a slider below a breakpoint);
 * - on page scroll, while a native timeline follows a scroller: the scroller can lose its range,
 *   e.g. when an item's entrance transform ends, and then the timeline stops moving;
 * - when the scroller scrolls on the block axis, while the effect is on the fallback: its range can
 *   come later, e.g. with lazy content. It takes an actual scroll on that axis, not just a range, so
 *   a passing overflow such as an item scaled on hover doesn't switch it.
 *
 * Checks are batched once per frame with fastdom.
 */
function watchViewTimeline(
  subject: HTMLElement,
  onChange: (useViewTimeline: boolean) => void,
): () => void {
  if (!window.ViewTimeline) {
    onChange(false);
    return () => {};
  }

  let scroller: Element | null = null;
  let position = 0;
  let useViewTimeline: boolean;
  const reasons = new Set<Reason>();
  let task: (() => void) | null = null;

  const queue = (reason: Reason) => {
    const idle = !reasons.size;
    reasons.add(reason);
    if (idle) {
      task = fastdom.measure(check);
    }
  };
  const onResize = () => queue('resize');
  const onPageScroll = () => queue('page-scroll');
  const onScrollerScroll = () => queue('scroller-scroll');

  // listens to the scroller and to the page only while the subject sits in a scroller
  const follow = (next: Element | null) => {
    if (next !== scroller) {
      if (scroller) {
        scroller.removeEventListener('scroll', onScrollerScroll);
        window.removeEventListener('scroll', onPageScroll);
      }
      if (next) {
        next.addEventListener('scroll', onScrollerScroll, { passive: true });
        window.addEventListener('scroll', onPageScroll, { passive: true });
      }
      scroller = next;
    }
    position = scroller ? getBlockAxis(scroller).position : 0;
  };

  const set = (next: boolean) => {
    if (next !== useViewTimeline) {
      useViewTimeline = next;
      onChange(next);
    }
  };

  function check() {
    task = null;

    if (reasons.has('resize')) {
      follow(getViewTimelineScroller(subject));
      set(!scroller || canScroll(getBlockAxis(scroller)));
    } else if (scroller) {
      const axis = getBlockAxis(scroller);

      if (useViewTimeline && reasons.has('page-scroll') && !canScroll(axis)) {
        set(false);
      } else if (
        !useViewTimeline &&
        reasons.has('scroller-scroll') &&
        axis.position !== position &&
        canScroll(axis)
      ) {
        set(true);
      }
      position = axis.position;
    }

    reasons.clear();
  }

  follow(getViewTimelineScroller(subject));
  useViewTimeline = !scroller || canScroll(getBlockAxis(scroller));
  onChange(useViewTimeline);
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    follow(null);
    if (task) {
      fastdom.clear(task);
    }
    reasons.clear();
  };
}

export { canUseViewTimeline, resolveUseViewTimeline, watchViewTimeline };
