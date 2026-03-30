export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '');
}

export function createTemplate(content: string): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = content;
  return template;
}
