import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, add } from '../src/index';
import { InteractionController } from '../src/core/InteractionController';
import { _generate } from '../src/core/css';
import { createTransitionCSS } from '../src/utils';
import type { InteractConfig } from '../src/types';

const HOVERED = { name: 'transform', value: 'scale(1.05)' };
const CHILDREN = { name: 'transition', value: 'all 0.3s ease 0s' };

const hoverConfig = (): InteractConfig => ({
  effects: {},
  interactions: [
    {
      key: 'card',
      trigger: 'hover',
      effects: [
        {
          key: 'card',
          selector: '.card',
          effectId: 'hovered',
          transition: { styleProperties: [HOVERED] },
          elementStyles: [{ selector: '.card .title', styleProperties: [CHILDREN] }],
        },
      ],
    },
  ],
});

const stateRules = (config: InteractConfig, effectId: string) =>
  _generate(config).cssRules.filter(({ states }) => states?.includes(effectId));

describe('state looks on other elements of the key', () => {
  it('generates a state rule for each element the state styles', () => {
    expect(
      stateRules(hoverConfig(), 'hovered').map(({ childSelector, declarations }) => ({
        childSelector,
        declarations,
      })),
    ).toEqual([
      { childSelector: '.card', declarations: [HOVERED] },
      { childSelector: '.card .title', declarations: [CHILDREN] },
    ]);
  });

  it('renders them at runtime under the same state', () => {
    const css = createTransitionCSS({
      key: 'card',
      effectId: 'hovered',
      transition: { styleProperties: [HOVERED] },
      elementStyles: [{ selector: '.card .title', styleProperties: [CHILDREN] }],
      childSelector: '.card',
    }).join('\n');

    expect(css).toContain(':is(:state(hovered), :--hovered) .card .title');
    expect(css).toContain('[data-interact-effect~="hovered"] .card .title');
    expect(css).toMatch(/\.card \.title \{\s*transition: all 0\.3s ease 0s;/);
  });
});

describe('states code toggles', () => {
  const codeStateConfig = (): InteractConfig => ({
    conditions: { mobile: { type: 'media', predicate: '(max-width: 750px)' } },
    effects: {
      'selected@mobile': {
        key: 'card',
        selector: '.card',
        effectId: 'selected',
        conditions: ['mobile'],
        transition: { styleProperties: [HOVERED] },
      },
      hovered: { key: 'card', selector: '.card', transition: { styleProperties: [HOVERED] } },
    },
    interactions: [{ key: 'card', trigger: 'hover', effects: [{ effectId: 'hovered' }] }],
  });

  it('generates the look of a state no interaction references, by its effectId', () => {
    const [rule] = stateRules(codeStateConfig(), 'selected');

    expect(rule).toMatchObject({
      key: 'card',
      childSelector: '.card',
      media: '((max-width: 750px))',
    });
    expect(rule.declarations).toEqual([HOVERED]);
  });

  it('leaves a referenced state effect to its interaction', () => {
    expect(stateRules(codeStateConfig(), 'hovered')).toHaveLength(1);
  });

  describe('at runtime', () => {
    let renderStyle: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((media: string) => ({
          matches: true,
          media,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      renderStyle = vi
        .spyOn(InteractionController.prototype, 'renderStyle')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      renderStyle.mockRestore();
      Interact.destroy();
    });

    it('renders the look when the key connects', () => {
      Interact.create(codeStateConfig());
      const element = document.createElement('div');
      element.innerHTML = '<div class="card"></div>';

      add(element, 'card');

      const css = renderStyle.mock.calls.flatMap(([rules]) => rules as string[]).join('\n');
      expect(css).toContain(':is(:state(selected), :--selected) .card');
    });
  });
});
