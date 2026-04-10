import type { InteractConfig } from '@wix/interact/react';
import { Interaction } from '@wix/interact/react';
import { useInteractInstance } from '../hooks/useInteractInstance';

const ITEMS_PER_ROW = 6;
const OFFSET = 120;
const itemIndices = Array.from({ length: ITEMS_PER_ROW }, (_, i) => i);

const easingFns: Record<string, (p: number) => number> = {
  linear: (p) => p,
  quadIn: (p) => p * p,
  sineOut: (p) => Math.sin((p * Math.PI) / 2),
  cubicInOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};

const easingRows = [
  { name: 'linear', label: 'linear' },
  { name: 'quadIn', label: 'quadIn' },
  { name: 'sineOut', label: 'sineOut' },
  { name: 'cubicInOut', label: 'cubicInOut' },
];

const computeDelays = (easingName: string) => {
  const fn = easingFns[easingName] ?? easingFns.linear;
  const last = ITEMS_PER_ROW - 1;
  return Array.from({ length: ITEMS_PER_ROW }, (_, i) =>
    i === 0 ? 0 : Math.round(fn(i / last) * last * OFFSET),
  );
};

const config: InteractConfig = {
  interactions: easingRows.map((row) => ({
    key: `easing-row-${row.name}`,
    trigger: 'hover' as const,
    params: { type: 'repeat' as const },
    sequences: [
      {
        offset: OFFSET,
        offsetEasing: row.name,
        effects: [
          {
            effectId: 'easing-item-effect',
            listContainer: `.easing-items-${row.name}`,
          },
        ],
      },
    ],
  })),
  effects: {
    'easing-item-effect': {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      keyframeEffect: {
        name: 'easing-item-entrance',
        keyframes: [
          { transform: 'translateY(24px) scale(0.9)', opacity: 0 },
          { transform: 'translateY(0) scale(1)', opacity: 1 },
        ],
      },
    },
  },
};

export const SequenceEasingComparison = () => {
  useInteractInstance(config);

  return (
    <section className="panel seq-easing-section">
      <p className="scroll-label">Easing Comparison</p>
      <div className="seq-demo-header">
        <h3>Offset Easing Side-by-Side</h3>
        <p className="seq-demo-description">
          Each row uses a different <code>offsetEasing</code> to distribute the stagger delay across
          the same set of items. Scroll to trigger all rows simultaneously and compare the timing
          curves.
        </p>
      </div>

      <div className="seq-easing-rows">
        {easingRows.map((row) => {
          const delays = computeDelays(row.name);

          return (
            <div key={row.name} className="seq-easing-row">
              <div className="seq-easing-row-label">
                <code>{row.label}</code>
              </div>
              <Interaction tagName="div" interactKey={`easing-row-${row.name}`}>
                <div className={`seq-easing-items easing-items-${row.name}`}>
                  {itemIndices.map((i) => (
                    <div key={i} className="seq-easing-item">
                      <span>{i + 1}</span>
                      <span className="seq-easing-delay">{delays[i]}ms</span>
                    </div>
                  ))}
                </div>
              </Interaction>
            </div>
          );
        })}
      </div>
    </section>
  );
};
