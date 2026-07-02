import { createInteractRef, InteractRef } from './interactRef';
import React from 'react';

type InteractionProps<T extends keyof JSX.IntrinsicElements> = {
  tagName: T;
  interactKey: string;
  children?: React.ReactNode;
} & Omit<JSX.IntrinsicElements[T], 'ref'>;

const Interaction = React.forwardRef(function InteractionRender<
  T extends keyof JSX.IntrinsicElements,
>({ tagName, interactKey, children, ...rest }: InteractionProps<T>, ref: React.Ref<any>) {
  const TagName = tagName as any;
  const interactRefCallback = React.useRef<InteractRef | null>(null);

  if (interactRefCallback.current == null) {
    interactRefCallback.current = createInteractRef(interactKey);
  }

  const combinedRef = React.useCallback(
    (node: Element | null) => {
      // Call the interact ref callback
      const cleanup = interactRefCallback.current?.(node);
      let parentCleanup: (() => void) | undefined;

      // Handle the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          parentCleanup = ref(node) as (() => void) | undefined;
        } else {
          (ref as React.MutableRefObject<any>).current = node;
        }
      }

      // Cleanup for React 19+, this raises a warning in React 18-
      return () => {
        cleanup?.();
        parentCleanup?.();
      };
    },
    [ref],
  );

  return (
    <TagName data-interact-key={interactKey} {...rest} ref={combinedRef}>
      {children}
    </TagName>
  );
});

export { Interaction };
