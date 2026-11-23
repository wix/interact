import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  add,
  Interact,
  remove,
  type InteractConfig,
  type IInteractionController,
} from '../src/web';

const key = 'target';
const originalMarkup = '<p>Original content</p>';

function config(): InteractConfig {
  return {
    interactions: [{ key, trigger: 'click', '$late-cleanup': {} }],
  };
}

function makeTarget() {
  const target = document.createElement('interact-element');
  target.dataset.interactKey = key;
  target.innerHTML = originalMarkup;
  return target;
}

function getController() {
  const controller = Interact.getController(key);
  if (!controller) throw new Error('Expected target controller');
  return controller;
}

const registryMethods = ['getPlugin', 'getPluginsNames'] as const;

function duringRegistryRead(
  method: (typeof registryMethods)[number],
  callback: () => void,
  run: () => void,
) {
  const original = Object.getOwnPropertyDescriptor(Interact, method);
  if (!original) throw new Error('Expected registry method');
  let armed = true;
  Object.defineProperty(Interact, method, {
    configurable: true,
    get() {
      if (armed) {
        armed = false;
        callback();
      }
      return original.value;
    },
  });
  try {
    run();
  } finally {
    Object.defineProperty(Interact, method, original);
  }
}

describe('late plugin cleanup', () => {
  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it.each(['detach', 'replacement', 'static delete', 'static replacement'])(
    'runs the returned cleanup of the old scope after %s',
    (action) => {
      const clean = vi.fn<(root: HTMLElement) => void>();
      let entered = false;
      let replacement: HTMLElement | undefined;
      let pending: IInteractionController | undefined;
      Interact.use('late-cleanup', (_, { root }) => {
        const part = document.createElement('span');
        root.append(part);
        if (!entered) {
          entered = true;
          if (action === 'detach') root.remove();
          else if (action === 'replacement') {
            root.remove();
            replacement = makeTarget();
            document.body.append(replacement);
          } else if (action === 'static delete') {
            Interact.deleteController(key);
          } else if (action === 'static replacement') {
            add(document.createElement('div'), 'pending');
            pending = Interact.getController('pending');
            if (!pending) throw new Error('Expected pending controller');
            Interact.setController(key, pending);
          }
        }
        return () => {
          part.remove();
          clean(root);
        };
      });
      Interact.create(config());
      const target = makeTarget();

      document.body.append(target);

      expect(clean.mock.calls).toEqual([[target]]);
      expect(target.querySelector('span')).toBeNull();
      if (replacement) {
        expect(Interact.getController(key)?.element).toBe(replacement);
        expect(replacement.querySelector('span')).toBeInstanceOf(HTMLSpanElement);
      }
      if (pending) expect(Interact.getController(key)).toBe(pending);
      Interact.destroy();
      expect(clean.mock.calls).toEqual(replacement ? [[target], [replacement]] : [[target]]);
    },
  );

  it.each(['same controller', 'new controller', 'new key', 'unregistered declared key'])(
    'preserves the exact live node and completed cleanup order after same-element remount with a %s',
    (kind) => {
      const completions: number[] = [];
      let applications = 0;
      let latestPart: HTMLSpanElement | undefined;
      let firstController: IInteractionController | undefined;
      const successorKey =
        kind === 'new key' || kind === 'unregistered declared key' ? 'successor' : key;
      Interact.use('late-cleanup', (_, { root }) => {
        const snapshot = root.innerHTML;
        const token = ++applications;
        const part = document.createElement('span');
        part.textContent = String(token);
        root.replaceChildren(part);
        if (token === 1) {
          firstController = getController();
          if (kind === 'same controller') {
            root.remove();
            document.body.append(root);
          } else {
            remove(key);
            add(root, successorKey);
            if (kind === 'unregistered declared key') root.dataset.interactKey = 'unregistered';
          }
        } else {
          latestPart = part;
        }
        return () => {
          completions.push(token);
          root.innerHTML = snapshot;
        };
      });
      const authored = config();
      if (successorKey !== key) {
        authored.interactions.push({ key: successorKey, trigger: 'click', '$late-cleanup': {} });
      }
      Interact.create(authored);
      const target = kind === 'same controller' ? makeTarget() : document.createElement('div');
      target.innerHTML = originalMarkup;
      document.body.append(target);
      if (kind !== 'same controller') add(target, key);

      expect(applications).toBe(2);
      expect(latestPart).toBeDefined();
      expect(target.firstElementChild).toBe(latestPart);
      expect(completions).toEqual([]);
      expect(Interact.getController(successorKey) === firstController).toBe(
        kind === 'same controller',
      );

      Interact.destroy();
      expect(completions).toEqual([2, 1]);
      expect(target.innerHTML).toBe(originalMarkup);
    },
  );

  it.each(['same cached controller', 'different cached controller'])(
    'keeps the callback on its reachable pending root with a %s',
    (kind) => {
      const clean = vi.fn();
      let current: IInteractionController | undefined;
      Interact.use('late-cleanup', (_, { root }) => {
        const part = document.createElement('span');
        root.append(part);
        if (kind === 'same cached controller') {
          current = getController();
          current.disconnect();
        } else {
          add(root, 'holding');
          current = Interact.getController('holding');
          if (!current) throw new Error('Expected pending controller');
          Interact.setController(key, current);
        }
        return () => {
          part.remove();
          clean();
        };
      });
      Interact.create(config());
      const target = makeTarget();

      document.body.append(target);

      expect(getController()).toBe(current);
      expect(target.querySelector('span')).toBeInstanceOf(HTMLSpanElement);
      expect(clean).not.toHaveBeenCalled();

      Interact.destroy();
      expect(clean).toHaveBeenCalledTimes(1);
      expect(target.querySelector('span')).toBeNull();
    },
  );

  it('keeps a completed transformation on its current root when author init changes during apply', () => {
    const clean = vi.fn();
    const skipped = vi.fn();
    Interact.use('late-cleanup', (_, { root }) => {
      const part = document.createElement('span');
      root.append(part);
      author.init({ interactions: [] });
      return () => {
        part.remove();
        clean();
      };
    });
    Interact.use('late-cleanup-skipped', skipped);
    const authored = config();
    authored.interactions[0]['$late-cleanup-skipped'] = {};
    const author = Interact.create(authored);
    const target = makeTarget();

    document.body.append(target);

    expect(target.querySelector('span')).toBeInstanceOf(HTMLSpanElement);
    expect(clean).not.toHaveBeenCalled();
    expect(skipped).not.toHaveBeenCalled();
    target.remove();
    expect(clean).toHaveBeenCalledTimes(1);
    expect(target.querySelector('span')).toBeNull();
  });

  it('reports an error from a late cleanup once', () => {
    const failure = new Error('Late plugin cleanup failed');
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    Interact.use('late-cleanup', (_, { root }) => {
      root.remove();
      return () => {
        throw failure;
      };
    });
    Interact.create(config());
    document.body.append(makeTarget());
    Interact.destroy();

    expect(report.mock.calls).toEqual([[failure]]);
  });

  describe.each(registryMethods)('admission during %s', (method) => {
    it.each(['destroy', 'init'])(
      'skips work from the original author generation after %s',
      (action) => {
        const apply = vi.fn();
        Interact.use('late-cleanup', (_, { root }) => {
          root.append(document.createElement('span'));
          apply();
        });
        const author = Interact.create(config());
        const target = makeTarget();

        duringRegistryRead(
          method,
          () => {
            if (action === 'destroy') author.destroy();
            else author.init({ interactions: [] });
          },
          () => document.body.append(target),
        );

        expect(apply).not.toHaveBeenCalled();
        expect(target.querySelector('span')).toBeNull();
      },
    );

    it('applies a primitive value only once on the new registration of the same controller', () => {
      const apply = vi.fn();
      Interact.use('late-cleanup', (_, { root }) => {
        const part = document.createElement('span');
        root.append(part);
        apply();
        return () => part.remove();
      });
      Interact.create({
        interactions: [{ key, trigger: 'click', '$late-cleanup': 'primitive' }],
      });
      const target = makeTarget();
      let originalController: IInteractionController | undefined;
      let freshPart: HTMLElement | null = null;

      duringRegistryRead(
        method,
        () => {
          originalController = getController();
          target.remove();
          document.body.append(target);
          freshPart = target.querySelector('span');
        },
        () => document.body.append(target),
      );

      expect(getController()).toBe(originalController);
      expect(freshPart).toBeInstanceOf(HTMLSpanElement);
      expect(target.querySelector('span')).toBe(freshPart);
      expect(apply).toHaveBeenCalledTimes(1);
    });
  });

  it('leaves the object value available for a reentrant current author generation', () => {
    const value = {};
    const applied: unknown[] = [];
    Interact.use('late-cleanup', (_, context) => {
      applied.push(context.config.selector);
    });
    const author = Interact.create({
      interactions: [{ key, trigger: 'click', selector: '.old', '$late-cleanup': value }],
    });
    const target = makeTarget();

    duringRegistryRead(
      'getPlugin',
      () =>
        author.init({
          interactions: [{ key, trigger: 'click', selector: '.current', '$late-cleanup': value }],
        }),
      () => document.body.append(target),
    );

    expect(applied).toEqual(['.current']);
  });

  it('deduplicates objects applied by a reentrant lookup on the same live registration', () => {
    const events: string[] = [];
    const readiness = 'late-cleanup-objects';
    for (const name of ['first', 'second']) {
      Interact.use(
        `lookup-${name}`,
        () => {
          events.push(`apply:${name}`);
          return () => events.push(`clean:${name}`);
        },
        { defer: readiness },
      );
    }
    Interact.create({
      interactions: [{ key, trigger: 'click', '$lookup-first': {}, '$lookup-second': {} }],
    });
    const target = makeTarget();
    document.body.append(target);
    expect(events).toEqual([]);

    duringRegistryRead(
      'getPlugin',
      () => Interact.ready(readiness, key),
      () => Interact.ready(readiness, key),
    );
    target.remove();

    expect(events).toEqual(['apply:first', 'apply:second', 'clean:first', 'clean:second']);
  });
});
