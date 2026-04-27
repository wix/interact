import { describe, expect, it } from 'vitest';
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
    it('should set animation custom properties and turn off transition for keyframeEffect', () => {
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

      const effectRule = cssRules.find((r) =>
        r.declarations.some((d) => isTransitionProp(d.name) && d.value === '_'),
      )!;
      expect(effectRule).toBeDefined();

      const animDecl = findDecl(effectRule.declarations, (d) => isAnimationProp(d.name));
      expect(animDecl).toBeDefined();
      expect(animDecl!.value).toContain('myAnim');

      const compDecl = findDecl(effectRule.declarations, (d) => isCompositionProp(d.name));
      expect(compDecl).toBeDefined();

      const timelineDecl = findDecl(effectRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('none');

      const rangeDecl = findDecl(effectRule.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl).toBeDefined();
      expect(rangeDecl!.value).toBe('normal');
    });

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

      const initialRule = cssRules.find((r) => r.addInitialSelector)!;
      expect(initialRule).toBeDefined();

      DEFAULT_INITIAL.forEach(({ name, value }) => {
        const decl = initialRule.declarations.find((d) => d.name === name);
        expect(decl, `expected DEFAULT_INITIAL declaration: ${name}`).toBeDefined();
        expect(decl!.value).toBe(value);
      });

      const animDeclOnInitial = findDecl(initialRule.declarations, (d) => isAnimationProp(d.name));
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

      expect(cssRules.every((r) => !r.addInitialSelector)).toBe(true);

      const effectRule = cssRules.find((r) => r.declarations.some((d) => isAnimationProp(d.name)))!;
      expect(effectRule).toBeDefined();
      expect(effectRule.declarations.some((d) => isTransitionProp(d.name) && d.value === '_')).toBe(
        true,
      );
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

      expect(cssRules.every((r) => !r.addInitialSelector)).toBe(true);
    });
  });

  describe('effectToCSS - transition branch', () => {
    it('should turn off animation and set transition custom prop for a transition effect', () => {
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
        (r) =>
          !r.states && r.declarations.some((d) => isAnimationProp(d.name) && d.value === 'none'),
      )!;
      expect(effectRule).toBeDefined();

      const compDecl = findDecl(effectRule.declarations, (d) => isCompositionProp(d.name));
      expect(compDecl!.value).toBe('replace');

      const transDecl = findDecl(effectRule.declarations, (d) => isTransitionProp(d.name));
      expect(transDecl).toBeDefined();
      expect(String(transDecl!.value)).toContain('opacity');
      expect(String(transDecl!.value)).toContain('500ms');

      const timelineDecl = findDecl(effectRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('none');

      const rangeDecl = findDecl(effectRule.declarations, (d) => isRangeProp(d.name));
      expect(rangeDecl).toBeDefined();
      expect(rangeDecl!.value).toBe('normal');
    });

    it('should produce a state rule with var() declarations for transition', () => {
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

      const varDecl = stateRule.declarations.find(
        (d) => d.name === 'opacity' && String(d.value).startsWith('var('),
      );
      expect(varDecl).toBeDefined();

      const statePropDecl = stateRule.declarations.find((d) => d.name.startsWith('--opacity-'));
      expect(statePropDecl).toBeDefined();
      expect(statePropDecl!.value).toBe('1');
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

      const varDecl = stateRule.declarations.find(
        (d) => d.name === 'color' && String(d.value).startsWith('var('),
      );
      expect(varDecl).toBeDefined();

      const statePropDecl = stateRule.declarations.find((d) => d.name.startsWith('--color-'));
      expect(statePropDecl).toBeDefined();
      expect(statePropDecl!.value).toBe('red');
    });

    it('should produce var() references that link to the state custom properties', () => {
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
                  styleProperties: [
                    { name: 'opacity', value: '0.5' },
                    { name: 'transform', value: 'scale(2)' },
                  ],
                  duration: 400,
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const stateRule = cssRules.find((r) => r.states?.includes('trans1'))!;

      const opacityProp = stateRule.declarations.find((d) => d.name.startsWith('--opacity-'))!;
      const opacityVarDecl = stateRule.declarations.find(
        (d) => d.name === 'opacity' && String(d.value).includes(opacityProp.name),
      );
      expect(opacityVarDecl).toBeDefined();

      const transformProp = stateRule.declarations.find((d) => d.name.startsWith('--transform-'))!;
      const transformVarDecl = stateRule.declarations.find(
        (d) => d.name === 'transform' && String(d.value).includes(transformProp.name),
      );
      expect(transformVarDecl).toBeDefined();
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

      expect(cssRules.every((r) => !r.addInitialSelector)).toBe(true);
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
      expect(timelineDecl!.value).toBe('none');

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

      const initialRule = cssRules.find((r) => r.addInitialSelector)!;
      expect(initialRule).toBeDefined();

      const timelineDecl = findDecl(initialRule.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('none');

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
      expect(timelineValue).toContain(`--${triggerId}`);
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
          r.declarations.some((d) => isCompositionProp(d.name) && d.value === 'replace') &&
          r.declarations.some((d) => isTransitionProp(d.name) && d.value === '_'),
      );
      expect(effectRule).toBeDefined();

      const timelineDecl = findDecl(effectRule!.declarations, (d) => isTimelineProp(d.name));
      expect(timelineDecl).toBeDefined();
      expect(timelineDecl!.value).toBe('none');

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

  describe('statePropsToInvalidate - cross-effect cascade', () => {
    it('should invalidate transition state properties in subsequent effects within the same interaction', () => {
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
              {
                effectId: 'kf1',
                duration: 300,
                keyframeEffect: {
                  name: 'slide',
                  keyframes: [{ transform: 'translateX(-100px)' }, { transform: 'translateX(0)' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const kfRule = cssRules.find((r) =>
        r.declarations.some((d) => isTransitionProp(d.name) && d.value === '_'),
      )!;

      const invalidationDecls = kfRule.declarations.filter(
        (d) => d.name.startsWith('--opacity-') && d.value === ' ',
      );
      expect(invalidationDecls.length).toBeGreaterThan(0);
    });

    it('should not invalidate anything for the first effect in an interaction', () => {
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
                  name: 'slide',
                  keyframes: [{ transform: 'translateX(-100px)' }, { transform: 'translateX(0)' }],
                },
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);

      const effectRule = cssRules.find((r) =>
        r.declarations.some((d) => isTransitionProp(d.name) && d.value === '_'),
      )!;
      const invalidationDecls = effectRule.declarations.filter((d) => d.value === ' ');
      expect(invalidationDecls).toHaveLength(0);
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
      const initialRule = cssRules.find((r) => r.addInitialSelector)!;

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

      const animRules = cssRules.filter((r) =>
        r.declarations.some((d) => isTransitionProp(d.name) && d.value === '_'),
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
});
