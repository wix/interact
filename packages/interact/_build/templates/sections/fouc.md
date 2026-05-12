## code-inject
**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```
## code-web
**Web (Custom Elements):**

```html
<interact-element data-interact-key="{{meta.fouc.key}}" data-interact-initial="true">
  <section{{meta.fouc.webSectionClass}}>...</section>
</interact-element>
```
## code-react
**React:**

```tsx
<Interaction tagName="section" interactKey="{{meta.fouc.key}}" initial={true}{{meta.fouc.reactClassName}}>
  ...
</Interaction>
```
## code-vanilla
**Vanilla:**

```html
<section data-interact-key="{{meta.fouc.key}}" data-interact-initial="true"{{meta.fouc.webSectionClass}}>...</section>
```
## code-web-rules
**Web (Custom Elements):**

```html
<interact-element data-interact-key="[SOURCE_KEY]" data-interact-initial="true">
  <section>...</section>
</interact-element>
```
## code-react-rules
**React:**

```tsx
<Interaction tagName="section" interactKey="[SOURCE_KEY]" initial={true}>
  ...
</Interaction>
```
## code-vanilla-rules
**Vanilla:**

```html
<section data-interact-key="[SOURCE_KEY]" data-interact-initial="true">...</section>
```
