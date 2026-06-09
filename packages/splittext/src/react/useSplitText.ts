import { useEffect, useState, type RefObject } from 'react';
import { splitText } from '../splitText';
import type { SplitTextOptions, SplitTextResult } from '../types';

/**
 * React hook that splits the text content of the element referenced by `ref`.
 * See the README for usage details and SSR/null-return behaviour.
 */
export function useSplitText(
  ref: RefObject<HTMLElement | null>,
  options: SplitTextOptions = {},
): SplitTextResult | null {
  const [result, setResult] = useState<SplitTextResult | null>(null);

  // Serialise only the JSON-safe portion of options so inline object literals
  // don't cause infinite re-runs. Function-valued options are tracked by
  // reference identity in the dependency array below.
  const serializableKey = JSON.stringify(options, (_, v) =>
    typeof v === 'function' ? v.name : v,
  );
  const { bidiResolver, onSplit, segmenter } = options;
  const ignoreFn = typeof options.ignore === 'function' ? options.ignore : null;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const splitResult = splitText(element, options);
    setResult(splitResult);

    return () => {
      splitResult.revert();
      setResult(null);
    };
    // covers all JSON-safe options; function-valued options are tracked by
    // reference identity via the remaining deps.
  }, [ref, serializableKey, bidiResolver, onSplit, segmenter, ignoreFn]);

  return result;
}
