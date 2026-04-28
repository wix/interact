import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Interact } from '../src/web';
import { InteractionController } from '../src/core/InteractionController';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../src/handlers';
import type { InteractConfig, SequenceConfig } from '../src/types';
import { getSequence, createAnimationGroups } from '@wix/motion';
import { addListItems } from '../src/core/add';
import { removeListItems } from '../src/core/remove';

vi.mock('@wix/motion', () => {
  const mockSequence = {
    play: vi.fn(),
    cancel: vi.fn(),
    onFinish: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    progress: vi.fn(),
    persist: vi.fn(),
    isCSS: false,
    playState: 'idle',
    ready: Promise.resolve(),
    animations: [],
    animationGroups: [],
    addGroups: vi.fn(),
    removeGroups: vi.fn().mockReturnValue([]),
  };

  return {
    getWebAnimation: vi.fn(),
    getScrubScene: vi.fn(),
    getEasing: vi.fn((v: string) => v),
    getAnimation: vi.fn(),
    registerEffects: vi.fn(),
    getSequence: vi.fn().mockReturnValue(mockSequence),
    createAnimationGroups: vi.fn().mockReturnValue([]),
  };
});

function createBaseConfig(): InteractConfig {
  return {
    effects: {
      'effect-source': {
        keyframeEffect: {
          name: 'source',
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
        },
        duration: 300,
      },
      'effect-target': {
        key: 'target-key',
        keyframeEffect: {
          name: 'target',
          keyframes: [{ transform: 'translateY(10px)' }, { transform: 'translateY(0)' }],
        },
        duration: 400,
      },
    },
    sequences: {
      'shared-sequence': {
        sequenceId: 'shared-sequence',
        delay: 10,
        offset: 20,
        effects: [{ effectId: 'effect-target', key: 'target-key' }],
      },
    },
    interactions: [],
  };
}

function createInteractElement() {
  const element = document.createElement('interact-element') as HTMLElement;
  const child = document.createElement('div');
  element.append(child);
  return { element, child };
}

function addElement(element: HTMLElement, key: string) {
  const controller = new InteractionController(element, key, { useFirstChild: true });
  controller.connect(key);
  return controller;
}

describe('interact sequences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).IntersectionObserver = class IntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor() {}
    };
  });

  afterEach(() => {
    Interact.destroy();
  });

  describe('Config parsing', () => {
    test('parses inline sequence on interaction with effects array', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'inline-seq',
        delay: 12,
        offset: 8,
        effects: [{ effectId: 'effect-source', key: 'source-key' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const trigger = instance.dataCache.interactions['source-key'].triggers[0];

      expect(trigger.sequences).toHaveLength(1);
      expect((trigger.sequences?.[0] as SequenceConfig).effects).toEqual([
        { effectId: 'effect-source', key: 'source-key' },
      ]);
      expect((trigger.sequences?.[0] as SequenceConfig).sequenceId).toBe('inline-seq');
    });

    test('parses sequenceId reference from config.sequences', () => {
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'shared-sequence' }],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const triggerSequence = instance.dataCache.interactions['source-key'].triggers[0]
        .sequences?.[0] as SequenceConfig;

      expect(triggerSequence.sequenceId).toBe('shared-sequence');
      expect(triggerSequence.delay).toBe(10);
      expect(triggerSequence.offset).toBe(20);
      expect(triggerSequence.effects).toEqual([{ effectId: 'effect-target', key: 'target-key' }]);
    });

    test('merges inline overrides onto referenced sequence', () => {
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'shared-sequence', delay: 99, offset: 44 }],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const triggerSequence = instance.dataCache.interactions['source-key'].triggers[0]
        .sequences?.[0] as SequenceConfig;

      expect(triggerSequence.sequenceId).toBe('shared-sequence');
      expect(triggerSequence.delay).toBe(99);
      expect(triggerSequence.offset).toBe(44);
      // Ensure non-overridden fields still come from referenced sequence
      expect(triggerSequence.effects).toEqual([{ effectId: 'effect-target', key: 'target-key' }]);
    });

    test('auto-generates sequenceId when not provided', () => {
      const inlineWithoutId: SequenceConfig = {
        effects: [{ effectId: 'effect-source' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineWithoutId],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const triggerSequence = instance.dataCache.interactions['source-key'].triggers[0]
        .sequences?.[0] as SequenceConfig;

      expect(typeof triggerSequence.sequenceId).toBe('string');
      expect(triggerSequence.sequenceId).toBeTruthy();
    });

    test('warns when referencing unknown sequenceId', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'missing-sequence' }],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const triggerSequence =
        instance.dataCache.interactions['source-key'].triggers[0].sequences?.[0];

      expect(warnSpy).toHaveBeenCalledWith(
        'Interact: Sequence "missing-sequence" not found in config',
      );
      expect(triggerSequence).toEqual({ sequenceId: 'missing-sequence' });
      warnSpy.mockRestore();
    });

    test('caches sequences in dataCache.sequences', () => {
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'shared-sequence' }],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });

      expect(instance.dataCache.sequences).toEqual(config.sequences);
      expect(instance.dataCache.sequences['shared-sequence']).toBeDefined();
    });

    test('stores sequence effects in interactions[target].sequences for cross-element targets', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'cross-seq',
        effects: [{ effectId: 'effect-target', key: 'target-key' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const targetEntry = instance.dataCache.interactions['target-key'];
      const sequenceKeys = Object.keys(targetEntry.sequences);

      expect(sequenceKeys).toHaveLength(1);
      expect(sequenceKeys[0].startsWith('target-key::seq::cross-seq::')).toBe(true);
      expect(targetEntry.sequences[sequenceKeys[0]]).toHaveLength(1);
      expect(targetEntry.sequences[sequenceKeys[0]][0].sequence.sequenceId).toBe('cross-seq');
      expect(targetEntry.sequences[sequenceKeys[0]][0].sequence.effects).toEqual([
        { effectId: 'effect-target', key: 'target-key' },
      ]);
      expect(targetEntry.sequences[sequenceKeys[0]][0].trigger).toBe('click');
      expect(targetEntry.sequences[sequenceKeys[0]][0].key).toBe('source-key');
      expect(targetEntry.interactionIds).toContain(sequenceKeys[0]);
    });

    test('resolves sequence effect target via config.effects when effect has no key', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'resolve-target-seq',
        effects: [{ effectId: 'effect-target' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });

      expect(instance.dataCache.interactions['target-key']).toBeDefined();
      const sequenceKeys = Object.keys(instance.dataCache.interactions['target-key'].sequences);
      expect(sequenceKeys).toHaveLength(1);
      expect(sequenceKeys[0].startsWith('target-key::seq::resolve-target-seq::')).toBe(true);
    });

    test('auto-generates effectId for sequence effects that lack one', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'gen-effectid-seq',
        effects: [{ key: 'source-key' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const seqEffect = (
        instance.dataCache.interactions['source-key'].triggers[0].sequences?.[0] as SequenceConfig
      ).effects[0] as { effectId?: string };

      expect(typeof seqEffect.effectId).toBe('string');
      expect(seqEffect.effectId).toBeTruthy();
    });

    test('does not create cross-element entry when sequence effect targets same key as source', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'same-target-seq',
        effects: [{ effectId: 'effect-source', key: 'source-key' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
          effects: [{ effectId: 'effect-source' }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });

      expect(Object.keys(instance.dataCache.interactions)).toEqual(['source-key']);
      expect(Object.keys(instance.dataCache.interactions['source-key'].sequences)).toHaveLength(0);
    });

    test('handles interaction with sequences but no effects', () => {
      const inlineSequence: SequenceConfig = {
        sequenceId: 'no-effects-seq',
        effects: [{ effectId: 'effect-target', key: 'target-key' }],
      };
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [inlineSequence],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const trigger = instance.dataCache.interactions['source-key'].triggers[0];

      expect(trigger.effects).toBeUndefined();
      expect(trigger.sequences).toHaveLength(1);
      expect((trigger.sequences?.[0] as SequenceConfig).sequenceId).toBe('no-effects-seq');
      expect(instance.dataCache.interactions['target-key']).toBeDefined();
    });
  });

  describe('Sequence processing via add() -- source element', () => {
    test('creates Sequence when source element is added with viewEnter trigger', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'viewEnter',
          key: 'source-key',
          sequences: [{ sequenceId: 'view-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const { element } = createInteractElement();
      addElement(element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(getSequenceMock).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceId: 'view-seq' }),
        expect.any(Array),
        { reducedMotion: false },
      );
    });

    test('creates Sequence when source element is added with click trigger', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'click-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const { element } = createInteractElement();
      addElement(element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(getSequenceMock).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceId: 'click-seq' }),
        expect.any(Array),
        { reducedMotion: false },
      );
    });

    test('passes correct AnimationGroupArgs built from effect definitions', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config: InteractConfig = {
        effects: {
          'fade-effect': {
            keyframeEffect: {
              name: 'fade',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 300,
          },
          'slide-effect': {
            keyframeEffect: {
              name: 'slide',
              keyframes: [{ transform: 'translateX(-20px)' }, { transform: 'translateX(0)' }],
            },
            duration: 500,
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'source-key',
            sequences: [
              {
                sequenceId: 'args-seq',
                delay: 25,
                offset: 10,
                effects: [
                  { effectId: 'fade-effect', key: 'source-key' },
                  { effectId: 'slide-effect', key: 'source-key' },
                ],
              },
            ],
          },
        ],
      };

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [sequenceOptions, animationGroupArgs] = getSequenceMock.mock.calls[0];
      const groupArgs = Array.isArray(animationGroupArgs)
        ? animationGroupArgs
        : [animationGroupArgs];

      expect(sequenceOptions).toEqual(
        expect.objectContaining({
          sequenceId: 'args-seq',
          delay: 25,
          offset: 10,
        }),
      );
      expect(groupArgs).toHaveLength(2);
      expect(groupArgs[0]).toEqual(
        expect.objectContaining({
          target: source.child,
          options: expect.objectContaining({
            duration: 300,
            keyframeEffect: expect.objectContaining({ name: 'fade' }),
          }),
        }),
      );
      expect(groupArgs[1]).toEqual(
        expect.objectContaining({
          target: source.child,
          options: expect.objectContaining({
            duration: 500,
            keyframeEffect: expect.objectContaining({ name: 'slide' }),
          }),
        }),
      );
    });

    test('resolves effectId references from config.effects', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config: InteractConfig = {
        effects: {
          'registered-effect': {
            keyframeEffect: {
              name: 'registered',
              keyframes: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
            },
            duration: 750,
            easing: 'ease-in-out',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'source-key',
            sequences: [
              {
                sequenceId: 'resolve-seq',
                effects: [{ effectId: 'registered-effect' }],
              },
            ],
          },
        ],
      };

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [, animationGroupArgs] = getSequenceMock.mock.calls[0];
      const groupArgs = Array.isArray(animationGroupArgs)
        ? animationGroupArgs
        : [animationGroupArgs];
      expect(groupArgs[0].options).toEqual(
        expect.objectContaining({
          duration: 750,
          easing: 'ease-in-out',
          keyframeEffect: expect.objectContaining({ name: 'registered' }),
        }),
      );
    });

    test('skips sequence when target controller is not yet registered', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'missing-target-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).not.toHaveBeenCalled();
    });

    test('does not duplicate sequence on re-add (caching via addedInteractions)', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'no-dup-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const controller = addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      // Simulate a second add without clearing state (e.g. element re-observed)
      controller.connected = false;
      controller.connect('source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
    });

    test('passes pre-created Sequence as animation option to trigger handler', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const mockSequence = {
        play: vi.fn(),
        cancel: vi.fn(),
        onFinish: vi.fn(),
        pause: vi.fn(),
        reverse: vi.fn(),
        progress: vi.fn(),
        persist: vi.fn(),
        isCSS: false,
        playState: 'idle',
        ready: Promise.resolve(),
        animations: [],
        animationGroups: [],
      };
      getSequenceMock.mockReturnValueOnce(mockSequence as any);
      const clickAddSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'precreated-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const interactionCall = clickAddSpy.mock.calls.find((call) => call[4]?.animation);
      expect(interactionCall).toBeDefined();
      // Source and target are both the sourceController.element
      expect(interactionCall?.[0]).toBe(source.element);
      expect(interactionCall?.[1]).toBe(source.element);
      expect(interactionCall?.[4]).toEqual(
        expect.objectContaining({
          animation: mockSequence,
          reducedMotion: false,
          allowA11yTriggers: expect.any(Boolean),
        }),
      );
    });

    test('passes selectorCondition to handler options', () => {
      const clickAddSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
      const config = createBaseConfig();
      config.conditions = {
        activeOnly: {
          type: 'selector',
          predicate: '.is-active &',
        },
      };
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          conditions: ['activeOnly'],
          sequences: [{ sequenceId: 'selector-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const interactionCall = clickAddSpy.mock.calls.find((call) => call[4]?.animation);
      expect(interactionCall?.[4]).toEqual(
        expect.objectContaining({
          selectorCondition: '.is-active &',
        }),
      );
    });

    test('silently skips unresolved sequenceId reference at runtime', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'missing-sequence-ref' }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      expect(() => addElement(source.element, 'source-key')).not.toThrow();

      expect(getSequenceMock).not.toHaveBeenCalled();
    });

    test('skips entire sequence when any effect target element is missing', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'partial-missing-seq',
              effects: [
                { effectId: 'effect-source' },
                { effectId: 'effect-target', key: 'target-key' },
              ],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).not.toHaveBeenCalled();
    });
  });

  describe('Sequence processing via addEffectsForTarget() -- cross-element', () => {
    test('creates Sequence when target element is added after source', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'cross-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();

      addElement(source.element, 'source-key');
      expect(getSequenceMock).not.toHaveBeenCalled();

      addElement(target.element, 'target-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(getSequenceMock).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceId: 'cross-seq' }),
        expect.any(Array),
        { reducedMotion: false },
      );
    });

    test('creates Sequence when source element is added after target', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'source-after-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();

      addElement(target.element, 'target-key');
      expect(getSequenceMock).not.toHaveBeenCalled();

      addElement(source.element, 'source-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(getSequenceMock).toHaveBeenCalledWith(
        expect.objectContaining({ sequenceId: 'source-after-seq' }),
        expect.any(Array),
        { reducedMotion: false },
      );
    });

    test('does not duplicate sequence when both orderings attempt creation', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'dedup-seq',
              effects: [
                { effectId: 'effect-source', key: 'source-key' },
                { effectId: 'effect-target', key: 'target-key' },
              ],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();

      addElement(source.element, 'source-key');
      expect(getSequenceMock).not.toHaveBeenCalled();

      addElement(target.element, 'target-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
    });

    test('resolves correct target elements when effects target different keys', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'multi-target-seq',
              effects: [
                { effectId: 'effect-source', key: 'source-key' },
                { effectId: 'effect-target', key: 'target-key' },
              ],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();

      addElement(source.element, 'source-key');
      addElement(target.element, 'target-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [sequenceOptions, animationGroupArgs] = getSequenceMock.mock.calls[0];
      expect(sequenceOptions).toEqual(expect.objectContaining({ sequenceId: 'multi-target-seq' }));
      expect(animationGroupArgs).toHaveLength(2);
      expect(animationGroupArgs).toEqual([
        expect.objectContaining({ target: source.child }),
        expect.objectContaining({ target: target.child }),
      ]);
    });

    test('passes sequence as animation to trigger handler on source element', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const mockSequence = {
        play: vi.fn(),
        cancel: vi.fn(),
        onFinish: vi.fn(),
        pause: vi.fn(),
        reverse: vi.fn(),
        progress: vi.fn(),
        persist: vi.fn(),
        isCSS: false,
        playState: 'idle',
        ready: Promise.resolve(),
        animations: [],
        animationGroups: [],
      };
      getSequenceMock.mockReturnValueOnce(mockSequence as any);
      const clickAddSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'handler-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();
      addElement(source.element, 'source-key');
      addElement(target.element, 'target-key');

      const interactionCall = clickAddSpy.mock.calls.find((call) => call[4]?.animation);
      expect(interactionCall).toBeDefined();
      expect(interactionCall?.[0]).toBe(source.element);
      expect(interactionCall?.[1]).toBe(source.element);
      expect(interactionCall?.[4]).toEqual(expect.objectContaining({ animation: mockSequence }));
    });

    test('skips variation when interaction-level MQL does not match and falls through to next variation', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const originalMatchMedia = window.matchMedia;
      const mqlTrue = {
        matches: true,
        media: '(min-width: 1px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
      const mqlFalse = {
        matches: false,
        media: '(min-width: 99999px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
      const matchMediaMock = vi.fn((query: string) =>
        query.includes('99999px') ? mqlFalse : mqlTrue,
      );
      Object.defineProperty(window, 'matchMedia', {
        value: matchMediaMock,
        writable: true,
        configurable: true,
      });
      const config = createBaseConfig();
      config.conditions = {
        never: { type: 'media', predicate: 'min-width: 99999px' },
        always: { type: 'media', predicate: 'min-width: 1px' },
      };
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          conditions: ['never'],
          sequences: [
            {
              sequenceId: 'mql-fallback-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      const target = createInteractElement();
      addElement(source.element, 'source-key');

      const seqKey = Object.keys(instance.dataCache.interactions['target-key'].sequences)[0];
      instance.dataCache.interactions['target-key'].sequences[seqKey] = [
        {
          key: 'source-key',
          trigger: 'click',
          conditions: ['never'],
          sequence: {
            sequenceId: 'mql-fallback-seq',
            effects: [{ effectId: 'effect-target', key: 'target-key' }],
          },
        },
        {
          key: 'source-key',
          trigger: 'click',
          conditions: ['always'],
          sequence: {
            sequenceId: 'mql-fallback-seq',
            effects: [{ effectId: 'effect-target', key: 'target-key' }],
          },
        },
      ];

      addElement(target.element, 'target-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(matchMediaMock).toHaveBeenCalled();
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        writable: true,
        configurable: true,
      });
    });

    test('skips when source controller is not yet registered', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'source-missing-seq',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const target = createInteractElement();
      addElement(target.element, 'target-key');

      expect(getSequenceMock).not.toHaveBeenCalled();
    });

    test('addEffectsForTarget returns true when sequences exist even without effects', () => {
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'has-sequences-only',
              effects: [{ effectId: 'effect-target', key: 'target-key' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const target = createInteractElement();
      const targetController = addElement(target.element, 'target-key');

      expect(targetController.connected).toBe(true);
    });
  });

  describe('Sequence with listContainer', () => {
    function createListConfig(overrides?: Partial<InteractConfig>): InteractConfig {
      return {
        effects: {
          'list-effect': {
            key: 'list-key',
            listContainer: '#my-list',
            keyframeEffect: {
              name: 'listFade',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 200,
          },
          'non-list-effect': {
            keyframeEffect: {
              name: 'nonList',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 300,
          },
        },
        interactions: [],
        ...overrides,
      };
    }

    function createListElement(listSelector: string) {
      const element = document.createElement('interact-element') as HTMLElement;
      const child = document.createElement('div');
      const list = document.createElement('ul');
      list.id = listSelector.replace('#', '');
      child.append(list);
      element.append(child);
      return { element, child, list };
    }

    function createListItems(count: number): HTMLElement[] {
      return Array.from({ length: count }, () => document.createElement('li'));
    }

    test('creates Sequence for each list item when source has listContainer', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'list-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const items = createListItems(3);
      items.forEach((li) => list.append(li));

      addElement(element, 'list-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [seqOptions, animationGroupArgs] = getSequenceMock.mock.calls[0];
      const groupArgs = Array.isArray(animationGroupArgs)
        ? animationGroupArgs
        : [animationGroupArgs];
      expect(seqOptions).toEqual(expect.objectContaining({ sequenceId: 'list-seq' }));
      expect(groupArgs).toHaveLength(1);
      expect(groupArgs[0].target).toEqual(items);
    });

    test('addListItems inserts groups into existing cached Sequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const createAnimationGroupsMock = vi.mocked(createAnimationGroups);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'list-add-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const initialItems = createListItems(2);
      initialItems.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cachedSequence = getSequenceMock.mock.results[0].value;

      const newItems1 = createListItems(1);
      newItems1.forEach((li) => list.append(li));
      addListItems(controller, '#my-list', newItems1);

      // Should NOT create a new Sequence
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      // Should call createAnimationGroups for the new items
      expect(createAnimationGroupsMock).toHaveBeenCalled();
      // Should call addGroups on the cached Sequence
      expect(cachedSequence.addGroups).toHaveBeenCalled();

      // Only 1 entry in cache
      const cacheKeys = Array.from(Interact.sequenceCache.keys());
      const seqCacheKeys = cacheKeys.filter((k) => k.includes('list-add-seq'));
      expect(seqCacheKeys.length).toBe(1);
    });

    test('handles removing list items via removeListItems and subsequent re-add', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const createAnimationGroupsMock = vi.mocked(createAnimationGroups);
      const clickRemoveSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'remove');
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'remove-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const items = createListItems(2);
      items.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cachedSequence = getSequenceMock.mock.results[0].value;

      removeListItems([items[0]]);
      expect(clickRemoveSpy).toHaveBeenCalledWith(items[0]);

      const newItems = createListItems(1);
      newItems.forEach((li) => list.append(li));
      createAnimationGroupsMock.mockClear();
      addListItems(controller, '#my-list', newItems);

      // Re-add should use addGroups, not create a new Sequence
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(createAnimationGroupsMock).toHaveBeenCalled();
      expect(cachedSequence.addGroups).toHaveBeenCalled();
    });

    test('processes sequence effects from listContainer elements', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'process-list-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const items = createListItems(2);
      items.forEach((li) => list.append(li));

      addElement(element, 'list-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [, animationGroupArgs] = getSequenceMock.mock.calls[0];
      const groupArgs = Array.isArray(animationGroupArgs)
        ? animationGroupArgs
        : [animationGroupArgs];
      expect(groupArgs[0].target).toEqual(items);
      expect(groupArgs[0].options).toEqual(
        expect.objectContaining({
          duration: 200,
          keyframeEffect: expect.objectContaining({ name: 'listFade' }),
        }),
      );
    });

    test('does not create duplicate sequence when list items overlap with existing', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'no-dup-list-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const items = createListItems(2);
      items.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      controller.connected = false;
      controller.connect('list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
    });

    test('skips sequence when listElements provided but no effects matched the listContainer', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'no-match-list-seq',
                effects: [{ effectId: 'non-list-effect', key: 'list-key' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const items = createListItems(2);
      items.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      getSequenceMock.mockClear();

      const newItems = createListItems(1);
      newItems.forEach((li) => list.append(li));
      addListItems(controller, '#my-list', newItems);

      expect(getSequenceMock).not.toHaveBeenCalled();
    });

    test('cross-element target: addListItems inserts groups into existing cached Sequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const createAnimationGroupsMock = vi.mocked(createAnimationGroups);
      const config: InteractConfig = {
        effects: {
          'cross-list-effect': {
            key: 'target-list-key',
            listContainer: '#target-list',
            keyframeEffect: {
              name: 'crossListFade',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 250,
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'source-key',
            sequences: [
              {
                sequenceId: 'cross-list-seq',
                effects: [
                  {
                    effectId: 'cross-list-effect',
                    key: 'target-list-key',
                    listContainer: '#target-list',
                  },
                ],
              },
            ],
          },
        ],
      };

      Interact.create(config, { useCustomElement: false });

      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const { element: targetEl, list: targetList } = createListElement('#target-list');
      const initialItems = createListItems(2);
      initialItems.forEach((li) => targetList.append(li));

      const targetController = addElement(targetEl, 'target-list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cachedSequence = getSequenceMock.mock.results[0].value;
      createAnimationGroupsMock.mockClear();

      const newItems = createListItems(1);
      newItems.forEach((li) => targetList.append(li));
      addListItems(targetController, '#target-list', newItems);

      // Should NOT create a new Sequence
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      // Should call addGroups on the cached Sequence
      expect(cachedSequence.addGroups).toHaveBeenCalled();
      expect(createAnimationGroupsMock).toHaveBeenCalled();

      // Only 1 entry in cache
      const cacheKeys = Array.from(Interact.sequenceCache.keys());
      const crossSeqKeys = cacheKeys.filter((k) => k.includes('cross-list-seq'));
      expect(crossSeqKeys.length).toBe(1);
    });

    test('addListItems inserts groups at correct DOM indices when items are added in the middle', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const createAnimationGroupsMock = vi.mocked(createAnimationGroups);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'idx-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const initialItems = createListItems(3);
      initialItems.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cachedSequence = getSequenceMock.mock.results[0].value;
      createAnimationGroupsMock.mockClear();

      const newItem = createListItems(1)[0];
      // Insert at DOM position 1 (between existing items 0 and 1)
      list.insertBefore(newItem, initialItems[1]);
      addListItems(controller, '#my-list', [newItem]);

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(cachedSequence.addGroups).toHaveBeenCalled();
    });

    test('addListItems inserts multiple groups at correct indices when adding multiple items at different positions', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const createAnimationGroupsMock = vi.mocked(createAnimationGroups);
      const config = createListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'list-key',
            listContainer: '#my-list',
            sequences: [
              {
                sequenceId: 'multi-idx-seq',
                effects: [{ effectId: 'list-effect', key: 'list-key', listContainer: '#my-list' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createListElement('#my-list');
      const initialItems = createListItems(3);
      initialItems.forEach((li) => list.append(li));

      const controller = addElement(element, 'list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cachedSequence = getSequenceMock.mock.results[0].value;
      createAnimationGroupsMock.mockClear();

      const newItemA = createListItems(1)[0];
      const newItemB = createListItems(1)[0];
      // Insert newItemA at position 0, newItemB at the end
      list.insertBefore(newItemA, initialItems[0]);
      list.append(newItemB);
      addListItems(controller, '#my-list', [newItemA, newItemB]);

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(cachedSequence.addGroups).toHaveBeenCalled();
      expect(createAnimationGroupsMock).toHaveBeenCalled();
    });
  });

  describe('Sequence removal and cleanup', () => {
    test('remove() cleans up sequence cache entries for the removed key', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'cleanup-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const cacheKeysBefore = Array.from(Interact.sequenceCache.keys());
      expect(cacheKeysBefore.some((k) => k.startsWith('source-key::seq::'))).toBe(true);

      const controller = Interact.getController('source-key')!;
      controller.disconnect({ removeFromCache: true });

      const cacheKeysAfter = Array.from(Interact.sequenceCache.keys());
      expect(cacheKeysAfter.some((k) => k.startsWith('source-key::seq::'))).toBe(false);
    });

    test('Interact.destroy() clears sequenceCache', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'destroy-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(Interact.sequenceCache.size).toBeGreaterThan(0);

      Interact.destroy();

      expect(Interact.sequenceCache.size).toBe(0);
    });

    test('deleteController() removes sequence-related addedInteractions entries', () => {
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'delete-ctrl-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const hadSeqEntry = Object.keys(instance.addedInteractions).some((k) =>
        k.startsWith('source-key::seq::'),
      );
      expect(hadSeqEntry).toBe(true);

      instance.deleteController('source-key');

      const hasSeqEntry = Object.keys(instance.addedInteractions).some((k) =>
        k.startsWith('source-key::seq::'),
      );
      expect(hasSeqEntry).toBe(false);
    });

    test('clearInteractionStateForKey removes sequenceCache entries by key prefix', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [{ sequenceId: 'clear-state-seq', effects: [{ effectId: 'effect-source' }] }],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(
        Array.from(Interact.sequenceCache.keys()).some((k) => k.startsWith('source-key::seq::')),
      ).toBe(true);
      expect(
        Object.keys(instance.addedInteractions).some((k) => k.startsWith('source-key::seq::')),
      ).toBe(true);

      instance.clearInteractionStateForKey('source-key');

      expect(
        Array.from(Interact.sequenceCache.keys()).some((k) => k.startsWith('source-key::seq::')),
      ).toBe(false);
      expect(
        Object.keys(instance.addedInteractions).some((k) => k.startsWith('source-key::seq::')),
      ).toBe(false);
    });
  });

  describe('Interact.getSequence caching', () => {
    test('returns cached Sequence for same cacheKey', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const sequenceOptions = { sequenceId: 'cache-hit', delay: 0, offset: 100 };
      const animationGroupArgs: any[] = [{ target: null, options: {} }];

      const first = Interact.getSequence('key-A', sequenceOptions, animationGroupArgs);
      const second = Interact.getSequence('key-A', sequenceOptions, animationGroupArgs);

      expect(first).toBe(second);
      expect(getSequenceMock).toHaveBeenCalledTimes(1);
    });

    test('creates new Sequence for different cacheKey', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const mockSeqA = { play: vi.fn(), animations: [] } as any;
      const mockSeqB = { play: vi.fn(), animations: [] } as any;
      getSequenceMock.mockReturnValueOnce(mockSeqA).mockReturnValueOnce(mockSeqB);
      const sequenceOptions = { sequenceId: 'cache-miss', delay: 0, offset: 50 };
      const animationGroupArgs: any[] = [{ target: null, options: {} }];

      const first = Interact.getSequence('key-B', sequenceOptions, animationGroupArgs);
      const second = Interact.getSequence('key-C', sequenceOptions, animationGroupArgs);

      expect(first).toBe(mockSeqA);
      expect(second).toBe(mockSeqB);
      expect(first).not.toBe(second);
      expect(getSequenceMock).toHaveBeenCalledTimes(2);
    });

    test('passes sequenceOptions and animationGroupArgs to motion getSequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const sequenceOptions = { sequenceId: 'fwd-args', delay: 15, offset: 200 };
      const target = {} as HTMLElement;
      const animationGroupArgs: any[] = [
        { target, options: { duration: 300, keyframeEffect: { name: 'fade' } } },
      ];
      const context = { reducedMotion: true };

      Interact.getSequence('key-D', sequenceOptions, animationGroupArgs, context);

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      expect(getSequenceMock).toHaveBeenCalledWith(sequenceOptions, animationGroupArgs, context);
    });
  });

  describe('Media query conditions on sequences', () => {
    let mockMQLs: Map<string, MediaQueryList>;

    function mockMatchMedia(matchingQueries: string[] = []) {
      mockMQLs = new Map();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn((query: string) => {
          const matches = matchingQueries.includes(query);
          const mql = {
            matches,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          } as unknown as MediaQueryList;

          mockMQLs.set(query, mql);
          return mql;
        }),
      });
    }

    test('skips sequence when sequence-level condition does not match', () => {
      mockMatchMedia([]);
      const getSequenceMock = vi.mocked(getSequence);
      const config = createBaseConfig();
      config.conditions = {
        wideOnly: { type: 'media', predicate: 'min-width: 1024px' },
      };
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'mql-seq',
              conditions: ['wideOnly'],
              effects: [{ effectId: 'effect-source' }],
            },
          ],
        },
      ];

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).not.toHaveBeenCalled();
    });

    test('skips individual effect within sequence when effect-level condition does not match', () => {
      mockMatchMedia(['(min-width: 1px)']);
      const getSequenceMock = vi.mocked(getSequence);
      const config: InteractConfig = {
        effects: {
          'always-effect': {
            keyframeEffect: {
              name: 'always',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 300,
          },
          'conditional-effect': {
            keyframeEffect: {
              name: 'conditional',
              keyframes: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
            },
            duration: 400,
            conditions: ['wideOnly'],
          },
        },
        conditions: {
          wideOnly: { type: 'media', predicate: 'min-width: 99999px' },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'source-key',
            sequences: [
              {
                sequenceId: 'partial-mql-seq',
                effects: [
                  { effectId: 'always-effect', key: 'source-key' },
                  { effectId: 'conditional-effect', key: 'source-key', conditions: ['wideOnly'] },
                ],
              },
            ],
          },
        ],
      };

      Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);
      const [, animationGroupArgs] = getSequenceMock.mock.calls[0];
      const groupArgs = Array.isArray(animationGroupArgs)
        ? animationGroupArgs
        : [animationGroupArgs];
      expect(groupArgs).toHaveLength(1);
      expect(groupArgs[0].options).toEqual(
        expect.objectContaining({
          duration: 300,
          keyframeEffect: expect.objectContaining({ name: 'always' }),
        }),
      );
    });

    test('sets up media query listener for sequence conditions', () => {
      mockMatchMedia(['(min-width: 1024px)']);
      const config = createBaseConfig();
      config.conditions = {
        wideOnly: { type: 'media', predicate: 'min-width: 1024px' },
      };
      config.interactions = [
        {
          trigger: 'click',
          key: 'source-key',
          sequences: [
            {
              sequenceId: 'listener-seq',
              conditions: ['wideOnly'],
              effects: [{ effectId: 'effect-source' }],
            },
          ],
        },
      ];

      const instance = Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const listenerKeys = Array.from(instance.mediaQueryListeners.keys());
      const seqListenerKey = listenerKeys.find(
        (k) => k.includes('seq') && k.includes('listener-seq'),
      );
      expect(seqListenerKey).toBeDefined();

      const listener = instance.mediaQueryListeners.get(seqListenerKey!);
      expect(listener).toBeDefined();
      expect(listener!.mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('sets up media query listener for effect-level conditions within sequence', () => {
      mockMatchMedia(['(min-width: 768px)']);
      const config: InteractConfig = {
        effects: {
          'cond-effect': {
            keyframeEffect: {
              name: 'condEffect',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 300,
            conditions: ['tabletUp'],
          },
        },
        conditions: {
          tabletUp: { type: 'media', predicate: 'min-width: 768px' },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'source-key',
            sequences: [
              {
                sequenceId: 'eff-listener-seq',
                effects: [{ effectId: 'cond-effect', key: 'source-key', conditions: ['tabletUp'] }],
              },
            ],
          },
        ],
      };

      const instance = Interact.create(config, { useCustomElement: false });
      const source = createInteractElement();
      addElement(source.element, 'source-key');

      const listenerKeys = Array.from(instance.mediaQueryListeners.keys());
      const effectListenerKey = listenerKeys.find(
        (k) => k.includes('eff-listener-seq') && k.includes('cond-effect'),
      );
      expect(effectListenerKey).toBeDefined();

      const listener = instance.mediaQueryListeners.get(effectListenerKey!);
      expect(listener).toBeDefined();
      expect(listener!.mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('elementSequenceMap and removeFromSequences', () => {
    function createSeqListConfig(overrides?: Partial<InteractConfig>): InteractConfig {
      return {
        effects: {
          'seq-list-effect': {
            key: 'seq-list-key',
            listContainer: '#seq-list',
            keyframeEffect: {
              name: 'seqListFade',
              keyframes: [{ opacity: 0 }, { opacity: 1 }],
            },
            duration: 200,
          },
        },
        interactions: [],
        ...overrides,
      };
    }

    function createSeqListElement(listSelector: string) {
      const element = document.createElement('interact-element') as HTMLElement;
      const child = document.createElement('div');
      const list = document.createElement('ul');
      list.id = listSelector.replace('#', '');
      child.append(list);
      element.append(child);
      return { element, child, list };
    }

    function createSeqListItems(count: number): HTMLElement[] {
      return Array.from({ length: count }, () => document.createElement('li'));
    }

    test('elementSequenceMap is populated when Sequence is created via getSequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'elem-map-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const items = createSeqListItems(3);
      items.forEach((li) => list.append(li));

      addElement(element, 'seq-list-key');

      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      for (const item of items) {
        const sequences = Interact.elementSequenceMap.get(item);
        expect(sequences).toBeDefined();
        expect(sequences!.size).toBeGreaterThan(0);
      }
    });

    test('elementSequenceMap is populated when groups are added via addToSequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'elem-map-add-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const initialItems = createSeqListItems(2);
      initialItems.forEach((li) => list.append(li));

      const controller = addElement(element, 'seq-list-key');
      expect(getSequenceMock).toHaveBeenCalledTimes(1);

      const newItems = createSeqListItems(2);
      newItems.forEach((li) => list.append(li));
      addListItems(controller, '#seq-list', newItems);

      for (const item of newItems) {
        const sequences = Interact.elementSequenceMap.get(item);
        expect(sequences).toBeDefined();
        expect(sequences!.size).toBeGreaterThan(0);
      }
    });

    test('removeFromSequences calls removeGroups on the correct Sequence', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const mockSeq =
        getSequenceMock.mock.results[0]?.value ??
        getSequenceMock({ delay: 0, offset: 100 }, [{ target: null, options: {} }]);
      const removeGroupsSpy = mockSeq.removeGroups;
      if (!removeGroupsSpy) {
        (mockSeq as any).removeGroups = vi.fn().mockReturnValue([]);
      }

      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'remove-from-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const items = createSeqListItems(3);
      items.forEach((li) => list.append(li));

      addElement(element, 'seq-list-key');

      expect(getSequenceMock).toHaveBeenCalled();

      const cachedSequence =
        getSequenceMock.mock.results[getSequenceMock.mock.results.length - 1].value;

      removeListItems([items[1]]);

      expect(cachedSequence.removeGroups).toHaveBeenCalled();
    });

    test('removeFromSequences deletes element from elementSequenceMap', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'delete-map-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const items = createSeqListItems(3);
      items.forEach((li) => list.append(li));

      addElement(element, 'seq-list-key');
      expect(getSequenceMock).toHaveBeenCalled();

      // Before removal, element should be in map
      expect(Interact.elementSequenceMap.has(items[0])).toBe(true);

      removeListItems([items[0]]);

      expect(Interact.elementSequenceMap.has(items[0])).toBe(false);
    });

    test('removeListItems triggers removeFromSequences for removed elements', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const clickRemoveSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'remove');
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'integration-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const items = createSeqListItems(3);
      items.forEach((li) => list.append(li));

      addElement(element, 'seq-list-key');
      expect(getSequenceMock).toHaveBeenCalled();

      const cachedSequence =
        getSequenceMock.mock.results[getSequenceMock.mock.results.length - 1].value;

      removeListItems([items[0], items[2]]);

      expect(clickRemoveSpy).toHaveBeenCalledWith(items[0]);
      expect(clickRemoveSpy).toHaveBeenCalledWith(items[2]);
      expect(cachedSequence.removeGroups).toHaveBeenCalled();
    });

    test('removeFromSequences is a no-op for elements not in any Sequence', () => {
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            sequences: [
              {
                sequenceId: 'noop-seq',
                effects: [{ effectId: 'seq-list-effect', key: 'seq-list-key' }],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });

      const randomElement = document.createElement('div');
      expect(() => {
        Interact.removeFromSequences([randomElement]);
      }).not.toThrow();
    });

    test('elementSequenceMap is reset on Interact.destroy()', () => {
      const getSequenceMock = vi.mocked(getSequence);
      const config = createSeqListConfig({
        interactions: [
          {
            trigger: 'click',
            key: 'seq-list-key',
            listContainer: '#seq-list',
            sequences: [
              {
                sequenceId: 'destroy-map-seq',
                effects: [
                  { effectId: 'seq-list-effect', key: 'seq-list-key', listContainer: '#seq-list' },
                ],
              },
            ],
          },
        ],
      });

      Interact.create(config, { useCustomElement: false });
      const { element, list } = createSeqListElement('#seq-list');
      const items = createSeqListItems(2);
      items.forEach((li) => list.append(li));

      addElement(element, 'seq-list-key');
      expect(getSequenceMock).toHaveBeenCalled();

      // Items should be in map before destroy
      expect(Interact.elementSequenceMap.has(items[0])).toBe(true);

      Interact.destroy();

      // After destroy, elementSequenceMap should be replaced (items won't be found)
      expect(Interact.elementSequenceMap.has(items[0])).toBe(false);
    });
  });
});
