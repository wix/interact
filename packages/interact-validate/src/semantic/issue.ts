import type { Path, SemanticIssue } from '../types';

export const issue = (
  path: Path,
  domainCode: string,
  message: string,
  severity: SemanticIssue['severity'],
) => ({ code: 'custom', path, message, params: { domainCode }, severity }) as SemanticIssue;
