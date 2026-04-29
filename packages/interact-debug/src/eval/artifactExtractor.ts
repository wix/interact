import { parseArtifact } from '../artifact';
import type { InteractArtifact } from '../types';

/**
 * Extract an InteractArtifact from raw LLM output.
 *
 * The LLM is instructed to output a complete HTML document, but may
 * wrap it in markdown code fences. This function strips fences and
 * feeds the result to the mixed-blob parser.
 */
export async function extractArtifact(
  rawOutput: string,
): Promise<{ artifact: InteractArtifact } | { error: string }> {
  try {
    const html = stripCodeFences(rawOutput);

    if (!html.includes('<') || !html.includes('data-interact-key')) {
      return {
        error: 'LLM output does not appear to contain HTML with data-interact-key attributes',
      };
    }

    const artifact = await parseArtifact({ type: 'mixed', source: html });
    return { artifact };
  } catch (err) {
    return {
      error: `Artifact parsing failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Strip markdown code fences from LLM output.
 * Handles ```html ... ```, ``` ... ```, and bare output.
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();

  const fenceMatch = trimmed.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) return fenceMatch[1];

  if (trimmed.startsWith('```')) {
    const firstNewline = trimmed.indexOf('\n');
    const lastFence = trimmed.lastIndexOf('```');
    if (firstNewline > 0 && lastFence > firstNewline) {
      return trimmed.slice(firstNewline + 1, lastFence).trim();
    }
  }

  return trimmed;
}
