import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage(key: string, enabled: boolean = true) {
  const [value, setValue] = useState<string | null>(null);
  const isLoading = useRef<boolean>(false);

  useEffect(() => {
    (async () => {
      if (enabled) {
        isLoading.current = true;
        const storedValue = await AsyncStorage.getItem(key);
        isLoading.current = false;
        setValue(() => storedValue);
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

  const returnItem = {
    data: value,
    isLoading: isLoading.current || !enabled,
    isFetched: !isLoading.current && enabled, // TODO: Added to avoid updating lots of files, remove in future PR
  };
  return [returnItem, setItem] as [typeof returnItem, typeof setItem];
}
