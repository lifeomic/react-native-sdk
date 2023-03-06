import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';

export function useGetAsyncStorage(key: string) {
  return useQuery<string | null>('async-storage-get', () =>
    AsyncStorage.getItem(key),
  );
}
