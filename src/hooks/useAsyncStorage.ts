import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';

export function useAsyncStorage(key: string) {
  const itemResult = useQuery<string | null>(['async-storage-get', key], () =>
    AsyncStorage.getItem(key),
  );

  const setItem = (value: string) =>
    AsyncStorage.setItem(key, value).catch((error) =>
      console.error(`[LifeOmicSDK]:${error}`),
    );

  return [itemResult, setItem] as [typeof itemResult, typeof setItem];
}
