import { describe, expect, it, vi } from 'vitest';
import { generate, _generate, DEFAULT_INITIAL } from '../src/core/css';
import { createTransitionCSS } from '../src/utils';
import type { InteractConfig, CSSRuleData } from '../src/types';

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

const isAnimationProp = (name: string) => /^--animation-\d/.test(name);
const isCompositionProp = (name: string) => /^--animation-composition-/.test(name);
const isTransitionProp = (name: string) => /^--transition-/.test(name);
const isTimelineProp = (name: string) => /^--animation-timeline-/.test(name);
const isRangeProp = (name: string) => /^--animation-range-/.test(name);

function findDecl(
  declarations: CSSRuleData['declarations'],
  predicate: (d: { name: string; value: string | number }) => boolean,
) {
  return declarations.find(predicate);
}

describe('css._generate', () => {
  describe('effectToCSS - namedEffect / keyframeEffect branch', () => {
    it('should produce separate initial rule with DEFAULT_INITIAL for viewEnter + once + keyframeEffect', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                effectId: 'kf1',
                duration: 500,
                keyframeEffect: {
                  name: 'myAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const initialRule = cssRules.find((r) => r.selectorSuffix === ':not([data-interact-enter])')!;
      expect(initialRule).toBeDefined();

      DEFAULT_INITIAL.forEach(({ name, value, important }) => {
        const decl = initialRule.declarations.find((d) => d.name === name);
        expect(decl, `expected DEFAULT_INITIAL declaration: ${name}`).toBeDefined();
        expect(decl!.value).toBe(value);
        expect(decl!.important).toBe(important);
      });

      const animationRule = cssRules.find(
        (r) => r.selectorSuffix === ':not([data-interact-enter="done"])',
      )!;
      const animDeclOnInitial = findDecl(animationRule.declarations, (d) =>
        isAnimationProp(d.name),
      );
      expect(animDeclOnInitial).toBeDefined();
      expect(animDeclOnInitial!.value).toContain('myAnim');
    });

    it('should inline animation declarations when initial is false (click trigger)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 500,
                keyframeEffect: {
                  name: 'myAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(cssRules.every((r) => !r.selectorSuffix)).toBe(true);

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;
      expect(effectRule).toBeDefined();
    });

    it('should not produce an initial rule for namedEffect with non-viewEnter trigger', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [{ effectId: 'e1', duration: 300, namedEffect: { type: 'fadeIn' } }],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(cssRules.every((r) => !r.selectorSuffix)).toBe(true);
    });
  });

  describe('effectToCSS - transition branch', () => {
    it('should set transition custom prop for a transition effect', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans1',
                transition: {
                  styleProperties: [{ name: 'opacity', value: '1' }],
                  duration: 500,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRule = cssRules.find(
        (r) => !r.states && r.declarations.some((d) => isTransitionProp(d.name)),
      )!;
      expect(effectRule).toBeDefined();

      const transDecl = findDecl(effectRule.declarations, (d) => isTransitionProp(d.name));
      expect(transDecl).toBeDefined();
      expect(String(transDecl!.value)).toContain('opacity');
      expect(String(transDecl!.value)).toContain('500ms');
    });

    it('should produce a state rule with direct declarations for transition', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans1',
                transition: {
                  styleProperties: [{ name: 'opacity', value: '1' }],
                  duration: 500,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const stateRule = cssRules.find((r) => r.states?.includes('trans1'))!;
      expect(stateRule).toBeDefined();

      const opacityDecl = stateRule.declarations.find((d) => d.name === 'opacity');
      expect(opacityDecl).toBeDefined();
      expect(opacityDecl!.value).toBe('1');
    });

    it('should produce a state rule for transitionProperties (alternative syntax)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans2',
                transitionProperties: [{ name: 'color', value: 'red', duration: 300 }],
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const stateRule = cssRules.find((r) => r.states?.includes('trans2'))!;
      expect(stateRule).toBeDefined();

      const colorDecl = stateRule.declarations.find((d) => d.name === 'color');
      expect(colorDecl).toBeDefined();
      expect(colorDecl!.value).toBe('red');
    });
  });

  describe('effectToCSS - viewProgress (scroll-driven) branch', () => {
    it('should set animation-timeline and animation-range custom props for viewProgress keyframeEffect', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;
      expect(effectRule).toBeDefined();

      const timelineDecl = findDecl(effectRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(String(timelineDecl!.value)).toContain('--trigger-0');

      const rangeDecl = findDecl(effectRule.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl).toBeDefined();
      expect(String(rangeDecl!.value)).toContain('entry');
      expect(String(rangeDecl!.value)).toContain('exit');
    });

    it('should not produce an initial rule for viewProgress trigger', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(cssRules.every((r) => !r.selectorSuffix)).toBe(true);
    });

    it('should emit auto duration in animation shorthand for viewProgress (SSR-safe)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('parallax auto');
      expect(result).not.toContain('99.99ms');
    });

    it('should include timeline and range in coordinated list when viewProgress and click target same element', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const coordListRule = cssRules.find(
        (r) =>
          r.declarations.some((d) => d.name === 'animation-timeline') &&
          String(r.declarations.find((d) => d.name === 'animation-timeline')?.value).includes(
            '), var(',
          ),
      );
      expect(coordListRule).toBeDefined();

      const rangeListDecl = coordListRule!.declarations.find((d) => d.name === 'animation-range');
      expect(rangeListDecl).toBeDefined();
      expect(String(rangeListDecl!.value)).toContain('), var(');
    });

    it('should set timeline to none and range to normal for non-viewProgress keyframeEffect', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;

      const timelineDecl = findDecl(effectRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl!.value).toBe('auto');

      const rangeDecl = findDecl(effectRule.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl!.value).toBe('normal');
    });

    it('should include timeline and range custom props on initial rule for viewEnter', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                effectId: 'kf1',
                duration: 500,
                keyframeEffect: {
                  name: 'myAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const initialRule = cssRules.find(
        (r) => r.selectorSuffix === ':not([data-interact-enter="done"])',
      )!;
      expect(initialRule).toBeDefined();

      const timelineDecl = findDecl(initialRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('auto');

      const rangeDecl = findDecl(initialRule.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl).toBeDefined();
      expect(rangeDecl!.value).toBe('normal');
    });

    it('should produce a view-timeline rule for viewProgress trigger', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const viewTimelineRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      );
      expect(viewTimelineRule).toBeDefined();
      expect(viewTimelineRule!.declarations.find((d) => d.name === 'view-timeline')!.value).toBe(
        '--trigger-0',
      );
    });

    it('should use matching ids between view-timeline and animation-timeline for viewProgress', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                effectId: 'scroll1',
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const viewTimelineRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      )!;
      const triggerId = viewTimelineRule.declarations.find(
        (d) => d.name === 'view-timeline',
      )!.value;

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isTimelineProp(d.name)))!;
      const timelineValue = String(
        effectRule.declarations.find((d) => isTimelineProp(d.name))!.value,
      );
      expect(timelineValue).toContain(triggerId);
    });

    it('should not produce a view-timeline rule for non-viewProgress triggers', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const viewTimelineRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      );
      expect(viewTimelineRule).toBeUndefined();
    });

    it('should propagate conditions to view-timeline rule for viewProgress', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            conditions: ['desktop'],
            effects: [
              {
                effectId: 'scroll1',
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [
                    { transform: 'translateY(50px)' },
                    { transform: 'translateY(-50px)' },
                  ],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const viewTimelineRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      )!;
      expect(viewTimelineRule).toBeDefined();
      expect(viewTimelineRule.media).toContain('min-width: 1024px');
    });
  });

  describe('effectToCSS - no effect property', () => {
    it('should set all custom properties to off values when effect has no animation or transition', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ effectId: 'empty1' }],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRule = cssRules.find(
        (r) =>
          r.declarations.some((d) => isAnimationProp(d.name) && d.value === 'none') &&
          r.declarations.some((d) => isCompositionProp(d.name) && d.value === 'replace'),
      );
      expect(effectRule).toBeDefined();

      const timelineDecl = findDecl(effectRule!.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('auto');

      const rangeDecl = findDecl(effectRule!.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl).toBeDefined();
      expect(rangeDecl!.value).toBe('normal');
    });

    it('should produce no keyframes for an effect with no animation', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ effectId: 'empty1' }],
          },
        ],
      };

      const result = generate(config);

      expect(result).not.toContain('@keyframes');
    });
  });

  describe('conditions flowing through to rules', () => {
    it('should set media on rules when effect has a media condition', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                conditions: ['desktop'],
                keyframeEffect: {
                  name: 'fadeAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;

      expect(effectRule.media).toContain('min-width: 1024px');
    });

    it('should set selectorCondition on rules when effect has a selector condition', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          visible: { type: 'selector', predicate: '.is-visible' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                conditions: ['visible'],
                keyframeEffect: {
                  name: 'fadeAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;

      expect(effectRule.selectorCondition).toContain('.is-visible');
    });

    it('should set both media and selectorCondition when both condition types are present', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
          visible: { type: 'selector', predicate: '.is-visible' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                conditions: ['desktop', 'visible'],
                keyframeEffect: {
                  name: 'fadeAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;

      expect(effectRule.media).toContain('min-width: 1024px');
      expect(effectRule.selectorCondition).toContain('.is-visible');
    });

    it('should propagate media condition to the state rule for transitions', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans1',
                conditions: ['desktop'],
                transition: {
                  styleProperties: [{ name: 'opacity', value: '1' }],
                  duration: 500,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const stateRule = cssRules.find((r) => r.states?.includes('trans1'))!;

      expect(stateRule.media).toContain('min-width: 1024px');
    });

    it('should propagate conditions to the initial rule for viewEnter + once', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                conditions: ['desktop'],
                keyframeEffect: {
                  name: 'fadeAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const initialRule = cssRules.find((r) => r.selectorSuffix)!;

      expect(initialRule).toBeDefined();
      expect(initialRule.media).toContain('min-width: 1024px');
    });
  });

  describe('sequences', () => {
    it('should produce unique custom prop names per effect in a sequence', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  {
                    effectId: 'kf1',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim1',
                      keyframes: [{ opacity: '0' }, { opacity: '1' }],
                    },
                  },
                  {
                    effectId: 'kf2',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim2',
                      keyframes: [{ opacity: '1' }, { opacity: '0' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const animRules = cssRules.filter(
        (r) =>
          r.declarations.some((d) => isAnimationProp(d.name)) &&
          !r.declarations.some((d) => String(d.value).includes('var(')) &&
          // reduced motion re-declares an effect's own prop; uniqueness is about base declarations
          !r.media?.includes('prefers-reduced-motion'),
      );
      expect(animRules.length).toBeGreaterThanOrEqual(2);

      const animPropNames = animRules.flatMap((r) =>
        r.declarations.filter((d) => isAnimationProp(d.name)).map((d) => d.name),
      );
      const uniqueNames = new Set(animPropNames);
      expect(uniqueNames.size).toBe(animPropNames.length);

      const timelinePropNames = animRules.flatMap((r) =>
        r.declarations.filter((d) => isTimelineProp(d.name)).map((d) => d.name),
      );
      expect(new Set(timelinePropNames).size).toBe(timelinePropNames.length);

      const rangePropNames = animRules.flatMap((r) =>
        r.declarations.filter((d) => isRangeProp(d.name)).map((d) => d.name),
      );
      expect(new Set(rangePropNames).size).toBe(rangePropNames.length);
    });

    it('should add a coordinated-list rule per target in a sequence', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  {
                    effectId: 'kf1',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim1',
                      keyframes: [{ opacity: '0' }, { opacity: '1' }],
                    },
                  },
                  {
                    effectId: 'kf2',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim2',
                      keyframes: [{ opacity: '1' }, { opacity: '0' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const seqCoordListRule = cssRules.find((r) =>
        r.declarations.some((d) => isAnimationProp(d.name) && String(d.value).includes('var(')),
      );
      expect(seqCoordListRule).toBeDefined();

      const timelineDecl = seqCoordListRule!.declarations.find(
        (d) => isTimelineProp(d.name) && String(d.value).includes('var('),
      );
      expect(timelineDecl).toBeDefined();

      const rangeDecl = seqCoordListRule!.declarations.find(
        (d) => isRangeProp(d.name) && String(d.value).includes('var('),
      );
      expect(rangeDecl).toBeDefined();
    });

    it('should apply sequence-level conditions to the coordinated-list rule', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 1024px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                conditions: ['desktop'],
                effects: [
                  {
                    effectId: 'kf1',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim1',
                      keyframes: [{ opacity: '0' }, { opacity: '1' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const seqListRules = cssRules.filter(
        (r) =>
          r.declarations.some((d) => String(d.value).includes('var(')) &&
          r.declarations.some(
            (d) => isAnimationProp(d.name) || isCompositionProp(d.name) || isTransitionProp(d.name),
          ),
      );
      const conditionedRule = seqListRules.find((r) => r.media);
      expect(conditionedRule).toBeDefined();
      expect(conditionedRule!.media).toContain('min-width: 1024px');
    });
  });

  describe('cross-interaction coordinated lists', () => {
    it('should produce coordinated list with two custom properties when two interactions target the same element', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                effectId: 'kf2',
                duration: 300,
                keyframeEffect: {
                  name: 'anim2',
                  keyframes: [{ opacity: '1' }, { opacity: '0' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const coordListRule = cssRules.find(
        (r) =>
          r.declarations.some((d) => d.name === 'animation') &&
          String(r.declarations.find((d) => d.name === 'animation')?.value).includes('), var('),
      );
      expect(coordListRule).toBeDefined();

      const timelineDecl = coordListRule!.declarations.find((d) => d.name === 'animation-timeline');
      expect(timelineDecl).toBeDefined();
      expect(String(timelineDecl!.value)).toContain('), var(');

      const rangeDecl = coordListRule!.declarations.find((d) => d.name === 'animation-range');
      expect(rangeDecl).toBeDefined();
      expect(String(rangeDecl!.value)).toContain('), var(');
    });

    it('should produce separate coordinated-list rules for different targets', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el-a',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
          {
            key: 'el-b',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf2',
                duration: 300,
                keyframeEffect: {
                  name: 'anim2',
                  keyframes: [{ opacity: '1' }, { opacity: '0' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const coordListRules = cssRules.filter(
        (r) =>
          r.declarations.some((d) => d.name === 'animation') &&
          String(r.declarations.find((d) => d.name === 'animation')?.value).includes('var('),
      );
      expect(coordListRules.length).toBe(2);

      const keys = coordListRules.map((r) => r.key);
      expect(keys).toContain('el-a');
      expect(keys).toContain('el-b');
    });
  });

  describe('_generate endpoint edge cases', () => {
    it('should return empty cssRules for empty interactions array', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [],
      };

      const { cssRules, keyframes } = _generate(config);

      expect(cssRules).toEqual([]);
      expect(keyframes).toEqual(new Map<string, Keyframe[]>());
    });

    it('should produce no rules for interaction with empty effects and sequences', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [],
            sequences: [],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(cssRules).toEqual([]);
    });

    it('should use > :first-child child selector when useFirstChild is true (default)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ effectId: 'e1' }],
          },
        ],
      };

      const { cssRules } = _generate(config, true);

      const ruleWithChild = cssRules.find((r) => r.childSelector === '> :first-child');
      expect(ruleWithChild).toBeDefined();
    });

    it('should not use > :first-child child selector when useFirstChild is false', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ effectId: 'e1' }],
          },
        ],
      };

      const { cssRules } = _generate(config, false);

      const ruleWithFirstChild = cssRules.find((r) => r.childSelector === '> :first-child');
      expect(ruleWithFirstChild).toBeUndefined();
    });

    it('should include rules from both effects and sequences in the same interaction', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'directAnim',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
            sequences: [
              {
                effects: [
                  {
                    effectId: 'kf2',
                    duration: 300,
                    keyframeEffect: {
                      name: 'seqAnim',
                      keyframes: [{ opacity: '1' }, { opacity: '0' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = generate(config);

      expect(result).toContain('directAnim');
      expect(result).toContain('seqAnim');
    });

    it('should use same custom prop names for multiple effects on the same target in one interaction (cascade override)', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'anim1',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
              {
                effectId: 'kf2',
                duration: 300,
                keyframeEffect: {
                  name: 'anim2',
                  keyframes: [{ opacity: '1' }, { opacity: '0' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRules = cssRules.filter((r) =>
        r.declarations.some((d) => isAnimationProp(d.name)),
      );
      expect(effectRules.length).toBeGreaterThanOrEqual(2);

      const animPropNames = effectRules.map(
        (r) => r.declarations.find((d) => isAnimationProp(d.name))!.name,
      );
      expect(new Set(animPropNames).size).toBe(1);

      const coordListRules = cssRules.filter(
        (r) =>
          r.declarations.some((d) => d.name === 'animation') &&
          String(r.declarations.find((d) => d.name === 'animation')?.value).includes('var('),
      );
      expect(coordListRules).toHaveLength(1);
    });
  });

  describe('options argument', () => {
    const config: InteractConfig = {
      effects: {},
      interactions: [
        {
          key: 'el',
          trigger: 'click',
          effects: [{ effectId: 'e1' }],
        },
      ],
    };

    it('should default useFirstChild to true when no options are passed', () => {
      const { cssRules } = _generate(config);

      expect(cssRules.find((r) => r.childSelector === '> :first-child')).toBeDefined();
    });

    it('should treat a boolean options argument as the legacy useFirstChild', () => {
      expect(
        _generate(config, false).cssRules.find((r) => r.childSelector === '> :first-child'),
      ).toBeUndefined();
      expect(
        _generate(config, true).cssRules.find((r) => r.childSelector === '> :first-child'),
      ).toBeDefined();
    });

    it('should read useFirstChild from an options object', () => {
      expect(
        _generate(config, { useFirstChild: false }).cssRules.find(
          (r) => r.childSelector === '> :first-child',
        ),
      ).toBeUndefined();
      expect(
        _generate(config, { useFirstChild: true }).cssRules.find(
          (r) => r.childSelector === '> :first-child',
        ),
      ).toBeDefined();
    });

    it('should default useFirstChild to true when the options object omits it', () => {
      const { cssRules } = _generate(config, { plugins: {} });

      expect(cssRules.find((r) => r.childSelector === '> :first-child')).toBeDefined();
    });
  });

  describe('plugin styles (generate `plugins` option)', () => {
    it('appends CSS from an interaction-level $-field generator, without inspecting the value', () => {
      const calls: Array<{ value: unknown; ctx: any }> = [];
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            $splitText: { container: '.title', type: 'chars' },
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
        ],
      };

      const result = generate(config, {
        plugins: {
          splitText: (value, ctx) => {
            calls.push({ value, ctx });
            const { container } = value as { container: string };
            return [
              {
                declarations: [{ name: 'visibility', value: 'hidden' }],
                selectorSuffix: ` ${container}`,
              },
            ];
          },
        },
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].value).toEqual({ container: '.title', type: 'chars' });
      expect(calls[0].ctx.key).toBe('hero');
      expect(calls[0].ctx.scope).toBe('interaction');
      expect(result).toContain('[data-interact-key="hero"] .title {\nvisibility: hidden;\n}');
    });

    it('does nothing when no plugins option is passed', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            $splitText: { container: '.title' },
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
        ],
      };

      expect(() => generate(config)).not.toThrow();
      expect(generate(config)).not.toContain('.title');
    });

    it('skips $-fields with no matching generator', () => {
      const splitText = vi.fn(() => [
        {
          declarations: [{ name: 'name', value: 'value' }],
          selectorSuffix: '.x',
        },
      ]);
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            $unknownPlugin: { foo: 1 },
            effects: [{ effectId: 'fadeIn', namedEffect: { type: 'fadeIn' } }],
          },
        ],
      };

      const result = generate(config, { plugins: { splitText } });
      expect(splitText).not.toHaveBeenCalled();
      expect(result).not.toContain('.x {');
    });

    it('routes effect-level $-fields with the resolved target key and effect scope', () => {
      const seen: Array<{ key: string; scope: string }> = [];
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'source',
            trigger: 'viewEnter',
            effects: [
              {
                key: 'target',
                $splitText: { container: '.h' },
                effectId: 'fadeIn',
                namedEffect: { type: 'fadeIn' },
              },
            ],
          },
        ],
      };

      generate(config, {
        plugins: {
          splitText: (_value, ctx) => {
            seen.push({ key: ctx.key, scope: ctx.scope });
            return [];
          },
        },
      });

      expect(seen).toContainEqual({
        key: 'target',
        scope: 'effect',
      });
    });
  });

  describe('initial rule conditions', () => {
    const entranceEffect = {
      effectId: 'kf1',
      triggerType: 'once' as const,
      duration: 500,
      keyframeEffect: { name: 'enterAnim', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
    };
    const initialRuleOf = (cssRules: CSSRuleData[]) =>
      cssRules.find((r) => r.selectorSuffix === ':not([data-interact-enter])')!;

    it('should gate the hiding rule on the interaction conditions', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: { desktop: { type: 'media', predicate: 'min-width: 900px' } },
        interactions: [
          { key: 'el', trigger: 'viewEnter', conditions: ['desktop'], effects: [entranceEffect] },
        ],
      };

      const { cssRules } = _generate(config);

      expect(initialRuleOf(cssRules).media).toBe('(min-width: 900px)');
    });

    it('should compose interaction and effect conditions into the hiding rule', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: {
          desktop: { type: 'media', predicate: 'min-width: 900px' },
          wide: { type: 'media', predicate: 'min-width: 1200px' },
        },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            conditions: ['desktop'],
            effects: [{ ...entranceEffect, conditions: ['wide'] }],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(initialRuleOf(cssRules).media).toContain('(min-width: 900px)');
      expect(initialRuleOf(cssRules).media).toContain('(min-width: 1200px)');
    });

    it('should carry an interaction selector condition into the hiding rule', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: { dark: { type: 'selector', predicate: '.dark' } },
        interactions: [
          { key: 'el', trigger: 'viewEnter', conditions: ['dark'], effects: [entranceEffect] },
        ],
      };

      const { cssRules } = _generate(config);

      expect(initialRuleOf(cssRules).selectorCondition).toBe(':is(.dark)');
    });

    it('should leave the hiding rule unconditional when nothing is gated', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [{ key: 'el', trigger: 'viewEnter', effects: [entranceEffect] }],
      };

      const { cssRules } = _generate(config);
      const initialRule = initialRuleOf(cssRules);

      expect(initialRule.media).toBeFalsy();
      expect(initialRule.selectorCondition).toBeFalsy();
    });
  });

  describe('reduced motion', () => {
    const REDUCE = '(prefers-reduced-motion: reduce)';
    const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)';
    const MOTION_CONDITIONS = {
      'motion-ok': { type: 'media' as const, predicate: 'prefers-reduced-motion: no-preference' },
      'motion-reduced': { type: 'media' as const, predicate: 'prefers-reduced-motion: reduce' },
    };
    const keyframeEffect = (name: string) => ({
      name,
      keyframes: [{ opacity: '0' }, { opacity: '1' }],
    });
    const collapseRulesOf = (cssRules: CSSRuleData[]) =>
      cssRules.filter(
        (r) =>
          r.media?.includes(REDUCE) &&
          r.declarations.length === 1 &&
          isAnimationProp(r.declarations[0].name) &&
          String(r.declarations[0].value).includes(' 1ms '),
      );

    it('should collapse each effect through its own custom property, after it is declared', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              { effectId: 'kf1', duration: 500, delay: 200, keyframeEffect: keyframeEffect('a') },
            ],
          },
          {
            key: 'el',
            trigger: 'hover',
            effects: [{ effectId: 'kf2', duration: 500, keyframeEffect: keyframeEffect('b') }],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const reduceRules = collapseRulesOf(cssRules);

      // one per effect, each touching only its own animation custom property
      expect(reduceRules).toHaveLength(2);
      const names = reduceRules.flatMap((r) => r.declarations.map((d) => d.name));
      expect(names.every(isAnimationProp)).toBe(true);
      expect(new Set(names).size).toBe(2);

      // each override must follow the declaration it overrides
      reduceRules.forEach((reduceRule) => {
        const propName = reduceRule.declarations[0].name;
        const baseIdx = cssRules.findIndex(
          (r) => r !== reduceRule && r.declarations.some((d) => d.name === propName),
        );
        expect(cssRules.indexOf(reduceRule)).toBeGreaterThan(baseIdx);
      });
    });

    it('should leave an author-gated effect alone while still collapsing its ungated neighbour', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: MOTION_CONDITIONS,
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            conditions: ['motion-reduced'],
            effects: [{ effectId: 'calm', duration: 300, keyframeEffect: keyframeEffect('calm') }],
          },
          {
            key: 'el',
            trigger: 'hover',
            effects: [{ effectId: 'big', duration: 800, keyframeEffect: keyframeEffect('big') }],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const reduceRules = collapseRulesOf(cssRules);

      // only the ungated neighbour is collapsed
      const collapsed = reduceRules.filter((r) => r.media === REDUCE);
      expect(collapsed).toHaveLength(1);
      expect(String(collapsed[0].declarations[0].value)).toContain('big');

      // the gated effect keeps its authored 300ms, declared under its own condition
      const calmDecl = cssRules
        .flatMap((r) => r.declarations)
        .filter((d) => isAnimationProp(d.name))
        .find((d) => String(d.value).includes('calm'))!;
      expect(String(calmDecl.value)).toContain('300ms');
      expect(cssRules.some((r) => r.declarations.includes(calmDecl) && r.media === REDUCE)).toBe(
        false,
      );
    });

    it('should collapse to a single 1ms iteration while preserving name and fill', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                duration: 500,
                delay: 200,
                iterations: 0,
                fill: 'both',
                keyframeEffect: keyframeEffect('ongoingAnim'),
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const value = String(collapseRulesOf(cssRules)[0].declarations[0].value);

      expect(value).toContain('ongoingAnim');
      expect(value).toContain('1ms');
      expect(value).toContain('0ms');
      expect(value).not.toContain('infinite');
      expect(value).toContain('both');
      expect(value).not.toContain('500ms');
      expect(value).not.toContain('200ms');
    });

    it('should compose an ungated effect conditions into the reduce query', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: { desktop: { type: 'media', predicate: 'min-width: 900px' } },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                conditions: ['desktop'],
                duration: 500,
                keyframeEffect: keyframeEffect('a'),
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(collapseRulesOf(cssRules)[0].media).toContain(`(min-width: 900px)`);
      expect(collapseRulesOf(cssRules)[0].media).toContain(REDUCE);
    });

    it('should treat an effect-level motion condition as author-gating', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: MOTION_CONDITIONS,
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'kf1',
                conditions: ['motion-reduced'],
                duration: 300,
                keyframeEffect: keyframeEffect('calm'),
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(collapseRulesOf(cssRules)).toHaveLength(0);
    });

    it('should cancel a scrub at the source even when the author gated it on reduce', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: MOTION_CONDITIONS,
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            conditions: ['motion-reduced'],
            effects: [{ effectId: 'kf1', keyframeEffect: keyframeEffect('scrollAnim') }],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const triggerRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      )!;

      // parity with the runtime handler, which early-returns under `reduce` whatever the
      // interaction's conditions say — so this timeline is declared under a query that never matches
      expect(triggerRule.media).toContain(NO_PREFERENCE);
      expect(triggerRule.media).toContain(REDUCE);
      // and a scrub is never collapsed, since there is no meaningful collapse of a scrubbed timeline
      expect(collapseRulesOf(cssRules)).toHaveLength(0);
    });

    it('should gate the scroll-driven timeline on no-preference, leaving timelines untouched', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: { desktop: { type: 'media', predicate: 'min-width: 900px' } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            conditions: ['desktop'],
            effects: [{ effectId: 'kf1', keyframeEffect: keyframeEffect('scrollAnim') }],
          },
          {
            key: 'el',
            trigger: 'click',
            effects: [
              { effectId: 'kf2', duration: 500, keyframeEffect: keyframeEffect('clickAnim') },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const triggerRule = cssRules.find((r) =>
        r.declarations.some((d) => d.name === 'view-timeline'),
      )!;

      // with no `view-timeline` to resolve, the scroll-driven animation has no timeline at all
      expect(triggerRule.media).toBe(`(min-width: 900px) and ${NO_PREFERENCE}`);
      // the click effect sharing the target is still collapsed, and touches no timeline
      const reduceRules = collapseRulesOf(cssRules);
      expect(reduceRules).toHaveLength(1);
      expect(String(reduceRules[0].declarations[0].value)).toContain('clickAnim');
      expect(reduceRules[0].declarations.every((d) => !isTimelineProp(d.name))).toBe(true);
    });

    it('should gate a state effect transition on no-preference, composing its conditions', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: { desktop: { type: 'media', predicate: 'min-width: 900px' } },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans1',
                conditions: ['desktop'],
                transition: {
                  styleProperties: [{ name: 'opacity', value: '1' }],
                  duration: 500,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const transitionRule = cssRules.find((r) =>
        r.declarations.some((d) => isTransitionProp(d.name)),
      )!;
      const stateRule = cssRules.find((r) => r.states?.includes('trans1'))!;

      expect(transitionRule.media).toBe(`(min-width: 900px) and ${NO_PREFERENCE}`);
      expect(cssRules.some((r) => r.media?.includes(REDUCE))).toBe(false);
      expect(stateRule.media).toBe('(min-width: 900px)');
      expect(stateRule.declarations).toEqual([{ name: 'opacity', value: '1' }]);
    });

    it('should let a reduce-gated state effect keep its transition', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: MOTION_CONDITIONS,
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                effectId: 'trans1',
                conditions: ['motion-reduced'],
                transition: {
                  styleProperties: [{ name: 'opacity', value: '1' }],
                  duration: 200,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const transitionRule = cssRules.find((r) =>
        r.declarations.some((d) => isTransitionProp(d.name)),
      )!;

      // unlike a scrub, a state effect the author scoped to `reduce` is theirs to define
      expect(transitionRule.media).toBe(REDUCE);
      expect(String(transitionRule.declarations[0].value)).toContain('200ms');
    });

    it('should never suppress an animation that owns an initial rule', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                effectId: 'kf1',
                triggerType: 'once',
                duration: 800,
                delay: 100,
                iterations: 2,
                keyframeEffect: keyframeEffect('enterAnim'),
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const initialRule = cssRules.find((r) => r.selectorSuffix === ':not([data-interact-enter])')!;
      const reduceRule = collapseRulesOf(cssRules)[0];

      // the rule that hides the element must stay unconditional, so nothing may drop the
      // animation that lets `data-interact-enter` reach `done`
      expect(initialRule.media).toBeFalsy();
      expect(reduceRule).toBeDefined();
      // and it must carry the same suffix as the declaration it overrides, or it never applies
      expect(reduceRule.selectorSuffix).toBe(':not([data-interact-enter="done"])');
      expect(String(reduceRule.declarations[0].value)).toContain('enterAnim');
      expect(
        cssRules.some((r) =>
          r.declarations.some(
            (d) => (d.name === 'animation-name' || isAnimationProp(d.name)) && d.value === 'none',
          ),
        ),
      ).toBe(false);
    });

    it('should not strand an element whose entrance is gated at the interaction level', () => {
      const config: InteractConfig = {
        effects: {},
        conditions: MOTION_CONDITIONS,
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            conditions: ['motion-reduced'],
            effects: [
              {
                effectId: 'calm',
                triggerType: 'once',
                duration: 300,
                keyframeEffect: keyframeEffect('calm'),
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const initialRule = cssRules.find((r) => r.selectorSuffix === ':not([data-interact-enter])')!;

      // under no-preference this interaction never binds, so an unconditional hiding rule would
      // leave the element invisible forever — the exact shape Phase 2.2 asks authors to write
      expect(initialRule.media).toBe(REDUCE);
    });

    it('should gate the runtime transition path the same way', () => {
      const result = createTransitionCSS({
        key: 'el',
        effectId: 'trans1',
        transition: { styleProperties: [{ name: 'opacity', value: '1' }], duration: 200 },
      }).join('\n');

      expect(result).toContain(`@media ${NO_PREFERENCE}`);
      expect(result).toContain('transition: opacity 200ms ease;');
      expect(result).not.toContain('transition: none');
    });
  });
});
