import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  inspectElement,
  getAnimationState,
  inspectByKey,
  findOrphanedElements,
} from '../src/inspect/domInspector';

function addKeyedElement(key: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-interact-key', key);
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  return el;
}

describe('domInspector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('inspectElement', () => {
    it('returns tag name and key', () => {
      const el = addKeyedElement('hero');
      const result = inspectElement(el);
      expect(result.tagName).toBe('div');
      expect(result.key).toBe('hero');
    });

    it('extracts all attributes', () => {
      const el = addKeyedElement('hero', { id: 'test', class: 'foo' });
      const result = inspectElement(el);
      expect(result.attributes['id']).toBe('test');
      expect(result.attributes['class']).toBe('foo');
    });

    it('extracts data-interact-* attributes separately', () => {
      const el = addKeyedElement('hero', {
        'data-interact-initial': 'true',
        'data-interact-enter': 'fade',
      });
      const result = inspectElement(el);
      expect(result.interactAttributes['data-interact-key']).toBe('hero');
      expect(result.interactAttributes['data-interact-initial']).toBe('true');
      expect(result.interactAttributes['data-interact-enter']).toBe('fade');
    });

    it('reports child count', () => {
      const el = addKeyedElement('hero');
      el.innerHTML = '<span>a</span><span>b</span>';
      const result = inspectElement(el);
      expect(result.childCount).toBe(2);
    });

    it('returns empty animations in jsdom', () => {
      const el = addKeyedElement('hero');
      const result = inspectElement(el);
      expect(result.animations).toEqual([]);
    });
  });

  describe('getAnimationState', () => {
    it('returns empty array in jsdom (no WAAPI)', () => {
      const el = addKeyedElement('hero');
      const result = getAnimationState(el);
      expect(result).toEqual([]);
    });
  });

  describe('inspectByKey', () => {
    it('finds element by data-interact-key', () => {
      addKeyedElement('hero');
      const result = inspectByKey('hero');
      expect(result).not.toBeNull();
      expect(result!.key).toBe('hero');
    });

    it('returns null for unknown key', () => {
      const result = inspectByKey('nonexistent');
      expect(result).toBeNull();
    });

    it('accepts a custom root', () => {
      const container = document.createElement('div');
      const el = document.createElement('div');
      el.setAttribute('data-interact-key', 'scoped');
      container.appendChild(el);
      document.body.appendChild(container);

      const result = inspectByKey('scoped', container);
      expect(result).not.toBeNull();
      expect(result!.key).toBe('scoped');
    });
  });

  describe('findOrphanedElements', () => {
    it('finds elements without controller attributes', () => {
      addKeyedElement('hero');
      addKeyedElement('panel');

      const orphans = findOrphanedElements();
      expect(orphans).toHaveLength(2);
      expect(orphans.map((o) => o.key)).toContain('hero');
      expect(orphans.map((o) => o.key)).toContain('panel');
    });

    it('does not count elements with data-interact-enter', () => {
      addKeyedElement('hero', { 'data-interact-enter': 'fade' });
      addKeyedElement('panel');

      const orphans = findOrphanedElements();
      expect(orphans).toHaveLength(1);
      expect(orphans[0].key).toBe('panel');
    });

    it('does not count elements with data-interact-effect', () => {
      addKeyedElement('hero', { 'data-interact-effect': 'active' });
      const orphans = findOrphanedElements();
      expect(orphans).toHaveLength(0);
    });

    it('returns empty when no keyed elements exist', () => {
      const orphans = findOrphanedElements();
      expect(orphans).toHaveLength(0);
    });

    it('scopes to a custom root', () => {
      addKeyedElement('outside');

      const container = document.createElement('div');
      const el = document.createElement('div');
      el.setAttribute('data-interact-key', 'inside');
      container.appendChild(el);
      document.body.appendChild(container);

      const orphans = findOrphanedElements(container);
      expect(orphans).toHaveLength(1);
      expect(orphans[0].key).toBe('inside');
    });
  });
});
