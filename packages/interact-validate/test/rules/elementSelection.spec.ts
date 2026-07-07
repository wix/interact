import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// C6 — listItemSelector is inert without listContainer (Element Resolution priority).
// C7 — selector is ignored when both listContainer and listItemSelector are present.
// Source: full-lean.md / integration.md "Element Resolution".

describe('elementSelection', () => {
  describe('LIST_ITEM_SELECTOR_WITHOUT_CONTAINER (warning)', () => {
    it('warns on an interaction with listItemSelector but no listContainer', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            listItemSelector: '.item',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'LIST_ITEM_SELECTOR_WITHOUT_CONTAINER');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['interactions', 0, 'listItemSelector']);
    });

    it('warns on an effect with listItemSelector but no listContainer', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              { namedEffect: { type: 'FadeIn' }, duration: 400, listItemSelector: '.item' },
            ],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'LIST_ITEM_SELECTOR_WITHOUT_CONTAINER');
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'listItemSelector']);
    });

    it('does not warn when listContainer is present alongside listItemSelector', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            listContainer: '.list',
            listItemSelector: '.item',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(
        result.errors.filter((e) => e.code === 'LIST_ITEM_SELECTOR_WITHOUT_CONTAINER'),
      ).toHaveLength(0);
    });
  });

  describe('REDUNDANT_SELECTOR_WITH_LIST_ITEM (warning)', () => {
    it('warns when listContainer + listItemSelector + selector are all present', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            listContainer: '.list',
            listItemSelector: '.item',
            selector: '.ignored',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'REDUNDANT_SELECTOR_WITH_LIST_ITEM');
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['interactions', 0, 'selector']);
    });

    it('does not warn when selector is used without listItemSelector', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            listContainer: '.list',
            selector: '.child',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(
        result.errors.filter((e) => e.code === 'REDUNDANT_SELECTOR_WITH_LIST_ITEM'),
      ).toHaveLength(0);
    });
  });
});
