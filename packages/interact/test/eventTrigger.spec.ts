import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@wix/motion', () => ({
  getAnimation: vi.fn().mockReturnValue({
    play: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    progress: vi.fn(),
    onFinish: vi.fn(),
    onAbort: vi.fn(),
    isCSS: false,
    playState: 'paused',
  }),
}));

describe('event trigger handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels its animation when the interaction is removed', async () => {
    const eventTrigger = (await import('../src/handlers/eventTrigger')).default;
    const { getAnimation } = await import('@wix/motion');
    const animation = (getAnimation as any)();
    const source = document.createElement('div');
    const target = document.createElement('div');

    eventTrigger.add(
      source,
      target,
      {
        duration: 1000,
        keyframeEffect: {
          name: 'hold',
          keyframes: [{ transform: 'scaleX(2)' }],
        },
        triggerType: 'state',
      },
      { eventConfig: 'click' },
      {},
    );

    eventTrigger.remove(source);

    expect(animation.cancel).toHaveBeenCalledTimes(1);

    eventTrigger.remove(target);

    expect(animation.cancel).toHaveBeenCalledTimes(1);
  });
});
