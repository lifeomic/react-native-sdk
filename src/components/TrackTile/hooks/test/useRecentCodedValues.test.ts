import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage, {
  AsyncStorageStatic,
} from '@react-native-async-storage/async-storage';
import { useRecentCodedValues } from '../useRecentCodedValues';
import { notifier } from '../../services/EmitterService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const getItem = AsyncStorage.getItem as any as jest.Mock<
  AsyncStorageStatic['getItem']
>;
const setItem = AsyncStorage.setItem as any as jest.Mock<
  AsyncStorageStatic['setItem']
>;

describe('useTrackerValues', () => {
  it('should get the recent values by id', async () => {
    getItem.mockReturnValue(
      JSON.stringify([
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]) as never,
    );

    const { result, waitFor } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    await waitFor(() =>
      expect(result.current).toEqual([
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );

    expect(getItem).toHaveBeenCalledWith(
      '@lifeomic/track-tile/recent-values/metricId',
    );
  });

  it('should handle no saved data', async () => {
    getItem.mockReturnValue(undefined as never);

    const { result, waitFor } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    await waitFor(() => expect(result.current).toEqual([]));
  });

  it('can add a new value to the recent items', async () => {
    getItem.mockReturnValue(
      JSON.stringify([
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]) as never,
    );

    const { result, waitFor } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    await waitFor(() =>
      expect(result.current).toEqual([
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );

    act(() => {
      notifier.emit('valuesChanged', [
        {
          valuesContext: {} as any,
          metricId: 'metricId',
          tracker: {
            value: 3,
            code: {
              coding: [{ code: 'new', system: 'newSys', display: 'NEW' }],
            },
          },
        },
      ]);
    });

    await waitFor(() =>
      expect(result.current).toEqual([
        { value: 3, code: { code: 'new', system: 'newSys', display: 'NEW' } },
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );

    expect(setItem).toHaveBeenLastCalledWith(
      '@lifeomic/track-tile/recent-values/metricId',
      JSON.stringify([
        { value: 3, code: { code: 'new', system: 'newSys', display: 'NEW' } },
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );
  });

  it('only saves 5 most recent values', async () => {
    getItem.mockReturnValue(
      JSON.stringify([
        { value: 0, code: { code: 'code-0', system: 'system' } },
      ]) as never,
    );

    const { result, waitFor } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        { value: 0, code: { code: 'code-0', system: 'system' } },
      ]);
    });

    await act(async () => {
      for (let value = 1; value < 10; value++) {
        notifier.emit('valuesChanged', [
          {
            valuesContext: {} as any,
            metricId: 'metricId',
            tracker: {
              value,
              code: {
                coding: [
                  {
                    code: 'code-' + value,
                    system: 'system',
                    display: 'display',
                  },
                ],
              },
            },
          },
        ]);
      }
    });

    await waitFor(() =>
      expect(result.current).toEqual([
        {
          value: 9,
          code: { code: 'code-9', system: 'system', display: 'display' },
        },
        {
          value: 8,
          code: { code: 'code-8', system: 'system', display: 'display' },
        },
        {
          value: 7,
          code: { code: 'code-7', system: 'system', display: 'display' },
        },
        {
          value: 6,
          code: { code: 'code-6', system: 'system', display: 'display' },
        },
        {
          value: 5,
          code: { code: 'code-5', system: 'system', display: 'display' },
        },
      ]),
    );
  });

  it('should evict values with the same code and use latest value', async () => {
    const code = { code: 'code', system: 'system', display: 'display' };
    getItem.mockReturnValue(JSON.stringify([{ value: 0, code }]) as never);

    const { result, waitFor } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    await waitFor(() => expect(result.current).toEqual([{ value: 0, code }]));

    await act(async () => {
      notifier.emit('valuesChanged', [
        {
          valuesContext: {} as any,
          metricId: 'metricId',
          tracker: {
            value: 1,
            code: { coding: [code] },
          },
        },
      ]);
    });

    await waitFor(() => expect(result.current).toEqual([{ value: 1, code }]));
  });
});
