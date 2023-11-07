import { renderHook, act, waitFor } from '@testing-library/react-native';
import { notifier } from '../../services/EmitterService';
import { _store } from '../../../../hooks/useStoredValue';
import { useRecentCodedValues } from '../useRecentCodedValues';

const key = '@lifeomic/track-tile/recent-values/metricId';

describe('useTrackerValues', () => {
  it('should get the recent values by id', async () => {
    const data = [
      { value: 5, code: { code: 'value-code', system: 'value-system' } },
    ];
    _store.set(key, JSON.stringify(data));

    const { result } = renderHook(() => useRecentCodedValues('metricId'));

    await waitFor(() => expect(result.current).toStrictEqual(data));
  });

  it('should handle no saved data', async () => {
    _store.clearAll();

    const { result, rerender } = renderHook(() =>
      useRecentCodedValues('metricId'),
    );

    rerender({});

    expect(result.current).toEqual([]);
  });

  it('can add a new value to the recent items', async () => {
    _store.set(
      key,
      JSON.stringify([
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );

    const { result } = renderHook(() => useRecentCodedValues('metricId'));

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

    expect(_store.getString(key)).toStrictEqual(
      JSON.stringify([
        { value: 3, code: { code: 'new', system: 'newSys', display: 'NEW' } },
        { value: 5, code: { code: 'value-code', system: 'value-system' } },
      ]),
    );
  });

  it('only saves 5 most recent values', async () => {
    _store.set(
      key,
      JSON.stringify([
        { value: 0, code: { code: 'code-0', system: 'system' } },
      ]),
    );

    const { result } = renderHook(() => useRecentCodedValues('metricId'));

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
    _store.set(key, JSON.stringify([{ value: 0, code }]));

    const { result } = renderHook(() => useRecentCodedValues('metricId'));

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
