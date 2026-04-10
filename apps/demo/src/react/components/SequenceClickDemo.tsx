import type { InteractConfig } from '@wix/interact/react';
import { Interaction } from '@wix/interact/react';
import { useInteractInstance } from '../hooks/useInteractInstance';

const config: InteractConfig = {
  interactions: [
    {
      key: 'click-seq-trigger',
      trigger: 'click',
      params: { type: 'alternate' },
      sequences: [
        {
          offset: 150,
          offsetEasing: 'sineOut',
          effects: [
            { effectId: 'heading-effect', key: 'seq-heading' },
            { effectId: 'body-effect', key: 'seq-body' },
            { effectId: 'image-effect', key: 'seq-image' },
          ],
        },
      ],
    },
  ],
  effects: {
    'heading-effect': {
      key: 'seq-heading',
      duration: 600,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      keyframeEffect: {
        name: 'heading-entrance',
        keyframes: [
          { transform: 'translateX(-40px)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 },
        ],
      },
      fill: 'both',
    },
    'body-effect': {
      key: 'seq-body',
      duration: 500,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      keyframeEffect: {
        name: 'body-entrance',
        keyframes: [
          { transform: 'translateY(20px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
      },
      fill: 'both',
    },
    'image-effect': {
      key: 'seq-image',
      duration: 700,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      keyframeEffect: {
        name: 'image-entrance',
        keyframes: [
          { transform: 'scale(0.8) rotate(-5deg)', opacity: 0 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        ],
      },
      fill: 'both',
    },
  },
};

export const SequenceClickDemo = () => {
  useInteractInstance(config);

  return (
    <section className="panel seq-click-section">
      <p className="scroll-label">Click Sequence</p>
      <div className="seq-demo-header">
        <h3>Click-Triggered Orchestration</h3>
        <p className="seq-demo-description">
          Click the button to play a coordinated sequence across three elements. Each uses a
          different <code>keyframeEffect</code>, staggered with <code>offset: 150</code> and{' '}
          <code>offsetEasing: &apos;sineOut&apos;</code>. Click again to reverse.
        </p>
      </div>

      <Interaction tagName="button" interactKey="click-seq-trigger" className="seq-click-button">
        Play Sequence
      </Interaction>

      <div className="seq-click-stage">
        <Interaction tagName="h3" interactKey="seq-heading" className="seq-click-heading">
          Welcome to Sequences
        </Interaction>

        <Interaction tagName="div" interactKey="seq-image" className="seq-click-image">
          <div className="seq-click-image-placeholder">
            <span>◆</span>
          </div>
        </Interaction>

        <Interaction tagName="p" interactKey="seq-body" className="seq-click-body">
          Orchestrate multiple elements with precisely timed stagger offsets. Each piece of content
          enters on its own schedule, creating a natural flow that guides the viewer&apos;s
          attention through the composition.
        </Interaction>
      </div>
    </section>
  );
};
