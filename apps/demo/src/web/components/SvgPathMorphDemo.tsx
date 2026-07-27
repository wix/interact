import { type InteractConfig } from '@wix/interact/web';
import { useInteractInstance } from '../hooks/useInteractInstance';

const svgPathMorphConfig: InteractConfig = {
  interactions: [
    {
      key: 'svg-path-morph',
      trigger: 'viewEnter',
      effects: [
        {
          effectId: 'svg-path-morph-effect',
          selector: '[data-morph-layer="0"]',
        },
      ],
    },
  ],
  effects: {
    'svg-path-morph-effect': {
      duration: 2000,
      easing: 'linear',
      iterations: Infinity,
      triggerType: 'once',
      keyframeEffect: {
        name: 'morph-layer-0',
        keyframes: [
          { offset: 0, d: 'path("M 0,0 L 100,100 L 0,100 Z")' },
          { offset: 0.25, d: 'path("M 50,25 L 100,100 L 0,100 Z")' },
          { offset: 0.5, d: 'path("M 100,0 L 100,100 L 0,100 Z")' },
          { offset: 0.75, d: 'path("M 50,25 L 100,100 L 0,100 Z")' },
          { offset: 1, d: 'path("M 0,0 L 100,100 L 0,100 Z")' },
        ],
      },
    },
  },
};

export const SvgPathMorphDemo = () => {
  useInteractInstance(svgPathMorphConfig);

  return (
    <section className="panel svg-path-morph-demo">
      <p className="scroll-label">SVG path morph</p>
      <div className="svg-path-morph-header">
        <div>
          <h3>Static SVG, Interact keyframes</h3>
          <p>
            The static path starts animating when this panel enters view. Interact targets the
            nested path and passes the supplied keyframes to the Web Animations API.
          </p>
        </div>
        <span className="svg-path-morph-status">Keyframes</span>
      </div>

      <interact-element data-interact-key="svg-path-morph">
        <div className="svg-path-morph-stage">
          <svg
            width="240"
            height="240"
            viewBox="0 0 100 100"
            aria-label="Morphing triangle"
            role="img"
          >
            <path data-morph-layer="0" fill="#c0ffee" d="M 0,0 L 100,100 L 0,100 Z" />
          </svg>
        </div>
      </interact-element>

      <p className="svg-path-morph-note">
        The initial <code>d</code> attribute is static. The effect selector targets the nested
        <code>&lt;path&gt;</code>, so Interact applies the keyframes only after <code>viewEnter</code>.
      </p>
    </section>
  );
};
