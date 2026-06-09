import type { SplitTextOptions } from './types';
import { walkTextNodes } from './utils';

/**
 * A line as detected from a single text node: an ordered list of character
 * strings that share the same rendered line.
 */
interface DetectedLine {
  /** Characters belonging to this line. */
  chars: string[];
  /** The text node these characters come from. */
  node: Text;
}

/**
 * Detect rendered lines within a single text node using `Range.getClientRects()`.
 *
 * The algorithm iterates character-by-character, growing a range from the node
 * start to each character position and counting the number of rects returned.
 * Each additional rect indicates a new rendered line.
 *
 * **Safari compatibility:** Safari's `getClientRects()` is sensitive to markup
 * whitespace (raw newlines and multiple spaces each produce an extra rect).
 * The function unconditionally normalises whitespace before measurement and
 * restores the original text afterwards.
 */
export function detectLinesFromTextNode(textNode: Text): DetectedLine[] {
  const originalText = textNode.textContent ?? '';
  const normalised = originalText.trim().replace(/\s+/g, ' ');

  if (!normalised) return [];

  // Apply normalised content for accurate rect measurement
  textNode.textContent = normalised;

  const range = document.createRange();
  range.setStart(textNode, 0);
  const lines: DetectedLine[] = [];
  let currentLine: DetectedLine | null = null;

  for (let i = 0; i < normalised.length; i++) {
    range.setEnd(textNode, i + 1);

    const rects = range.getClientRects();
    const lineIndex = rects.length - 1;

    if (!lines[lineIndex]) {
      currentLine = { chars: [], node: textNode };
      lines.push(currentLine);
    } else {
      currentLine = lines[lineIndex];
    }

    currentLine.chars.push(normalised.charAt(i));
  }

  // Restore original text to leave the node in its pre-measurement state
  textNode.textContent = originalText;

  return lines;
}

/**
 * Detect all rendered lines within `element` by walking its text nodes and
 * applying Range-based line detection to each.
 *
 * Returns an array of trimmed line strings in document order.
 *
 * Notes:
 * - Line detection reads layout (via `getClientRects`) and therefore must run
 *   **before** any DOM mutation that would reflow the element.
 * - When inline elements wrap across line breaks (e.g. a `<span>` that opens on
 *   one line and closes on the next), each text node's lines are detected
 *   independently; merging segments across element boundaries is out of scope.
 */
export function detectLines(
  element: HTMLElement,
  options: Pick<SplitTextOptions, 'ignore'> = {},
): string[] {
  const allLines: string[] = [];

  walkTextNodes(
    element,
    (node) => {
      const detected = detectLinesFromTextNode(node);
      for (const line of detected) {
        const text = line.chars.join('').trim();
        if (text) allLines.push(text);
      }
    },
    options.ignore,
  );

  return allLines;
}
