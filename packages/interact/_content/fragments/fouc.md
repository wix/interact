<!-- #code-inject -->
**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```
<!-- #code-web -->
**Web (Custom Elements):**

```html
<interact-element data-interact-key="{{key}}" data-interact-initial="true">
  <section{{classAttr}}>...</section>
</interact-element>
```
<!-- #code-react -->
**React:**

```tsx
<Interaction tagName="section" interactKey="{{key}}" initial={true}{{classAttr}}>
  ...
</Interaction>
```
<!-- #code-vanilla -->
**Vanilla:**

```html
<section data-interact-key="{{key}}" data-interact-initial="true"{{classAttr}}>...</section>
```
