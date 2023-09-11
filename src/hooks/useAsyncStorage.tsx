import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage(key: string, enabled: boolean = true) {
  const [value, setValue] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (enabled) {
        const storedValue = await AsyncStorage.getItem(key);
        setValue(storedValue);
      }
    })();
  }, [key, enabled]);

  const setItem = useCallback(
    (newValue: string) => {
      if (newValue !== value && enabled) {
        AsyncStorage?.setItem(key, newValue);
        setValue(() => newValue);
      }
    },
    [key, value, enabled],
  );

  const isLoaded = typeof value !== 'undefined'; // Expect string or null when loaded
  return [value, setItem, isLoaded] as [typeof value, typeof setItem, boolean];
}
