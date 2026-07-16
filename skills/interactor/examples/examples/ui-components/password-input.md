# Password Input

A password input with a toggle eye button that animates its lid, pupil, and lashes on click to show or hide the password, scales on hover, and tracks the mouse cursor with a smooth blinking pupil while the eye is open.

**Tags:** hover, click, pageVisible, pointerMove, opacity, transform, toggle, scale, customEffect, input, button

## Markup

```html
<div class="wrapper">
  <div class="pill">
    <label for="input" class="sr-only">Password</label>
    <div class="input-wrap">
      <input
        type="text"
        class="input-field"
        id="input"
        placeholder="33D4 07F2 12EW LJ21"
        autocomplete="off"
        maxlength="19"
        spellcheck="false"
      />
      <div class="mask" id="mask" aria-hidden="true"></div>
    </div>
    <interact-element data-interact-key="eye-btn">
      <button
        type="button"
        class="eye-btn"
        id="eye-btn"
        aria-label="Hide password"
        aria-pressed="false"
        aria-controls="input"
      >
        <svg
          class="eye-svg"
          viewBox="0 0 36 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="eye-clip">
              <path
                d="M6 20C6 20 11 13 18 13C25 13 30 20 30 20C30 20 25 27 18 27C11 27 6 20 6 20Z"
              />
            </clipPath>
          </defs>
          <path
            class="eye-lid"
            d="M6 20C6 20 11 13 18 13C25 13 30 20 30 20C30 20 25 27 18 27C11 27 6 20 6 20Z"
            fill="currentColor"
          />
          <path
            class="eye-curve"
            d="M6 20C6 20 11 27 18 27C25 27 30 20 30 20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g clip-path="url(#eye-clip)">
            <circle
              class="eye-pupil"
              cx="18"
              cy="20"
              r="5"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </g>
          <g class="eyelashes">
            <path d="M10 9.5L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M26 9.5L25 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M18 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
      </button>
    </interact-element>
  </div>
  <div class="lang-warning" id="lang-warning">
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 4.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
    <span>Switch to English</span>
  </div>
</div>
```

## Essential styles

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

interact-element {
  display: contents;
}

.pill {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 300px;
  height: 60px;
  padding: 0 8px 0 24px;
  border-radius: 9999px;
  border: 0.5px solid;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s ease;
}

.pill:hover,
.pill:focus-within {
  border-width: 1.3px;
}

.input-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  font-size: clamp(14px, 1.5vw + 10px, 16px);
  font-weight: 500;
  outline: none;
  letter-spacing: 0.03em;
  padding: 0;
}
.input-field.masked {
  letter-spacing: 0;
}

.mask {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  pointer-events: none;
  user-select: none;
  font-size: clamp(14px, 1.5vw + 10px, 16px);
  letter-spacing: 0;
}

.mask.active {
  display: flex;
}

.mask .dot {
  width: 1ch;
  height: 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mask .dot::after {
  content: '';
  width: 0.45em;
  height: 0.45em;
  border-radius: 50%;
}
.mask .space {
  display: inline-block;
  width: 1ch;
}

.eye-btn {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  padding: 4px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.eye-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.eye-lid {
  transform-origin: 18px 20px;
}
.eyelashes {
  transform-origin: 18px 20px;
}
.eye-curve {
  opacity: 0;
}

.wrapper {
  position: relative;
}

.lang-warning {
  position: absolute;
  top: calc(100% + 14px);
  left: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 400;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 350ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lang-warning.visible {
  opacity: 1;
  transform: translateY(0);
}

.lang-warning svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Interact config

```js
{
  effects: {
    'eye-scale': {
      transition: {
        duration: 200,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        styleProperties: [
          { name: 'transform', value: 'scale(1.05)' }
        ]
      }
    },
    'lid-close': {
      transition: {
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        styleProperties: [
          { name: 'opacity', value: '0' },
          { name: 'transform', value: 'scaleY(0.15)' }
        ]
      }
    },
    'curve-show': {
      transition: {
        duration: 180,
        easing: 'ease-out',
        styleProperties: [
          { name: 'opacity', value: '1' }
        ]
      }
    },
    'pupil-hide': {
      transition: {
        duration: 100,
        easing: 'ease-in-out',
        styleProperties: [
          { name: 'opacity', value: '0' }
        ]
      }
    },
    'lashes-flip': {
      transition: {
        duration: 250,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        styleProperties: [
          { name: 'transform', value: 'translateY(1px) scaleY(-1)' }
        ]
      }
    }
  },
  interactions: [
    {
      key: 'eye-btn',
      trigger: 'hover',
      effects: [{ effectId: 'eye-scale', stateAction: 'toggle' }]
    },
    {
      key: 'eye-btn',
      trigger: 'click',
      effects: [
        { key: 'eye-btn', effectId: 'lid-close', selector: '.eye-lid', stateAction: 'toggle' },
        { key: 'eye-btn', effectId: 'curve-show', selector: '.eye-curve', stateAction: 'toggle' },
        { key: 'eye-btn', effectId: 'pupil-hide', selector: '.eye-pupil', stateAction: 'toggle' },
        { key: 'eye-btn', effectId: 'lashes-flip', selector: '.eyelashes', stateAction: 'toggle' }
      ]
    },
    {
      key: 'eye-btn',
      trigger: 'pageVisible',
      effects: [{
        key: 'eye-btn',
        selector: '.eye-btn',
        triggerType: 'once',
        customEffect: (el) => {
          const lid = el.querySelector('.eye-lid');
          const pupil = el.querySelector('.eye-pupil');
          let tX = 0, tY = 0, sX = 0, sY = 0;

          document.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(Math.hypot(dx, dy) / 120, 1.2);
            tX = Math.cos(angle) * dist;
            tY = Math.sin(angle) * dist;
          });

          (function tick() {
            if (parseFloat(getComputedStyle(lid).opacity) > 0.5) {
              sX += (tX - sX) * 0.12;
              sY += (tY - sY) * 0.12;
              pupil.setAttribute('cx', 18 + sX * 3.5);
              pupil.setAttribute('cy', 20 + sY * 2.2);
            }
            requestAnimationFrame(tick);
          })();

          setTimeout(function blink() {
            if (parseFloat(getComputedStyle(lid).opacity) > 0.5) {
              lid.animate([
                { transform: 'scaleY(1)', offset: 0 },
                { transform: 'scaleY(0.1)', offset: 0.35 },
                { transform: 'scaleY(1)', offset: 1 }
              ], { duration: 150, easing: 'ease-in-out' });
              pupil.animate([
                { opacity: 1, offset: 0 },
                { opacity: 0, offset: 0.3 },
                { opacity: 1, offset: 1 }
              ], { duration: 150 });
            }
            setTimeout(blink, 2400);
          }, 2000);
        }
      }]
    }
  ]
}
```
