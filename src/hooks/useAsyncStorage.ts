import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';

export function useAsyncStorage(key: string) {
  const itemResult = useQuery<string | null>(['async-storage-get', key], () =>
    AsyncStorage.getItem(key),
  );

  const setItem = useCallback(
    (value: string) => {
      if (value !== itemResult.data) {
        AsyncStorage.setItem(key, value).catch((error) =>
          console.error(`[LifeOmicSDK]:${error}`),
        );
      }
    },
    [key, itemResult.data],
  );

  return [itemResult, setItem] as [typeof itemResult, typeof setItem];
}
