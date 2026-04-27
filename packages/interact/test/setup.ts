// jsdom does not implement ViewTimeline; stub it so motion's
// scroll-driven code path doesn't crash with "window is not defined".
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}
