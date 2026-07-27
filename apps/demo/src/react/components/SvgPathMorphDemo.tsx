import { Interaction, type InteractConfig } from '@wix/interact/react';
import { useInteractInstance } from '../hooks/useInteractInstance';

const svgPathMorphConfig: InteractConfig = {
  interactions: [
    {
      key: 'svg-path-morph',
      trigger: 'viewEnter',
      effects: [
        {
          effectId: 'svg-path-morph-effect',
          selector: 'path:nth-child(1)',
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

      <Interaction tagName="div" interactKey="svg-path-morph" className="svg-path-morph-stage">
        <svg
          aria-label=""
          role="presentation"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
          data-type="color"
          viewBox="0 0 100 100"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          data-bbox="0 0 100 100"
        >
          <g className="_svgImageSource_1lilf_7" data-type="color">
            <g>
              <path d="m0 0 100 100H0Z" fill="#c0ffee" />
            </g>
          </g>
        </svg>
      </Interaction>

      <p className="svg-path-morph-note">
        The initial <code>d</code> attribute is static. The effect selector targets the nested
        <code>path:nth-child(1)</code>, so Interact applies the keyframes only after
        <code>viewEnter</code>.
      </p>
    </section>
  );
};
