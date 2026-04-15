import { InteractConfig, Interaction } from '@wix/interact/react';
import { useEffect, useState } from 'react';
import { useInteractInstance } from '../hooks/useInteractInstance';

const complexConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: 'min-width: 1024px',
    },
    mobile: {
      type: 'media',
      predicate: 'max-width: 767px',
    },
    tabletMinWidth: {
      type: 'media',
      predicate: 'min-width: 768px',
    },
    tabletMaxWidth: {
      type: 'media',
      predicate: 'max-width: 1025px',
    },
  },
  interactions: [
    {
      trigger: 'click',
      key: 'multi-source-1',
      effects: [
        {
          key: 'cascade-target-1',
          effectId: 'desktop-effect',
          conditions: ['desktop'],
        },
        {
          key: 'cascade-target-2',
          effectId: 'tablet-effect',
          conditions: ['tabletMinWidth', 'tabletMaxWidth'],
        },
        {
          key: 'cascade-target-3',
          effectId: 'mobile-effect',
          conditions: ['mobile'],
        },
      ],
    },
  ],
  effects: {
    'desktop-effect': {
      //@ts-ignore
      namedEffect: {
        type: 'SlideIn',
      },
      duration: 1800,
      triggerType: 'repeat',
    },
    'mobile-effect': {
      namedEffect: {
        type: 'BounceIn',
        direction: 'center',
      },
      duration: 1800,
      triggerType: 'repeat',
    },
    'tablet-effect': {
      namedEffect: {
        type: 'FlipIn',
        direction: 'left',
      },
      duration: 1800,
      triggerType: 'repeat',
    },
  },
};

export const ResponsiveDemo = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useInteractInstance(complexConfig);

  return (
    <section className="panel responsive-demo-panel">
      <p className="scroll-label">Responsive Demo</p>
      <div className="responsive-demo-width-display">screen width: {width}px</div>
      <div className="responsive-demo-content">
        <h3 className="responsive-demo-title">Responsive Interactions</h3>
        <p className="responsive-demo-description">
          Resize the window to see different effects on click.
          <br />
          <strong>Desktop (≥1024px):</strong> SlideIn on Target 1<br />
          <strong>Tablet (≥767 and ≤1025px):</strong> FlipIn on Target 2<br />
          <strong>Mobile (≤767px):</strong> BounceIn on Target 3
        </p>

        <div className="responsive-demo-button-wrapper">
          {/* Trigger */}
          <Interaction
            tagName="button"
            interactKey="multi-source-1"
            className="responsive-demo-button"
          >
            Trigger Animation
          </Interaction>
        </div>

        <div className="responsive-demo-targets">
          {/* Target 1 */}
          <div className="responsive-demo-target">
            <p className="responsive-demo-target-label">Desktop Target</p>
            <Interaction
              tagName="div"
              interactKey="cascade-target-1"
              className="responsive-demo-target-card responsive-demo-target-card--desktop"
            >
              Slide In
            </Interaction>
          </div>

          {/* Target 2 */}
          <div className="responsive-demo-target">
            <p className="responsive-demo-target-label">Tablet Target</p>
            <Interaction
              tagName="div"
              interactKey="cascade-target-2"
              className="responsive-demo-target-card responsive-demo-target-card--tablet"
            >
              Flip In
            </Interaction>
          </div>
          {/* Target 3 */}
          <div className="responsive-demo-target">
            <p className="responsive-demo-target-label">Mobile Target</p>
            <Interaction
              tagName="div"
              interactKey="cascade-target-3"
              className="responsive-demo-target-card responsive-demo-target-card--mobile"
            >
              Bounce In
            </Interaction>
          </div>
        </div>
      </div>
    </section>
  );
};
