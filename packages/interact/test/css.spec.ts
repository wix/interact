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
            effects: [{ effectId: 'fadeIn', triggerType: 'once', namedEffect: { type: 'fadeIn' } }],
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
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
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
            effects: [
              { effectId: 'fadeIn', triggerType: 'repeat', namedEffect: { type: 'fadeIn' } },
            ],
          },
        ],
      };

      const result = generate(config);

      expect(result).not.toContain('visibility: hidden');
    });

    it('should NOT generate CSS for viewEnter with type state', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [
              { effectId: 'fadeIn', triggerType: 'state', namedEffect: { type: 'fadeIn' } },
            ],
          },
        ],
      };

      const result = generate(config);

      expect(result).not.toContain('visibility: hidden');
    });

    it('should NOT generate CSS for non-viewEnter triggers', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'click',
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
          {
            key: 'my-element-2',
            trigger: 'hover',
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
        ],
      };

      const result = generate(config);

      expect(result).not.toContain('visibility: hidden');
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
              effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
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
              effects: [{ key: 'my-element', effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
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
              effects: [
                { key: 'target-element', effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } },
              ],
            },
          ],
        };

        const result = generate(config);

        expect(result).not.toContain('visibility: hidden');
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
              effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
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
              effects: [
                { selector: '.inner', effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } },
              ],
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
              effects: [
                { selector: '.target-inner', effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } },
              ],
            },
          ],
        };

        const result = generate(config);

        expect(result).not.toContain('visibility: hidden');
      });

      it('should NOT generate CSS when interaction has selector but effect does not', () => {
        const config: InteractConfig = {
          effects: {},
          interactions: [
            {
              key: 'my-element',
              trigger: 'viewEnter',
              selector: '.inner',
              effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
            },
          ],
        };

        const result = generate(config);

        expect(result).not.toContain('visibility: hidden');
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
              effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
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
              effects: [
                { listContainer: '.list', effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } },
              ],
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
              effects: [
                {
                  listContainer: '.target-list',
                  effectId: 'fadeIn',
                  namedEffect: { type: 'fadeIn' },
                },
              ],
            },
          ],
        };

        const result = generate(config);

        expect(result).not.toContain('visibility: hidden');
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
              effects: [
                {
                  listContainer: '.list',
                  listItemSelector: 'li',
                  effectId: 'fadeIn',
                  namedEffect: { type: 'fadeIn' },
                },
              ],
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
                  namedEffect: { type: 'fadeIn' },
                },
              ],
            },
          ],
        };

        const result = generate(config);

        expect(result).not.toContain('visibility: hidden');
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
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
          {
            key: 'element-2',
            trigger: 'viewEnter',
            effects: [{ effectId: 'slideIn', namedEffect: { type: 'slideIn' } }],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('[data-interact-key="element-1"]');
      expect(result).toContain('[data-interact-key="element-2"]');
    });

    it('should only generate CSS for matching effects, not all effects', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'my-element',
            trigger: 'viewEnter',
            effects: [
              { effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } },
              { key: 'other-element', effectId: 'slideIn', namedEffect: { type: 'slideIn' } },
            ],
          },
        ],
      };

      const result = generate(config);

      const matches = result.match(/visibility: hidden/g);
      expect(matches).toHaveLength(1);
    });
  });
});
