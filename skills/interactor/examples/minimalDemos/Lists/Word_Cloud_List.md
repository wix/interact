# Word Cloud List

A hover-triggered animation for list items in a flex/carousel, list/repeater, layered composition layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: flex/carousel, list/repeater, layered composition; motion: custom animation

## Markup

```html
<div class="cloud-container">

    <interact-element data-interact-key="item-1" style="left: 29%; top: 26%;">
      <div class="cloud-item" style="--delay: 0s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Instantly generate stunning concept art from basic text prompts and mood boards.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">concept-art</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-2" style="left: 47%; top: 28%;">
      <div class="cloud-item" style="--delay: 0.06s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Apply the visual style of famous artists or your own references to any image.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">style-transfer</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-3" style="left: 61%; top: 23%;">
      <div class="cloud-item" style="--delay: 0.12s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Create hyper-realistic voiceovers using custom cloned voices and emotion tuning.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">voice-clone</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-4" style="left: 75%; top: 33%;">
      <div class="cloud-item" style="--delay: 0.18s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Extract high-fidelity 3D motion data from standard 2D video footage.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">motion-capture</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-5" style="left: 33%; top: 40%;">
      <div class="cloud-item" style="--delay: 0.24s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Produce ready-to-use 3D models and textures for games and virtual environments.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">asset-generation</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-6" style="left: 68%; top: 42%;">
      <div class="cloud-item" style="--delay: 0.30s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Enhance resolution and frame rates of legacy video content using neural networks.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">video-upscale</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-7" style="left: 22%; top: 50%;">
      <div class="cloud-item" style="--delay: 0.36s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Collaborate with an AI assistant to draft, format, and refine screenplays.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">script-writer</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-8" style="left: 50%; top: 47%;">
      <div class="cloud-item" style="--delay: 0.42s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Generate custom sound effects and ambient soundscapes based on visual cues.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">sound-design</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-9" style="left: 33%; top: 61%;">
      <div class="cloud-item" style="--delay: 0.48s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Automatically match color palettes across different scenes and camera profiles.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">color-grading</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-10" style="left: 57%; top: 63%;">
      <div class="cloud-item" style="--delay: 0.54s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Perfectly match character lip movements to localized audio tracks in any language.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">lip-sync</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-11" style="left: 75%; top: 54%;">
      <div class="cloud-item" style="--delay: 0.60s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Create seamless, infinite textures from a single small sample image.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">texture-synthesis</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-12" style="left: 26%; top: 71%;">
      <div class="cloud-item" style="--delay: 0.66s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Quickly visualize shot sequences and camera angles from script text.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">storyboarding</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-13" style="left: 71%; top: 68%;">
      <div class="cloud-item" style="--delay: 0.72s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Capture detailed facial expressions using just a standard webcam.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">facial-mocap</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-14" style="left: 43%; top: 72%;">
      <div class="cloud-item" style="--delay: 0.78s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Change the lighting direction and mood of a 2D image post-render.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">scene-relighting</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-15" style="left: 61%; top: 77%;">
      <div class="cloud-item" style="--delay: 0.84s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Populate backgrounds with intelligent, autonomous AI crowd agents.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">crowd-sim</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-16" style="left: 23%; top: 36%;">
      <div class="cloud-item" style="--delay: 0.90s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Compose dynamic, adaptive background music tailored to video pacing.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">music-score</div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-17" style="left: 50%; top: 33%;">
      <div class="cloud-item" style="--delay: 0.96s;">
        <div class="item-content">
          <div class="item-expanded">
            <div class="item-expanded-inner">
              <p class="item-text">Automatically mask and isolate complex moving subjects from video backgrounds.</p>
              <button class="item-btn">✦ Learn more</button>
            </div>
          </div>
          <div class="item-label">auto-rotoscope</div>
        </div>
      </div>
    </interact-element>

    <div class="footer-hint">Move pointer to explore · Hover to expand</div>
  </div>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #E8E6DD;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .cloud-container {
      position: relative;
      width: 100%;
      height: 100vh;
      cursor: crosshair;
    }

    interact-element {
      position: absolute;
      display: block;
    }

    interact-element:hover {
      z-index: 100 !important;
    }

    .cloud-item {
      translate: -50% -50%;
      scale: 0.35;
      opacity: 0.45;
      border-radius: 12px;
      cursor: crosshair;
      color: #5C5B55;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .item-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .item-expanded {
      width: 280px;
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition:
        max-height 600ms cubic-bezier(0.25, 1, 0.5, 1) 480ms,
        opacity 600ms cubic-bezier(0.25, 1, 0.5, 1) 480ms;
    }

    .cloud-item:hover .item-expanded {
      max-height: 200px;
      opacity: 1;
    }

    .cloud-item:not(:hover) .item-expanded {
      transition:
        max-height 300ms ease-out 0ms,
        opacity 200ms ease-out 0ms;
    }

    .item-expanded-inner {
      padding-bottom: 16px;
    }

    .item-text {
      font-size: 14px;
      color: #A0A09C;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .item-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      background: white;
      color: black;
      padding: 6px 12px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      transition: background-color 200ms;
    }

    .item-btn:hover {
      background: #e5e5e5;
    }

    .item-label {
      font-size: 30px;
      font-family: Georgia, 'Times New Roman', serif;
      letter-spacing: -0.025em;
      white-space: nowrap;
      pointer-events: none;
    }

    .footer-hint {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      color: #7A7871;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      pointer-events: none;
      opacity: 0.5;
      white-space: nowrap;
    }
```

## Interact config

```js
const itemKeys = [
      'item-1', 'item-2', 'item-3', 'item-4', 'item-5',
      'item-6', 'item-7', 'item-8', 'item-9', 'item-10',
      'item-11', 'item-12', 'item-13', 'item-14', 'item-15',
      'item-16', 'item-17'
    ];

const interactions = [];

itemKeys.forEach(key => {
      interactions.push({
        key,
        trigger: 'hover',
        effects: [{
          transition: {
            duration: 500,
            easing: 'ease-out',
            styleProperties: [
              { name: 'background-color', value: '#1C1C1C' },
              { name: 'color', value: '#E8E6DD' },
              { name: 'box-shadow', value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
            ]
          }
        }]
      });
    });

const config = { interactions };
```
