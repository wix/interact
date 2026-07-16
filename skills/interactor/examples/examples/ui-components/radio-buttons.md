# Radio Buttons

A native radio group preserves exclusive selection while Interact animates each indicator.

**Tags:** activate, click, interest, hover, radio, transform, scale

## Markup

```html
<fieldset class="radio-group">
  <legend>Notifications</legend>
  <div class="radio-option">
    <input class="radio-input" id="all" name="notifications" type="radio" checked />
    <interact-element data-interact-key="radio-all">
      <label for="all">
        <span class="indicator" aria-hidden="true"><span class="dot"></span></span>
        All activity
      </label>
    </interact-element>
  </div>
  <div class="radio-option">
    <input class="radio-input" id="important" name="notifications" type="radio" />
    <interact-element data-interact-key="radio-important">
      <label for="important">
        <span class="indicator" aria-hidden="true"><span class="dot"></span></span>
        Important only
      </label>
    </interact-element>
  </div>
  <div class="radio-option">
    <input class="radio-input" id="mentions" name="notifications" type="radio" />
    <interact-element data-interact-key="radio-mentions">
      <label for="mentions">
        <span class="indicator" aria-hidden="true"><span class="dot"></span></span>
        Mentions and replies
      </label>
    </interact-element>
  </div>
</fieldset>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.radio-group {
  display: grid;
  gap: 0.5rem;
  max-width: 20rem;
}

.radio-option {
  position: relative;
}

.radio-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.radio-option label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  cursor: pointer;
}

.indicator {
  position: relative;
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid currentColor;
  transform: scale(1);
}

.dot {
  width: 0.55rem;
  height: 0.55rem;
  background: currentColor;
  transform: scale(0);
}

.radio-input:checked + interact-element .dot {
  transform: scale(1);
}

.radio-input:focus-visible + interact-element label {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

## Interact config

```js
const radioKeys = ['radio-all', 'radio-important', 'radio-mentions'];

const config = {
  effects: {
    'indicator-pop': {
      keyframeEffect: {
        name: 'radio-indicator-pop',
        keyframes: [
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)' },
          { transform: 'scale(1)' },
        ],
      },
      duration: 350,
      easing: 'ease-out',
      fill: 'both',
      triggerType: 'repeat',
    },
  },
  interactions: radioKeys.flatMap((key) => [
    {
      key,
      trigger: 'interest',
      effects: [
        {
          selector: '.indicator',
          stateAction: 'toggle',
          transition: {
            duration: 180,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.1)' }],
          },
        },
      ],
    },
    {
      key,
      trigger: 'activate',
      effects: [{ selector: '.indicator', effectId: 'indicator-pop' }],
    },
  ]),
};
```
