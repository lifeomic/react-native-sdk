import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const baseKey = 'async-storage-get';

export function useAsyncStorage(key: string) {
  const queryClient = useQueryClient();
  const itemResult = useQuery<string | null>([baseKey, key], () =>
    AsyncStorage.getItem(key),
  );

  const setItem = useCallback(
    (value: string) => {
      if (value !== itemResult.data) {
        AsyncStorage.setItem(key, value)
          .catch((error) => console.error(`[LifeOmicSDK]:${error}`))
          .finally(() => {
            queryClient.setQueryData([baseKey, key], () => value);
          });
      }
    },
    [key, itemResult.data, queryClient],
  );

  return [itemResult, setItem] as [typeof itemResult, typeof setItem];
}
