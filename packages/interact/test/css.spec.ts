import { describe, expect, it, vi } from 'vitest';
import { generate, _generate, DEFAULT_INITIAL } from '../src/core/css';
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

const isAnimationProp = (name: string) => /^--anm-(slot-)?\d/.test(name);
const isCompositionProp = (name: string) => /^--anm-cmps-(slot-)?\d/.test(name);
const isTransitionProp = (name: string) => /^--trns-(slot-)?\d/.test(name);
const isTimelineProp = (name: string) => /^--anm-tmln-(slot-)?\d/.test(name);
const isRangeProp = (name: string) => /^--anm-rng-(slot-)?\d/.test(name);

function parseListsRule(listsRule: string) {
  const [, selector = '', body = ''] = listsRule.match(/^([^{]+)\{([\s\S]*)\}$/) || [];

  return {
    selectors: selector.trim().split(', ').filter(Boolean),
    declarations: body
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => ({
        name: declaration.slice(0, declaration.indexOf(':')).trim(),
        value: declaration.slice(declaration.indexOf(':') + 1).trim(),
      })),
  };
}

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

      const { listsRule } = _generate(config);
      const { declarations } = parseListsRule(listsRule);

      const timelineListDecl = declarations.find((d) => d.name === 'animation-timeline');
      expect(timelineListDecl).toBeDefined();
      expect(timelineListDecl!.value).toBe('var(--anm-tmln-0), var(--anm-tmln-1)');

      const rangeListDecl = declarations.find((d) => d.name === 'animation-range');
      expect(rangeListDecl).toBeDefined();
      expect(rangeListDecl!.value).toBe('var(--anm-rng-0), var(--anm-rng-1)');
    });

    it('should leave timeline and range at their @property defaults for non-viewProgress keyframeEffect', () => {
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

      const { cssRules, atProperty } = _generate(config);

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;

      expect(findDecl(effectRule.declarations, (d) => isTimelineProp(d.name))).toBeUndefined();
      expect(findDecl(effectRule.declarations, (d) => isRangeProp(d.name))).toBeUndefined();

      expect(atProperty).toContain(
        '@property --anm-tmln-0 { syntax: "*"; inherits: false; initial-value: auto; }',
      );
      expect(atProperty).toContain(
        '@property --anm-rng-0 { syntax: "*"; inherits: false; initial-value: normal; }',
      );
    });

    it('should keep the animation slot on the initial rule for viewEnter, with timeline and range left to @property', () => {
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

      const { cssRules, atProperty } = _generate(config);

      const initialRule = cssRules.find(
        (r) => r.selectorSuffix === ':not([data-interact-enter="done"])',
      )!;
      expect(initialRule).toBeDefined();

      expect(findDecl(initialRule.declarations, (d) => isAnimationProp(d.name))).toBeDefined();
      expect(findDecl(initialRule.declarations, (d) => isTimelineProp(d.name))).toBeUndefined();
      expect(findDecl(initialRule.declarations, (d) => isRangeProp(d.name))).toBeUndefined();

      expect(atProperty).toContain(
        '@property --anm-tmln-0 { syntax: "*"; inherits: false; initial-value: auto; }',
      );
      expect(atProperty).toContain(
        '@property --anm-rng-0 { syntax: "*"; inherits: false; initial-value: normal; }',
      );
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
    it('should emit nothing when the effect has no animation or transition and nothing set the slots', () => {
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

      expect(_generate(config).cssRules).toEqual([]);
      expect(generate(config)).toBe('');
    });

    it('should reset only the slots a previous effect on the same target set to a non-default', () => {
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
              { effectId: 'empty1' },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const offRule = cssRules.find((r) =>
        r.declarations.some((d) => isAnimationProp(d.name) && d.value === 'none'),
      );
      expect(offRule).toBeDefined();

      expect(findDecl(offRule!.declarations, (d) => isCompositionProp(d.name))).toBeUndefined();
      expect(findDecl(offRule!.declarations, (d) => isTimelineProp(d.name))).toBeUndefined();
      expect(findDecl(offRule!.declarations, (d) => isRangeProp(d.name))).toBeUndefined();
    });

    it('should not reset a slot an earlier interaction set, since the later interaction gets its own slot', () => {
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
            effects: [{ effectId: 'empty1' }],
          },
        ],
      };

      const { cssRules } = _generate(config);

      expect(
        cssRules.some((r) =>
          r.declarations.some((d) => isAnimationProp(d.name) && d.value !== 'none'),
        ),
      ).toBe(true);
      expect(
        cssRules.some((r) =>
          r.declarations.some((d) => isAnimationProp(d.name) && d.value === 'none'),
        ),
      ).toBe(false);
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
          !r.declarations.some((d) => String(d.value).includes('var(')),
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

    it('should write the interaction custom property directly when a sequence target takes a single slot', () => {
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
                ],
              },
            ],
          },
        ],
      };

      const { cssRules, atProperty } = _generate(config);

      const animDecls = cssRules
        .flatMap((r) => r.declarations)
        .filter((d) => isAnimationProp(d.name));
      expect(animDecls.map((d) => d.name)).toContain('--anm-0');
      expect(animDecls.some((d) => d.name.includes('-slot-'))).toBe(false);
      expect(animDecls.some((d) => String(d.value).includes('var('))).toBe(false);
      expect(atProperty.some((rule) => rule.includes('-slot-'))).toBe(false);
    });

    it('should write the transition custom property directly for a single-effect sequence', () => {
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
                    effectId: 'trans1',
                    transition: {
                      styleProperties: [{ name: 'opacity', value: '1' }],
                      duration: 500,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { cssRules, atProperty } = _generate(config);

      const transDecls = cssRules
        .flatMap((r) => r.declarations)
        .filter((d) => isTransitionProp(d.name));
      expect(transDecls.map((d) => d.name)).toEqual(['--trns-0']);
      expect(String(transDecls[0].value)).toContain('opacity');
      expect(atProperty.some((rule) => rule.includes('-slot-'))).toBe(false);
    });

    it('should only use slots for the targets that repeat within the sequence', () => {
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
                    key: 'repeated',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim1',
                      keyframes: [{ opacity: '0' }, { opacity: '1' }],
                    },
                  },
                  {
                    effectId: 'kf2',
                    key: 'repeated',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim2',
                      keyframes: [{ opacity: '1' }, { opacity: '0' }],
                    },
                  },
                  {
                    effectId: 'kf3',
                    key: 'single',
                    duration: 300,
                    keyframeEffect: {
                      name: 'anim3',
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

      const animPropsByKey = (key: string) =>
        cssRules
          .filter((r) => r.key === key)
          .flatMap((r) => r.declarations)
          .filter((d) => isAnimationProp(d.name));

      const repeated = animPropsByKey('repeated');
      expect(repeated.filter((d) => d.name === '--anm-slot-0')).toHaveLength(1);
      expect(repeated.filter((d) => d.name === '--anm-slot-1')).toHaveLength(1);
      expect(repeated.find((d) => d.name === '--anm-0')!.value).toBe(
        'var(--anm-slot-0), var(--anm-slot-1)',
      );

      const single = animPropsByKey('single');
      expect(single.some((d) => d.name.includes('-slot-'))).toBe(false);
      expect(single.find((d) => d.name === '--anm-0')).toBeDefined();
    });

    describe('staggered delay', () => {
      const staggerConfig = (
        sequence: Partial<InteractConfig['interactions'][number]['sequences']>[number] = {},
      ): InteractConfig => ({
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                offset: 120,
                ...sequence,
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
              } as any,
            ],
          },
        ],
      });

      const animationValue = (config: InteractConfig) => {
        const { cssRules } = _generate(config);

        return cssRules
          .flatMap((r) => r.declarations)
          .filter((d) => isAnimationProp(d.name) && !String(d.value).includes('var(--anm'))
          .map((d) => String(d.value))
          .join('\n');
      };

      it('should express the stagger as a calc() over the sequence index custom properties', () => {
        const value = animationValue(staggerConfig());

        expect(value).toContain('calc(');
        expect(value).toContain('var(--motion-seq-0-0-index, 0)');
        expect(value).toContain('var(--motion-seq-0-0-last, 1)');
      });

      it('should derive the sequence id from the config position so the runtime matches', () => {
        const config = staggerConfig();
        const second = staggerConfig().interactions[0];
        second.key = 'el2';
        config.interactions.push(second);

        const value = animationValue(config);

        expect(value).toContain('--motion-seq-0-0-index');
        expect(value).toContain('--motion-seq-1-0-index');
      });

      it('should honour an explicit sequenceId', () => {
        expect(animationValue(staggerConfig({ sequenceId: 'my-seq' }))).toContain(
          'var(--motion-my-seq-index, 0)',
        );
      });

      it('should fold the sequence delay into the calc() base', () => {
        expect(animationValue(staggerConfig({ delay: 40 }))).toContain('calc((40 +');
      });

      it('should apply the offsetEasing inside the calc()', () => {
        const ratio = '(var(--motion-seq-0-0-index, 0) / var(--motion-seq-0-0-last, 1))';

        expect(animationValue(staggerConfig({ offsetEasing: 'quadIn' }))).toContain(
          `${ratio} * ${ratio}`,
        );
      });

      it('should emit a plain delay when the sequence has no offset', () => {
        const value = animationValue(staggerConfig({ offset: 0, delay: 40 }));

        expect(value).not.toContain('calc(');
        expect(value).toContain('40ms');
      });

      it('should skip a sequence whose offsetEasing is a function', () => {
        const { cssRules } = _generate(staggerConfig({ offsetEasing: (p: number) => p ** 2 }));

        expect(
          cssRules.flatMap((r) => r.declarations).filter((d) => isAnimationProp(d.name)),
        ).toHaveLength(0);
      });
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

      const { listsRule } = _generate(config);
      const { selectors, declarations } = parseListsRule(listsRule);

      expect(selectors).toEqual(['[data-interact-key="el"] > :first-child']);

      const animationDecl = declarations.find((d) => d.name === 'animation');
      expect(animationDecl).toBeDefined();
      expect(animationDecl!.value).toBe('var(--anm-0), var(--anm-1)');

      const timelineDecl = declarations.find((d) => d.name === 'animation-timeline');
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('var(--anm-tmln-0), var(--anm-tmln-1)');

      const rangeDecl = declarations.find((d) => d.name === 'animation-range');
      expect(rangeDecl).toBeDefined();
      expect(rangeDecl!.value).toBe('var(--anm-rng-0), var(--anm-rng-1)');
    });

    it('should produce a single coordinated-list rule covering all targets', () => {
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

      const { listsRule } = _generate(config);
      const { selectors, declarations } = parseListsRule(listsRule);

      expect(selectors).toEqual([
        '[data-interact-key="el-a"] > :first-child',
        '[data-interact-key="el-b"] > :first-child',
      ]);

      const animationDecl = declarations.find((d) => d.name === 'animation');
      expect(animationDecl).toBeDefined();
      expect(animationDecl!.value).toBe('var(--anm-0)');
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
            effects: [
              {
                effectId: 'e1',
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
            effects: [
              {
                effectId: 'e1',
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

      const { cssRules } = _generate(config, false);

      expect(cssRules).not.toEqual([]);
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

      const { cssRules, listsRule } = _generate(config);

      const effectRules = cssRules.filter((r) =>
        r.declarations.some((d) => isAnimationProp(d.name)),
      );
      expect(effectRules.length).toBeGreaterThanOrEqual(2);

      const animPropNames = effectRules.map(
        (r) => r.declarations.find((d) => isAnimationProp(d.name))!.name,
      );
      expect(new Set(animPropNames).size).toBe(1);

      const { declarations } = parseListsRule(listsRule);
      const animationDecl = declarations.find((d) => d.name === 'animation');
      expect(animationDecl).toBeDefined();
      expect(animationDecl!.value).toBe('var(--anm-0)');
    });
  });

  describe('options argument', () => {
    const config: InteractConfig = {
      effects: {},
      interactions: [
        {
          key: 'el',
          trigger: 'click',
          effects: [
            {
              effectId: 'e1',
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
      expect(result).toContain('[data-interact-key="hero"] .title {\n  visibility: hidden;\n}');
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
});
