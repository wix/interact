import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Effect, InteractConfig, TriggerType } from '@wix/interact/react';
import { Interaction } from '@wix/interact/react';
import { useInteractInstance } from '../hooks/useInteractInstance';

type EffectOption = 'lift' | 'pulse' | 'tilt';

const easingCatalog = [
  'cubic-bezier(0.4, 0, 0.2, 1)',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'cubic-bezier(0.22, 1, 0.36, 1)',
  'linear',
];

const triggerOptions: TriggerType[] = ['hover', 'click', 'viewEnter'];

const getViewEnterParams = (trigger: TriggerType) => {
  if (trigger === 'viewEnter') {
    return { threshold: 0.6 } as const;
  }
  return undefined;
};

const createEffectConfig = (
  effect: EffectOption,
  duration: number,
  easing: string,
  delay: number,
) => {
  switch (effect) {
    case 'pulse':
      return {
        key: 'demo-card',
        duration,
        delay,
        easing,
        keyframeEffect: {
          name: 'pulse',
          keyframes: [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.95)', opacity: 0.9 },
            { transform: 'scale(1.02)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 },
          ],
        },
      } satisfies Effect;
    case 'tilt':
      return {
        key: 'demo-card',
        duration,
        easing,
        keyframeEffect: {
          name: 'tilt',
          keyframes: [
            { transform: 'rotate3d(1, 0, 0, 0deg)', filter: 'brightness(100%)' },
            { transform: 'rotate3d(1, 0.3, 0, 8deg)', filter: 'brightness(130%)' },
            { transform: 'rotate3d(0, 0, 0, 0deg)', filter: 'brightness(100%)' },
          ],
        },
      } satisfies Effect;
    default:
      return {
        key: 'demo-card',
        transitionProperties: [
          {
            name: 'transform',
            value: 'translateY(-12px)',
            duration,
            delay,
            easing,
          },
          {
            name: 'box-shadow',
            value: '0 25px 60px rgb(59 130 246 / 0.35)',
            duration,
            delay,
            easing,
          },
        ],
      } satisfies Effect;
  }
};

const formatMs = (value: number) => `${value}ms`;

export const Playground = () => {
  const [trigger, setTrigger] = useState<TriggerType>('hover');
  const [duration, setDuration] = useState(320);
  const [delay, setDelay] = useState(40);
  const [easing, setEasing] = useState(easingCatalog[0]);
  const [effect, setEffect] = useState<EffectOption>('lift');

  const effectConfig = useMemo(
    () => createEffectConfig(effect, duration, easing, delay),
    [effect, duration, easing, delay],
  );

  const config = useMemo<InteractConfig>(() => {
    const effectId = 'playground-effect';
    return {
      interactions: [
        {
          key: 'demo-card',
          trigger,
          ...(getViewEnterParams(trigger) ? { params: getViewEnterParams(trigger) } : {}),
          effects: [{ effectId }],
        },
      ],
      effects: {
        [effectId]: {
          ...effectConfig,
          ...(trigger === 'viewEnter' ? { triggerType: 'repeat' as const } : {}),
        },
      },
    };
  }, [effectConfig, trigger]);

  useInteractInstance(config);

  const handleRange =
    (setter: (value: number) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(Number(event.target.value));
    };

  return (
    <div className="demo-grid">
      <section className="panel">
        <p className="scroll-label">Playground Controls</p>
        <div className="control-group">
          <label>
            Trigger
            <span>{trigger}</span>
          </label>
          <select
            value={trigger}
            onChange={(event) => setTrigger(event.target.value as TriggerType)}
          >
            {triggerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>
            Effect
            <span>{effect}</span>
          </label>
          <select
            value={effect}
            onChange={(event) => setEffect(event.target.value as EffectOption)}
          >
            <option value="lift">Lift</option>
            <option value="pulse">Pulse</option>
            <option value="tilt">Tilt</option>
          </select>
        </div>

        <div className="control-group">
          <label>
            Duration
            <span>{formatMs(duration)}</span>
          </label>
          <input
            type="range"
            min="120"
            max="1200"
            step="20"
            value={duration}
            onChange={handleRange(setDuration)}
          />
        </div>

        <div className="control-group">
          <label>
            Delay
            <span>{formatMs(delay)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="400"
            step="20"
            value={delay}
            onChange={handleRange(setDelay)}
          />
        </div>

        <div className="control-group">
          <label>
            Easing
            <span>{easing}</span>
          </label>
          <select value={easing} onChange={(event) => setEasing(event.target.value)}>
            {easingCatalog.map((curve) => (
              <option key={curve} value={curve}>
                {curve}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="panel preview-stage">
        <p className="scroll-label">Live Preview</p>
        <Interaction tagName="div" interactKey="demo-card" className="preview-card">
          <p className="scroll-label">Key demo-card</p>
          <h3>Atomic swap triggers</h3>
          <p>
            Change the trigger or easing to feel the difference immediately. The preview listens to
            the same config schema your product pages will consume.
          </p>
        </Interaction>

        <div className="stacked-scenes">
          <div className="panel">
            <p className="scroll-label">Trigger</p>
            <strong>{trigger}</strong>
          </div>
          <div className="panel">
            <p className="scroll-label">Duration</p>
            <strong>{formatMs(duration)}</strong>
          </div>
          <div className="panel">
            <p className="scroll-label">Easing</p>
            <strong>{easing}</strong>
          </div>
          <div className="panel">
            <p className="scroll-label">Effect</p>
            <strong>{effect}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};
