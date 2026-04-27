import { describe, expect, it } from 'vitest';
import { generate } from '../src/core/css';
import { InteractConfig } from '../src/types';

describe('css.generate', () => {
  describe('filtering logic', () => {
    it('should generate CSS for viewEnter trigger with type once', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn', triggerType: 'once' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="my-element"]');
      expect(result).toContain('visibility: hidden');
    });

    it('should generate CSS for viewEnter trigger with no type (defaults to once)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="my-element"]');
      expect(result).toContain('visibility: hidden');
    });

    it('should NOT generate CSS for viewEnter with type repeat', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn', triggerType: 'repeat' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toBe('');
    });

    it('should NOT generate CSS for viewEnter with type state', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn', triggerType: 'state' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toBe('');
    });

    it('should NOT generate CSS for non-viewEnter triggers', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'click',
            effects: [{ effectId: 'fadeIn' }],
          },
          {
            key: 'my-element-2',
            trigger: 'hover',
            effects: [{ effectId: 'fadeIn' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toBe('');
    });
  });

  describe('target equals source matching', () => {
    describe('key matching', () => {
      it('should generate CSS when effect has no key (inherits from interaction)', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              effects: [{ effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
      });

      it('should generate CSS when effect key matches interaction key', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              effects: [{ key: 'my-element', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
      });

      it('should NOT generate CSS when effect key differs from interaction key', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'source-element',
              trigger: 'viewEnter',
              effects: [{ key: 'target-element', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });
    });

    describe('selector matching', () => {
      it('should generate CSS when both have no selector', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              effects: [{ effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
      });

      it('should generate CSS when effect selector matches interaction selector', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              selector: '.inner',
              effects: [{ selector: '.inner', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"] .inner');
      });

      it('should NOT generate CSS when effect selector differs from interaction selector', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              selector: '.source-inner',
              effects: [{ selector: '.target-inner', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });

      it('should NOT generate CSS when interaction has selector but effect does not', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              selector: '.inner',
              effects: [{ effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });
    });

    describe('listContainer matching', () => {
      it('should generate CSS when both have no listContainer', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              effects: [{ effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
      });

      it('should generate CSS when effect listContainer matches interaction listContainer', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              listContainer: '.list',
              effects: [{ listContainer: '.list', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"] .list');
      });

      it('should NOT generate CSS when effect listContainer differs from interaction listContainer', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              listContainer: '.source-list',
              effects: [{ listContainer: '.target-list', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });

      it('should generate CSS with listContainer and listItemSelector', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              listContainer: '.list',
              listItemSelector: 'li',
              effects: [{ listContainer: '.list', listItemSelector: 'li', effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);
        expect(result).toContain('[data-interact-key="my-element"]');
        expect(result).toContain('.list');
      });

      it('should NOT generate CSS when effect listItemSelector differs from interaction listItemSelector', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'gallery',
              trigger: 'viewEnter',
              listContainer: '.gallery-grid',
              listItemSelector: '.image',
              effects: [
                {
                  listContainer: '.gallery-grid',
                  listItemSelector: '.caption',
                  effectId: 'fadeIn',
                },
              ],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });
    });

    describe('selectorCondition matching', () => {
      it('should generate CSS when both have no conditions', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              effects: [{ effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
      });

      it('should generate CSS when effect condition matches interaction condition', () => {
        const config: InteractConfig = {
          effects: {},
          conditions: {
            mobile: { type: 'selector', predicate: ':not(.desktop)' },
          },
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              conditions: ['mobile'],
              effects: [{ conditions: ['mobile'], effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]');
        expect(result).toContain(':not(.desktop)');
      });

      it('should NOT generate CSS when effect condition differs from interaction condition', () => {
        const config: InteractConfig = {
          effects: {},
          conditions: {
            mobile: { type: 'selector', predicate: ':not(.desktop)' },
            tablet: { type: 'selector', predicate: ':not(.phone)' },
          },
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              conditions: ['mobile'],
              effects: [{ conditions: ['tablet'], effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toBe('');
      });

      it('should apply condition with & replacement pattern', () => {
        const config: InteractConfig = {
          effects: {},
          conditions: {
            hovered: { type: 'selector', predicate: '&:hover' },
          },
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              conditions: ['hovered'],
              effects: [{ conditions: ['hovered'], effectId: 'fadeIn' }],
            },
          ],
        };

        const result = generate(config);

        expect(result).toContain('[data-interact-key="my-element"]:hover');
      });
    });
  });

  describe('multiple interactions/effects', () => {
    it('should generate CSS for multiple matching interactions', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'element-1',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn' }],
          },
          {
            key: 'element-2',
            trigger: 'viewEnter',
            effects: [{ effectId: 'slideIn' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="element-1"]');
      expect(result).toContain('[data-interact-key="element-2"]');
    });

    it('should deduplicate CSS for multiple effects with same selector', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn' }, { effectId: 'scaleIn' }],
          },
        ],
      };

      const result = generate(config);

      const matches = result.match(/@media \(prefers-reduced-motion: no-preference\)/g);
      expect(matches).toHaveLength(1);
    });

    it('should only generate CSS for matching effects, not all effects', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [{ effectId: 'fadeIn' }, { key: 'other-element', effectId: 'slideIn' }],
          },
        ],
      };

      const result = generate(config);

      const matches = result.match(/@media \(prefers-reduced-motion: no-preference\)/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('effectId resolution', () => {
    it('should resolve effect data from config.effects when effectId is provided', () => {
      const config: InteractConfig = {
        effects: {
          customFade: {
            selector: '.content',
            effectId: 'customFade',
          },
        },
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            selector: '.content',
            effects: [{ effectId: 'customFade' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="my-element"] .content');
    });

    it('should use effect properties directly when effectId is not in config.effects', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            selector: '.content',
            effects: [{ effectId: 'unknownEffect', selector: '.content' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="my-element"] .content');
    });
  });
});
