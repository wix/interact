export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '');
}

export function createTemplate(content: string): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = content;
  return template;
}

export function hasFocusedEditableInside(root: ShadowRoot | null | undefined): boolean {
  if (!root) return false;
  let active: Element | null = root.activeElement;
  while (active) {
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
      return true;
    }
    const nestedRoot = (active as HTMLElement).shadowRoot;
    if (!nestedRoot) return false;
    active = nestedRoot.activeElement;
  }
  return false;
}
