import { useCallback, useRef } from 'react';

type AnyFunction = (...args: never[]) => unknown;

/**
 * A debounced version of useCallback that only executes after a specified delay
 * of inactivity.
 *
 * @param callback The function to debounce
 * @param dependencies Array of dependencies, similar to useCallback
 * @param delay The debounce delay in milliseconds
 * @returns A debounced version of the callback function
 */
function useDebounce<TCallback extends AnyFunction>(
  callback: TCallback,
  dependencies: readonly unknown[],
  delay: number,
): (...args: Parameters<TCallback>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<TCallback>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, delay],
  );
}

export default useDebounce;
