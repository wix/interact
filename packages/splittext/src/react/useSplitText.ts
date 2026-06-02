import { useEffect, useState, type RefObject } from 'react';
import { splitText } from '../splitText';
import type { SplitTextOptions, SplitTextResult } from '../types';

/**
 * React hook that splits the text content of the element referenced by `ref`.
 *
 * Splitting happens after mount (and after every `options` change). The result
 * is `null` on the first render and during SSR. On unmount the element is
 * automatically reverted to its original HTML.
 *
 * ```tsx
 * function Headline() {
 *   const ref = useRef<HTMLHeadingElement>(null);
 *   const result = useSplitText(ref, { type: 'chars' });
 *
 *   useEffect(() => {
 *     if (!result) return;
 *     // animate result.chars …
 *   }, [result]);
 *
 *   return <h1 ref={ref}>Hello World</h1>;
 * }
 * ```
 */
export function useSplitText(
  ref: RefObject<HTMLElement | null>,
  options: SplitTextOptions = {},
): SplitTextResult | null {
  const [result, setResult] = useState<SplitTextResult | null>(null);
  // Serialise options to a stable string so the effect re-runs only when
  // options genuinely change (avoids infinite loops from inline object literals).
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const splitResult = splitText(element, options);
    setResult(splitResult);

    return () => {
      splitResult.revert();
      setResult(null);
    };
    // optionsKey is the serialised version of options — safe to use as dep
  }, [ref, optionsKey]);

  return result;
}
