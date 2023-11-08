import { act, renderHook } from '@testing-library/react-native';
import { _store, useStoredValue } from './useStoredValue';

test('updates when someone else modifies the value', async () => {
  const hook = renderHook(() => useStoredValue('test-key'));
  expect(hook.result.current[0]).toBeUndefined();

  act(() => {
    _store.set('test-key', 'test-value');
  });
  hook.rerender({});
  expect(hook.result.current[0]).toStrictEqual('test-value');
});
