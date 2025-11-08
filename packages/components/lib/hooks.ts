/**
 * Shared React hooks for Plexus UI components
 *
 * Common hooks that can be used across components
 * to avoid duplication and ensure consistency.
 */

import { useCallback, useRef, useEffect, useState } from "react";

/**
 * Combines multiple refs into a single callback ref.
 * Useful when you need both a local ref and a forwarded ref.
 *
 * @param refs - Array of refs to combine (can be callback refs or ref objects)
 * @returns A callback ref that updates all provided refs
 *
 * @example
 * ```typescript
 * const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
 *   const localRef = useRef<HTMLDivElement>(null);
 *   const combinedRef = useCombinedRef(localRef, ref);
 *
 *   return <div ref={combinedRef}>Content</div>;
 * });
 * ```
 */
export function useCombinedRef<T>(
  ...refs: Array<React.Ref<T> | undefined | null>
): React.RefCallback<T> {
  return useCallback((element: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(element);
      } else {
        // TypeScript doesn't know that ref.current is writable
        (ref as React.MutableRefObject<T | null>).current = element;
      }
    });
  }, refs);
}

/**
 * Returns the previous value of a variable.
 * Useful for comparing current vs previous props/state.
 *
 * @param value - The value to track
 * @returns The previous value (undefined on first render)
 *
 * @example
 * ```typescript
 * const prevCount = usePrevious(count);
 * if (prevCount !== count) {
 *   console.log(`Count changed from ${prevCount} to ${count}`);
 * }
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Debounces a value, only updating after the specified delay.
 * Useful for expensive operations triggered by fast-changing inputs.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Only runs 500ms after user stops typing
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Tracks whether a component is mounted.
 * Useful for preventing state updates on unmounted components.
 *
 * @returns Boolean indicating if component is currently mounted
 *
 * @example
 * ```typescript
 * const isMounted = useIsMounted();
 *
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 * ```
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

/**
 * Memoizes a callback and ensures it's always up to date.
 * Similar to useCallback but with stable reference.
 *
 * @param callback - The callback to memoize
 * @returns Memoized callback with stable reference
 *
 * @example
 * ```typescript
 * const handleClick = useEventCallback(() => {
 *   console.log(someState); // Always gets latest value
 * });
 *
 * // handleClick reference never changes, but always sees latest state
 * ```
 */
export function useEventCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, []) as T;
}
