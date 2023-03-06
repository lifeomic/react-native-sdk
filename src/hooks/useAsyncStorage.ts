import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';

export function useAsyncStorage() {
  const useGetItem = (key: string) =>
    useQuery<string | null>('async-storage-get', () =>
      AsyncStorage.getItem(key),
    );

  const setItem = (key: string, value: string) =>
    AsyncStorage.setItem(key, value);

  return {
    useGetItem: useGetItem,
    setItem: setItem,
  };
}
