import { MMKV, useMMKVString } from 'react-native-mmkv';

/**
 * Exported for testing purposes only.
 */
export const _store = new MMKV();

/**
 * A `useState`-like hook that persists its values to disk.
 *
 * **IMPORTANT**: data persisted by this hook is stored _unencrypted_.
 */
export function useStoredValue(key: string) {
  return useMMKVString(key, _store);
}
