import { useState, useEffect } from 'react';

/**
 * Hook generico de debounce.
 * @param {*} value - Valor a debounciar
 * @param {number} delay - Delay em ms
 * @returns {*} Valor debounced
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
