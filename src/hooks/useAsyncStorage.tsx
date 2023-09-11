import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage(key: string, enabled: boolean = true) {
  const [value, setValue] = useState<string | null>(null);

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

  return [value, setItem] as [typeof value, typeof setItem];
}
