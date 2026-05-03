let counter = 0;

export function generateId(prefix = 'pg'): string {
  return `${prefix}-${++counter}`;
}
