import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';
import { useSplitText } from '../src/react/index';
import type { SplitTextResult } from '../src/types';

// ---------------------------------------------------------------------------
// Test components
// ---------------------------------------------------------------------------

interface HeadlineProps {
  options?: Parameters<typeof useSplitText>[1];
  onResult?: (result: SplitTextResult | null) => void;
}

function Headline({ options, onResult }: HeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const result = useSplitText(ref, options);

  useEffect(() => {
    onResult?.(result);
  }, [result, onResult]);

  return <h1 ref={ref}>Hello World</h1>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSplitText', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('returns null on the first render (before mount effect)', () => {
    const results: Array<SplitTextResult | null> = [];
    render(<Headline onResult={(r) => results.push(r)} />);
    // First call to onResult (render phase before effect) — may be undefined
    // The hook returns null during SSR / before the effect runs
    expect(results[0]).toBeNull();
  });

  it('returns a SplitTextResult after mount', async () => {
    let capturedResult: SplitTextResult | null = null;
    render(<Headline options={{ type: 'chars' }} onResult={(r) => (capturedResult = r)} />);
    await waitFor(() => expect(capturedResult).not.toBeNull());
    expect(capturedResult!.isSplit).toBe(true);
  });

  it('splits the element text when type is provided', async () => {
    let capturedResult: SplitTextResult | null = null;
    render(<Headline options={{ type: 'chars' }} onResult={(r) => (capturedResult = r)} />);
    await waitFor(() => expect(capturedResult?.isSplit).toBe(true));
    // "Hello World" as chars
    expect(capturedResult!.chars.length).toBeGreaterThan(0);
  });

  it('reverts the DOM on unmount', async () => {
    const { unmount, getByRole } = render(<Headline options={{ type: 'chars' }} />);

    const heading = getByRole('heading');

    await waitFor(() => {
      expect(heading.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    });

    act(() => {
      unmount();
    });

    // After unmount, revert() should have been called → original text restored
    expect(heading.querySelectorAll('.split-c').length).toBe(0);
  });

  it('re-splits when options change', async () => {
    const results: Array<SplitTextResult | null> = [];

    function DynamicHeadline() {
      const ref = useRef<HTMLHeadingElement>(null);
      const [splitType, setSplitType] = useState<'chars' | 'words'>('chars');
      const result = useSplitText(ref, { type: splitType });

      useEffect(() => {
        results.push(result);
      }, [result]);

      return (
        <>
          <h1 ref={ref}>Hello World</h1>
          <button onClick={() => setSplitType('words')}>Switch to words</button>
        </>
      );
    }

    const { getByRole } = render(<DynamicHeadline />);

    await waitFor(() => expect(results.some((r) => r?.isSplit)).toBe(true));
    const firstResult = results.find((r) => r?.isSplit);
    expect(firstResult?.chars.length).toBeGreaterThan(0);

    // Switch to word split
    act(() => {
      getByRole('button').click();
    });

    await waitFor(() => {
      const latest = results[results.length - 1];
      return latest?.isSplit && (latest.words?.length ?? 0) > 0;
    });

    const wordResult = results.find((r) => (r?.words?.length ?? 0) > 0);
    expect(wordResult).toBeDefined();
  });

  it('handles a null ref gracefully (no crash)', async () => {
    function NullRef() {
      const ref = useRef<HTMLHeadingElement>(null);
      // Never attach ref to DOM
      useSplitText(ref, { type: 'chars' });
      return <h1>No ref attached</h1>;
    }

    expect(() => render(<NullRef />)).not.toThrow();
  });

  it('exposes element and originalHTML on the result', async () => {
    let capturedResult: SplitTextResult | null = null;
    render(<Headline options={{ type: 'chars' }} onResult={(r) => (capturedResult = r)} />);
    await waitFor(() => expect(capturedResult?.isSplit).toBe(true));
    expect(capturedResult!.element.tagName).toBe('H1');
    expect(capturedResult!.originalHTML).toBe('Hello World');
  });
});
