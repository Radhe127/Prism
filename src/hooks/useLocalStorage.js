import { useState, useEffect, useCallback } from 'react';

/**
 * Persist a piece of state to localStorage.
 * Values are JSON-serialised so strings, objects, and arrays all work.
 *
 * @param {string} key    Storage key.
 * @param {*}      initialValue Fallback used when nothing is stored yet.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch (err) {
      console.warn(`useLocalStorage: failed to read "${key}"`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: failed to write "${key}"`, err);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return [value, setValue, remove];
}

export default useLocalStorage;
