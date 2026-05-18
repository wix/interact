function escapeCell(text) {
  return String(text).replace(/\|/g, '\\|');
}

export function renderParamsTable(params) {
  if (!params || params.length === 0) return '*No parameters.*';

  const rows = params.map((p) => {
    const name = `\`${p.name}\``;
    const type = `\`${escapeCell(p.type)}\``;
    let def;
    if (p.required === true || p.default === null) {
      def = '**required**';
    } else if (p.default === 'undefined') {
      def = '—';
    } else {
      def = `\`${escapeCell(p.default)}\``;
    }
    return `| ${name} | ${type} | ${def} | ${escapeCell(p.description)} |`;
  });

  return [
    '| Param | Type | Default | Description |',
    '| ----- | ---- | ------- | ----------- |',
    ...rows,
  ].join('\n');
}

export function renderFieldsTable(fields) {
  if (!fields || fields.length === 0) return '*No fields.*';

  const rows = fields.map((f) => {
    const name = `\`${f.name}\``;
    const type = `\`${escapeCell(f.type)}\``;
    const required = f.required ? 'yes' : 'no';
    return `| ${name} | ${type} | ${required} | ${escapeCell(f.description)} |`;
  });

  return [
    '| Field | Type | Required | Description |',
    '| ----- | ---- | -------- | ----------- |',
    ...rows,
  ].join('\n');
}

export function renderValuesTable(values) {
  if (!values || values.length === 0) return '*No values.*';

  const rows = values.map(
    (v) => `| \`'${v.value}'\` | ${escapeCell(v.description)} |`,
  );

  return [
    '| Value | Description |',
    '| ----- | ----------- |',
    ...rows,
  ].join('\n');
}

export function renderCaveatsList(caveats) {
  if (!caveats || caveats.length === 0) return '';
  return caveats.map((c) => `- ⚠️ ${c}`).join('\n');
}

export function renderCode(code) {
  if (!code) return '';
  return `\`\`\`typescript\n${code.trimEnd()}\n\`\`\``;
}

export function renderSignature(signature) {
  if (!signature) return '';
  return `\`${signature}\``;
}

const TEXT_RENDERERS = {
  name: { field: 'name', required: true },
  llm: { field: 'llm', required: true },
  human: { field: 'human', required: true },
  returns: { field: 'returns', required: false },
};

// Computed renderers return fallback text (e.g. "*No parameters.*") when the field is absent,
// rather than erroring — this allows templates to use table renderers on any term safely.
const COMPUTED_RENDERERS = {
  signature: (term) => ({ value: renderSignature(term.signature) }),
  'params-table': (term) => ({ value: renderParamsTable(term.params) }),
  'fields-table': (term) => ({ value: renderFieldsTable(term.fields) }),
  'values-table': (term) => ({ value: renderValuesTable(term.values) }),
  'caveats-list': (term) => ({ value: renderCaveatsList(term.caveats) }),
  code: (term) => ({ value: renderCode(term.code) }),
};

export function resolveRenderer(term, rendererName) {
  const textDef = TEXT_RENDERERS[rendererName];
  if (textDef) {
    const value = term[textDef.field];
    if (textDef.required && !value) {
      return { error: `Term "${term.id}" has no "${textDef.field}" field` };
    }
    return { value: value || '' };
  }

  const computed = COMPUTED_RENDERERS[rendererName];
  if (computed) return computed(term);

  return { error: `Unknown renderer "${rendererName}"` };
}
