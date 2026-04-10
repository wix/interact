import type { InteractConfig } from '@wix/interact/web';
import { useInteractInstance } from '../hooks/useInteractInstance';

const items = [
  { title: 'Design System', description: 'Unified tokens and components for every surface.' },
  { title: 'Motion Library', description: 'Coordinated keyframe animations with easing control.' },
  {
    title: 'Interaction Layer',
    description: 'Trigger-driven effects tied to scroll, click, and hover.',
  },
  {
    title: 'Sequence Engine',
    description: 'Staggered multi-element orchestration with offset easing.',
  },
  {
    title: 'Config Schema',
    description: 'JSON-serialisable configs for CMS and experimentation.',
  },
  {
    title: 'Analytics Bridge',
    description: 'Automatic visibility and engagement tracking hooks.',
  },
  {
    title: 'Flying Monkeys',
    description: 'Monkeys flying through the air.',
  },
  {
    title: 'Rainbow',
    description: 'Rainbow colors.',
  },
  {
    title: 'Fireworks',
    description: 'Fireworks exploding.',
  },
  {
    title: 'Confetti',
    description: 'Confetti falling from the sky.',
  },
  {
    title: 'Parallax',
    description: 'Parallax scrolling effect.',
  },
  {
    title: 'Glitch',
    description: 'Glitch effect.',
  },
];

const config: InteractConfig = {
  interactions: [
    {
      key: 'entrance-container',
      trigger: 'viewEnter',
      params: { type: 'repeat', threshold: 0.3 },
      sequences: [
        {
          offset: 120,
          offsetEasing: 'quadIn',
          effects: [
            {
              effectId: 'entrance-effect',
              listContainer: '.entrance-card-grid',
            },
          ],
        },
      ],
    },
  ],
  effects: {
    'entrance-effect': {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      keyframeEffect: {
        name: 'entrance-fade',
        keyframes: [
          { transform: 'translateY(40px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
      },
      fill: 'both',
    },
  },
};

export const SequenceEntranceDemo = () => {
  useInteractInstance(config);

  return (
    <section className="panel seq-entrance-section">
      <p className="scroll-label">Staggered Entrance</p>
      <div className="seq-demo-header">
        <h3>ViewEnter Staggered List</h3>
        <p className="seq-demo-description">
          Cards enter the viewport with staggered timing using <code>offset: 80</code> and{' '}
          <code>offsetEasing: &apos;quadIn&apos;</code>. Earlier items appear faster; later items
          ease in gradually. Uses <code>listContainer</code> to target all children of the grid.
        </p>
      </div>

      <interact-element data-interact-key="entrance-container">
        <div className="entrance-card-grid">
          {items.map((item, i) => (
            <div key={i} className="entrance-card">
              <span className="entrance-card-number">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="entrance-card-title">{item.title}</h4>
              <p className="entrance-card-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </interact-element>
    </section>
  );
};
