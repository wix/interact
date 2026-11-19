import { afterEach, describe, expect, it, vi } from 'vitest';
import { add, Interact, type InteractStateChangeEvent } from '../src/web';
import { getInteractElement } from '../src/web/InteractElement';

describe('state changes', () => {
  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('reads and writes only the selected list item and dispatches on that item', () => {
    const root = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    second.dataset.interactKey = 'list[second]';
    root.append(first, second);
    document.body.append(root);
    add(root, 'list');
    const changes: InteractStateChangeEvent[] = [];
    root.addEventListener('interact-state-change', (event) => changes.push(event));
    const controller = Interact.getController('list');

    controller?.toggleEffect('root-state', 'add');
    controller?.toggleEffect('first-state', 'add', first);
    controller?.toggleEffect('second-state', 'toggle', second);
    controller?.toggleEffect('ignored', 'add', null);

    expect(controller?.getActiveEffects()).toEqual(['root-state']);
    expect(first.dataset.interactEffect).toBe('first-state');
    expect(second.dataset.interactEffect).toBe('second-state');

    controller?.toggleEffect('first-state', 'toggle', first);
    controller?.toggleEffect('', 'clear', second);

    expect(first.dataset.interactEffect).toBe('');
    expect(second.dataset.interactEffect).toBe('');
    expect(controller?.getActiveEffects()).toEqual(['root-state']);
    expect(changes.map((event) => event.target)).toEqual([root, first, second, first, second]);
    expect(changes.map((event) => event.detail)).toEqual([
      { key: 'list', activeEffectIds: ['root-state'] },
      { key: 'list', activeEffectIds: ['first-state'] },
      { key: 'list[second]', activeEffectIds: ['second-state'] },
      { key: 'list', activeEffectIds: [] },
      { key: 'list[second]', activeEffectIds: [] },
    ]);
  });

  it('only writes the fallback attribute for a real membership change', () => {
    const root = document.createElement('div');
    document.body.append(root);
    root.classList.add('unrelated');
    root.dataset.interactEffect = ' retained  \t';
    add(root, 'target');
    const controller = Interact.getController('target');
    const changes: InteractStateChangeEvent[] = [];
    root.addEventListener('interact-state-change', (event) => changes.push(event));
    const observer = new MutationObserver(() => {});
    observer.observe(root, { attributeFilter: ['data-interact-effect'] });

    controller?.toggleEffect('retained', 'add');
    controller?.toggleEffect('missing', 'remove');
    expect(observer.takeRecords()).toHaveLength(0);
    expect(changes).toHaveLength(0);

    controller?.toggleEffect('other', 'add');
    controller?.toggleEffect('', 'clear');
    controller?.toggleEffect('', 'clear');
    controller?.toggleEffect('retained', 'remove');

    expect(observer.takeRecords()).toHaveLength(2);
    expect(changes.map((event) => event.detail.activeEffectIds)).toEqual([
      ['retained', 'other'],
      [],
    ]);
    expect(root.getAttribute('data-interact-effect')).toBe('');
    expect(root.classList.contains('unrelated')).toBe(true);
    observer.disconnect();
  });

  it('reads controller state when the custom element forwards its getter to the controller', () => {
    class ForwardingElement extends HTMLElement {
      getActiveEffects(): string[] {
        return Interact.getController('forwarding')?.getActiveEffects() ?? [];
      }
    }
    customElements.define('test-forwarding-interact', ForwardingElement);
    const element = new ForwardingElement();
    add(element, 'forwarding');
    const controller = Interact.getController('forwarding');

    controller?.toggleEffect('direct', 'add');

    expect(element.getActiveEffects()).toEqual(['direct']);
  });

  it('reads forced attribute state through the controller on a native wrapper', () => {
    const attachInternals = HTMLElement.prototype.attachInternals;
    vi.spyOn(HTMLElement.prototype, 'attachInternals').mockImplementation(function (
      this: HTMLElement,
    ) {
      return Object.assign(attachInternals.call(this), { states: new Set<string>() });
    });
    const Element = getInteractElement();
    customElements.define('test-forced-attribute-interact', Element);
    const wrapper = new Element();
    wrapper.dataset.interactKey = 'forced-attribute';
    document.body.append(wrapper);
    const controller = Interact.getController('forced-attribute');
    const changes: InteractStateChangeEvent['detail'][] = [];
    wrapper.addEventListener('interact-state-change', (event) => changes.push(event.detail));

    wrapper.toggleEffect('native', 'add');
    controller?.toggleEffect('attribute', 'add', undefined, true);

    expect(controller?.getActiveEffects()).toEqual(['attribute']);
    expect(wrapper.getActiveEffects()).toEqual(['native']);
    expect(changes).toEqual([
      { key: 'forced-attribute', activeEffectIds: ['native'] },
      { key: 'forced-attribute', activeEffectIds: ['attribute'] },
    ]);
  });

  it('keeps a non-breaking space inside one fallback state ID', () => {
    const effectId = 'Open\u00A0menu';
    const element = document.createElement('div');
    element.dataset.interactEffect = 'existing\tother';
    add(element, 'target');
    const controller = Interact.getController('target');
    const changes: InteractStateChangeEvent['detail'][] = [];
    element.addEventListener('interact-state-change', (event) => changes.push(event.detail));

    controller?.toggleEffect(effectId, 'add');
    controller?.toggleEffect(effectId, 'add');

    expect(element.dataset.interactEffect).toBe(`existing other ${effectId}`);
    expect(controller?.getActiveEffects()).toEqual(['existing', 'other', effectId]);

    controller?.toggleEffect(effectId, 'remove');

    expect(changes).toEqual([
      { key: 'target', activeEffectIds: ['existing', 'other', effectId] },
      { key: 'target', activeEffectIds: ['existing', 'other'] },
    ]);
  });

  it('notifies a detached, unkeyed custom element when its state changes', () => {
    const Element = getInteractElement();
    customElements.define('test-unkeyed-interact', Element);
    const wrapper = new Element();
    const changes: InteractStateChangeEvent[] = [];
    wrapper.addEventListener('interact-state-change', (event) => changes.push(event));

    wrapper.toggleEffect('selected', 'toggle');

    expect(wrapper.getActiveEffects()).toEqual(['selected']);
    expect(changes.map((event) => event.detail)).toEqual([{ activeEffectIds: ['selected'] }]);
    expect(changes[0].target).toBe(wrapper);
  });

  it('delivers direct, delegated, and triggered changes past a shadow root exactly once', () => {
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        replaceSync() {}
      },
    );
    Interact.create({
      interactions: [
        {
          key: 'source',
          trigger: 'click',
          effects: [
            { key: 'target', effectId: 'clicked', stateAction: 'add', transitionProperties: [] },
          ],
        },
      ],
    });
    const Element = getInteractElement();
    customElements.define('test-keyed-interact', Element);
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const source = document.createElement('button');
    const wrapper = new Element();
    wrapper.dataset.interactKey = 'target';
    wrapper.append(document.createElement('div'));
    shadow.append(source, wrapper);
    document.body.append(host);
    add(source, 'source');
    const origins: EventTarget[] = [];
    const details: InteractStateChangeEvent['detail'][] = [];
    host.addEventListener('interact-state-change', (event) => {
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      origins.push(event.composedPath()[0]);
      details.push(event.detail);
    });

    wrapper.toggleEffect('direct', 'add');
    Interact.getController('target')?.toggleEffect('delegated', 'add');
    source.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    source.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

    expect(origins).toEqual([wrapper, wrapper, wrapper]);
    expect(details).toEqual([
      { key: 'target', activeEffectIds: ['direct'] },
      { key: 'target', activeEffectIds: ['direct', 'delegated'] },
      { key: 'target', activeEffectIds: ['direct', 'delegated', 'clicked'] },
    ]);
    expect(Interact.getController('target')?.getActiveEffects()).toEqual([
      'direct',
      'delegated',
      'clicked',
    ]);
  });

  it('keeps the old native state prefix in storage and reports authored IDs', () => {
    class LegacyStates extends Set<string> {
      override add(value: string): this {
        if (!value.startsWith('--')) {
          throw new DOMException('Expected a double-hyphen prefix', 'SyntaxError');
        }
        return super.add(value);
      }
    }

    const attachInternals = HTMLElement.prototype.attachInternals;
    vi.spyOn(HTMLElement.prototype, 'attachInternals').mockImplementation(function (
      this: HTMLElement,
    ) {
      return Object.assign(attachInternals.call(this), { states: new LegacyStates() });
    });
    const Element = getInteractElement();
    customElements.define('test-legacy-interact', Element);
    const wrapper = new Element();
    const item = document.createElement('div');
    wrapper.append(item);
    const changes: InteractStateChangeEvent['detail'][] = [];
    wrapper.addEventListener('interact-state-change', (event) => changes.push(event.detail));

    wrapper.toggleEffect('selected', 'add');
    wrapper.toggleEffect('selected', 'add');
    wrapper.toggleEffect('pinned', 'add', item);

    expect(wrapper._internals?.states.has('--selected')).toBe(true);
    expect(wrapper.getActiveEffects()).toEqual(['selected']);
    expect(wrapper.dataset.interactEffect).toBeUndefined();
    expect(item.dataset.interactEffect).toBe('pinned');
    expect(changes).toEqual([{ activeEffectIds: ['selected'] }, { activeEffectIds: ['pinned'] }]);
  });
});
