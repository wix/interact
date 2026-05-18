export const VALID_CATEGORIES = [
  'trigger',
  'effect-type',
  'config',
  'api',
  'concept',
  'enum',
  'preset',
];

const REQUIRED_TERM_FIELDS = ['id', 'name', 'category', 'llm', 'human'];
const REQUIRED_PARAM_FIELDS = ['name', 'type', 'default', 'description'];
const REQUIRED_FIELD_FIELDS = ['name', 'type', 'required', 'description'];
const REQUIRED_VALUE_FIELDS = ['value', 'description'];
const REQUIRED_META_FIELDS = ['package', 'version', 'lastAudit'];

function checkRequiredKeys(obj, requiredKeys, label) {
  const missing = requiredKeys.filter((k) => !(k in obj));
  if (missing.length > 0) {
    return `${label}: missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

function validateMeta(meta, errors) {
  if (!meta || typeof meta !== 'object') {
    errors.push('Missing or invalid top-level "meta" object');
    return;
  }
  const err = checkRequiredKeys(meta, REQUIRED_META_FIELDS, 'meta');
  if (err) errors.push(err);
}

function validateTermParams(params, termId, errors) {
  params.forEach((param, i) => {
    const err = checkRequiredKeys(
      param,
      REQUIRED_PARAM_FIELDS,
      `term "${termId}" params[${i}]`,
    );
    if (err) errors.push(err);
  });
}

function validateTermFields(fields, termId, errors) {
  fields.forEach((field, i) => {
    const err = checkRequiredKeys(
      field,
      REQUIRED_FIELD_FIELDS,
      `term "${termId}" fields[${i}]`,
    );
    if (err) errors.push(err);
  });
}

function validateTermValues(values, termId, errors) {
  values.forEach((val, i) => {
    const err = checkRequiredKeys(
      val,
      REQUIRED_VALUE_FIELDS,
      `term "${termId}" values[${i}]`,
    );
    if (err) errors.push(err);
  });
}

function validateTerms(terms, errors, warnings) {
  if (!Array.isArray(terms)) {
    errors.push('Missing or invalid top-level "terms" array');
    return;
  }

  const seenIds = new Set();

  terms.forEach((term, i) => {
    const termLabel = term.id ? `term "${term.id}"` : `terms[${i}]`;

    const missingErr = checkRequiredKeys(
      term,
      REQUIRED_TERM_FIELDS,
      termLabel,
    );
    if (missingErr) errors.push(missingErr);

    if (term.category && !VALID_CATEGORIES.includes(term.category)) {
      errors.push(
        `${termLabel}: invalid category "${term.category}" (valid: ${VALID_CATEGORIES.join(', ')})`,
      );
    }

    if (term.id) {
      if (seenIds.has(term.id)) {
        errors.push(`Duplicate term ID: "${term.id}"`);
      }
      seenIds.add(term.id);
    }

    if (term.params && Array.isArray(term.params)) {
      validateTermParams(term.params, term.id ?? i, errors);
    }

    if (term.fields && Array.isArray(term.fields)) {
      validateTermFields(term.fields, term.id ?? i, errors);
    }

    if (term.values && Array.isArray(term.values)) {
      validateTermValues(term.values, term.id ?? i, errors);
    }

    const structuredKeys = ['params', 'fields', 'values'].filter((k) => Array.isArray(term[k]) && term[k].length > 0);
    if (structuredKeys.length > 1) {
      warnings.push(
        `${termLabel}: has multiple structured fields (${structuredKeys.join(', ')}); only one of params/fields/values should be present`,
      );
    }

  });

  const allIds = new Set(terms.filter((t) => t.id).map((t) => t.id));
  terms.forEach((term, i) => {
    if (!Array.isArray(term.related)) return;
    const termLabel = term.id ? `term "${term.id}"` : `terms[${i}]`;
    term.related.forEach((ref) => {
      if (!ref.startsWith('@') && !allIds.has(ref)) {
        warnings.push(
          `${termLabel}: related ref "${ref}" not found in glossary`,
        );
      }
    });
  });
}

export function validateGlossary(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    return { errors: ['Glossary data must be a non-null object'], warnings };
  }

  validateMeta(data.meta, errors);
  validateTerms(data.terms, errors, warnings);

  return { errors, warnings };
}
