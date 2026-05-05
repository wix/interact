export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function when(condition, content) {
  return condition ? content : '';
}
