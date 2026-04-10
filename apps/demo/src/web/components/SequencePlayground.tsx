import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { InteractConfig, TriggerType } from '@wix/interact/web';
import { useInteractInstance } from '../hooks/useInteractInstance';

const CARD_COUNT = 12;
const cardIndices = Array.from({ length: CARD_COUNT }, (_, i) => i);

const easingOptions = ['linear', 'quadIn', 'quadOut', 'sineOut', 'cubicIn', 'cubicOut'];
const triggerOptions: TriggerType[] = ['click', 'viewEnter'];

const getTriggerParams = (trigger: TriggerType) => {
  if (trigger === 'viewEnter') {
    return { type: 'alternate', threshold: 0.9 } as const;
  }
  return { type: 'alternate' } as const;
};

const formatMs = (value: number) => `${value}ms`;

export const SequencePlayground = () => {
  const [trigger, setTrigger] = useState<TriggerType>('click');
  const [offset, setOffset] = useState(80);
  const [offsetEasing, setOffsetEasing] = useState('linear');
  const [delay, setDelay] = useState(0);
  const [duration, setDuration] = useState(400);

  const config = useMemo<InteractConfig>(
    () => ({
      interactions: [
        {
          key: 'seq-playground',
          trigger,
          params: getTriggerParams(trigger),
          sequences: [
            {
              delay,
              offset,
              offsetEasing,
              effects: cardIndices.map((i) => ({
                effectId: 'stagger-effect',
                key: `seq-card-${i}`,
              })),
            },
          ],
        },
      ],
      effects: {
        'stagger-effect': {
          duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          keyframeEffect: {
            name: 'fade-slide-up',
            keyframes: [
              { transform: 'translateY(30px) scale(0.95)', opacity: 0 },
              { transform: 'translateY(0) scale(1)', opacity: 1 },
            ],
          },
          fill: 'both',
        },
      },
    }),
    [trigger, offset, offsetEasing, delay, duration],
  );

  useInteractInstance(config);

  const handleRange = (setter: (v: number) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(Number(e.target.value));
  };

  return (
    <section className="panel seq-playground-section">
      <p className="scroll-label">Sequence Playground</p>
      <div className="seq-demo-header">
        <h3>Stagger Controls</h3>
        <p className="seq-demo-description">
          Tune <code>offset</code>, <code>offsetEasing</code>, and <code>delay</code> to shape the
          stagger timing across a sequence of cards. Click the grid (or scroll it into view) to
          trigger the animation.
        </p>
      </div>

      <div className="demo-grid">
        <div className="panel">
          <p className="scroll-label">Controls</p>

          <div className="control-group">
            <label>
              Trigger
              <span>{trigger}</span>
            </label>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerType)}>
              {triggerOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>
              Offset
              <span>{formatMs(offset)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={offset}
              onChange={handleRange(setOffset)}
            />
          </div>

          <div className="control-group">
            <label>
              Offset Easing
              <span>{offsetEasing}</span>
            </label>
            <select value={offsetEasing} onChange={(e) => setOffsetEasing(e.target.value)}>
              {easingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>
              Delay
              <span>{formatMs(delay)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={delay}
              onChange={handleRange(setDelay)}
            />
          </div>

          <div className="control-group">
            <label>
              Duration
              <span>{formatMs(duration)}</span>
            </label>
            <input
              type="range"
              min="100"
              max="1200"
              step="50"
              value={duration}
              onChange={handleRange(setDuration)}
            />
          </div>
        </div>

        <div>
          <interact-element data-interact-key="seq-playground">
            <div className="seq-card-grid">
              {cardIndices.map((i) => (
                <interact-element key={i} data-interact-key={`seq-card-${i}`}>
                  <div className="seq-card">
                    <span className="seq-card-index">{i + 1}</span>
                    <span className="seq-card-label">Card</span>
                  </div>
                </interact-element>
              ))}
            </div>
          </interact-element>

          <div className="seq-config-display panel">
            <p className="scroll-label">Live Config</p>
            <pre className="seq-config-json">{JSON.stringify(config, null, 2)}</pre>
          </div>
        </div>
      </div>
    </section>
  );
};
