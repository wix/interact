import { InteractConfig } from '@wix/interact/web';
import { useInteractInstance } from '../hooks/useInteractInstance';

const selectorConditionConfig: InteractConfig = {
  conditions: {
    isEven: {
      type: 'selector',
      predicate: ':nth-child(even)',
    },
    isOdd: {
      type: 'selector',
      predicate: ':nth-child(odd)',
    },
  },
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'selector-demo-container',
      params: {
        threshold: 0.5,
      },
      effects: [
        {
          listContainer: '.selector-demo-grid',
          effectId: 'pulse-effect',
          conditions: ['isEven'],
        },
        {
          listContainer: '.selector-demo-grid',
          effectId: 'spin-effect',
          conditions: ['isOdd'],
        },
      ],
    },
  ],
  effects: {
    'pulse-effect': {
      duration: 1500,
      iterations: Infinity,
      easing: 'ease-in-out',
      triggerType: 'repeat',
      keyframeEffect: {
        name: 'pulse-glow',
        keyframes: [
          { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
          { transform: 'scale(1.08)', boxShadow: '0 0 30px 10px rgba(99, 102, 241, 0.4)' },
          { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
        ],
      },
    },
    'spin-effect': {
      duration: 2000,
      iterations: Infinity,
      easing: 'linear',
      triggerType: 'repeat',
      keyframeEffect: {
        name: 'gentle-spin',
        keyframes: [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(180deg) scale(1.05)' },
          { transform: 'rotate(360deg) scale(1)' },
        ],
      },
    },
  },
};

const elements = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  // nth-child is 1-indexed, so element at index 0 is :nth-child(1) which is odd
  isOddPosition: (i + 1) % 2 === 1,
  label: (i + 1) % 2 === 1 ? 'Odd' : 'Even',
}));

export const SelectorConditionDemo = () => {
  useInteractInstance(selectorConditionConfig);

  return (
    <section className="panel selector-demo-section">
      <p className="scroll-label">Selector Condition Demo</p>
      <div className="selector-demo-header">
        <h3>Selector-Based Conditions</h3>
        <p className="selector-demo-description">
          Same interaction key, different animations selected via <code>:nth-child</code> selectors.
          <br />
          <strong className="odd-label">Odd positions (:nth-child(2n+1))</strong> spin continuously.
          <br />
          <strong className="even-label">Even positions (:nth-child(2n))</strong> pulse with a glow.
        </p>
      </div>

      <interact-element data-interact-key="selector-demo-container">
        <div className="selector-demo-grid">
          {elements.map(({ id, isOddPosition, label }) => (
            <div
              key={id}
              className={`selector-demo-card ${isOddPosition ? 'odd-position' : 'even-position'}`}
            >
              <span className="selector-demo-index">#{id + 1}</span>
              <span className="selector-demo-label">{label}</span>
            </div>
          ))}
        </div>
      </interact-element>
    </section>
  );
};
