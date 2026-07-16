# Label

Native checkbox labels reveal a checkmark when selected, while Interact scales their inner content on hover or focus.

**Tags:** interest, hover, checkbox, transform, scale

## Markup

```html
<fieldset class="choices">
  <legend>Skills</legend>
  <div class="choice">
    <input class="choice-input" id="design" name="skills" type="checkbox" checked />
    <interact-element data-interact-key="choice-design">
      <label class="choice-label" for="design">
        <span class="choice-inner"
          ><span class="check-icon" aria-hidden="true">✓</span>Web design</span
        >
      </label>
    </interact-element>
  </div>
  <div class="choice">
    <input class="choice-input" id="development" name="skills" type="checkbox" />
    <interact-element data-interact-key="choice-development">
      <label class="choice-label" for="development">
        <span class="choice-inner"
          ><span class="check-icon" aria-hidden="true">✓</span>App development</span
        >
      </label>
    </interact-element>
  </div>
  <div class="choice">
    <input class="choice-input" id="illustration" name="skills" type="checkbox" />
    <interact-element data-interact-key="choice-illustration">
      <label class="choice-label" for="illustration">
        <span class="choice-inner"
          ><span class="check-icon" aria-hidden="true">✓</span>Illustration</span
        >
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

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.choice {
  position: relative;
}

.choice-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.choice-label {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 1rem;
  cursor: pointer;
}

.choice-inner {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transform: scale(1);
}

.check-icon {
  opacity: 0;
}

.choice-input:checked + interact-element .check-icon {
  opacity: 1;
}

.choice-input:focus-visible + interact-element .choice-label {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

## Interact config

```js
const choiceKeys = ['choice-design', 'choice-development', 'choice-illustration'];

const config = {
  interactions: choiceKeys.map((key) => ({
    key,
    trigger: 'interest',
    effects: [
      {
        selector: '.choice-inner',
        stateAction: 'toggle',
        transition: {
          duration: 200,
          easing: 'ease-out',
          styleProperties: [{ name: 'transform', value: 'scale(1.04)' }],
        },
      },
    ],
  })),
};
```
