import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAsyncStorage } from './useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';

const renderHookInContext = async (key: string) => {
  return renderHook(() => useAsyncStorage(key));
};

describe('useAsyncStorage', () => {
  test('can fetch and update the stored value', async () => {
    AsyncStorageMock.getItem = jest.fn().mockReturnValue('test');
    const { result } = await renderHookInContext('key');
    expect(AsyncStorage.getItem).toBeCalledWith('key');

    await waitFor(() => {
      expect(result.current[0].data).toEqual('test');
    });

    await act(async () => {
      result.current[1]('new-value');
    });

    expect(AsyncStorage.setItem).toBeCalledWith('key', 'new-value');

    await waitFor(() => {
      expect(result.current[0].data).toEqual('new-value');
    });
  });
});
