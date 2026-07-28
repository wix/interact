import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Interact, add, remove, generate } from '@wix/interact';
import type { InteractConfig } from '@wix/interact';
import { splitTextPlugin, splitTextStyle } from '../src/plugins/splitText';

// End-to-end proof of the plugin bridge with the REAL @wix/splittext: splitText mutates the DOM,
// Interact resolves the generated spans, and disconnect reverts the split. The animation engine
// runs for real but no presets are registered here, so `getAnimation` logs a benign
// "FadeIn not found in registry" — irrelevant to the split/resolve/revert behavior under test.
describe('splitText through the Interact plugin bridge (real @wix/splittext)', () => {
  beforeEach(() => {
    Interact.use('splitText', splitTextPlugin);
  });

  afterEach(() => {
    Interact.destroy();
  });

  it('splits the container into char spans that the effect selector targets, then reverts', () => {
    const element = document.createElement('div');
    element.innerHTML = '<h1 class="title">Hi</h1>';
    document.body.appendChild(element);

    const config: InteractConfig = {
      interactions: [
        {
          key: 'hero',
          trigger: 'hover',
          $splitText: { container: '.title', type: 'chars' },
          effects: [
            {
              key: 'hero',
              selector: '.split-c',
              namedEffect: { type: 'FadeIn' } as never,
              duration: 300,
            },
          ],
        },
      ],
    };

    Interact.create(config);
    add(element, 'hero');

    // Real splitText produced char spans inside the container.
    const chars = element.querySelectorAll('.split-c');
    expect(chars.length).toBeGreaterThanOrEqual(2); // "H", "i"

    // Teardown reverts: the split spans are gone and the original text is restored.
    remove('hero');
    expect(element.querySelectorAll('.split-c').length).toBe(0);
    expect(element.querySelector('.title')?.textContent).toContain('Hi');

    document.body.removeChild(element);
  });

  it('generate() emits SSR FOUC-prevention CSS via splitTextStyle, matched by the runtime marker', () => {
    // A `hover` trigger keeps the runtime path off the (jsdom-unsupported) sequence engine;
    // the `hideUntilReady` marker is trigger-independent. The SSR rule is emitted for any trigger.
    const config: InteractConfig = {
      interactions: [
        {
          key: 'hero',
          trigger: 'hover',
          $splitText: { container: '.title', type: 'chars', hideUntilReady: true },
          effects: [
            {
              key: 'hero',
              selector: '.split-c',
              namedEffect: { type: 'FadeIn' } as never,
              duration: 300,
            },
          ],
        },
      ],
    };

    // SSR: the container is hidden until the split marks it ready.
    const css = generate(config, { plugins: { splitText: splitTextStyle } });
    expect(css).toContain(
      '[data-interact-key="hero"] .title:not([data-splittext-ready]) {\nvisibility: hidden;\n}',
    );

    // Runtime: after the plugin splits, the container carries the marker, so the hide rule
    // stops matching (the generated spans handle their own entrance visibility).
    const element = document.createElement('div');
    element.innerHTML = '<h1 class="title">Hi</h1>';
    document.body.appendChild(element);

    Interact.create(config);
    add(element, 'hero');

    expect(element.querySelector('.title')?.hasAttribute('data-splittext-ready')).toBe(true);
    expect(element.querySelectorAll('.split-c').length).toBeGreaterThanOrEqual(2);

    remove('hero');
    expect(element.querySelector('.title')?.hasAttribute('data-splittext-ready')).toBe(false);

    document.body.removeChild(element);
  });

  it('generate() omits the hide rule when hideUntilReady is not set', () => {
    const config: InteractConfig = {
      effects: { 'char-fade-up': { namedEffect: { type: 'FadeIn' }, duration: 400 } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          $splitText: { container: '.title', type: 'chars' },
          sequences: [
            { offset: 30, effects: [{ effectId: 'char-fade-up', selector: '.split-c' }] },
          ],
        },
      ],
    };

    const css = generate(config, { plugins: { splitText: splitTextStyle } });
    expect(css).not.toContain('data-splittext-ready');
  });
});
