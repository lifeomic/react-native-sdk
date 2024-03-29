import { renderHook, act } from '@testing-library/react-hooks';
import { useTrackerValues } from '../useTrackerValues';
import {
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
  useTrackTileService,
} from '../../services/TrackTileService';
import { notifier } from '../../services/EmitterService';
import {
  startOfToday,
  endOfToday,
  startOfDay,
  startOfTomorrow,
} from 'date-fns';
import { refreshNotifier } from '../../../../common/RefreshNotifier';

jest.mock('../../services/TrackTileService', () => ({
  ...jest.requireActual('../../services/TrackTileService'),
  useTrackTileService: jest.fn(),
}));

const mockUseTrackTileService: jest.Mock<typeof useTrackTileService> =
  useTrackTileService as any;

const valuesContext: TrackerValuesContext = {
  system: TRACKER_CODE_SYSTEM,
  codeBelow: TRACKER_CODE,
};

describe('useTrackerValues', () => {
  it('should fetch the tracker values for today on mount', async () => {
    const fetchTrackerValues = jest
      .fn()
      .mockReturnValue(new Promise(jest.fn()));
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues,
    } as any);

    const { result, waitFor } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitFor(() => {
      expect(fetchTrackerValues).toHaveBeenCalledWith(valuesContext, {
        start: startOfToday(),
        end: endOfToday(),
      });
      expect(result.current.loading).toBe(true);
    });
  });

  it('should fetch the tracker values for provided date range', async () => {
    const fetchTrackerValues = jest
      .fn()
      .mockReturnValue(new Promise(jest.fn()));
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues,
    } as any);

    const start = new Date(1);
    const end = new Date(2);

    const { result, waitFor } = renderHook(() =>
      useTrackerValues(valuesContext, { start, end }),
    );

    waitFor(() => {
      expect(fetchTrackerValues).toHaveBeenCalledWith(valuesContext, {
        start,
        end,
      });
      expect(result.current.loading).toBe(true);
    });
  });

  it('should fetch the tracker values for provided codeBelow', async () => {
    const fetchTrackerValues = jest
      .fn()
      .mockReturnValue(new Promise(jest.fn()));
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues,
    } as any);

    const start = new Date(1);
    const end = new Date(2);
    const customValuesContext = {
      ...valuesContext,
      codeBelow: 'custom-code-below',
    };

    const { result, waitFor } = renderHook(() =>
      useTrackerValues(customValuesContext, {
        start,
        end,
      }),
    );

    await waitFor(() => {
      expect(fetchTrackerValues).toHaveBeenCalledWith(customValuesContext, {
        start,
        end,
      });
      expect(result.current.loading).toBe(true);
    });
  });

  it('should return an array of the returned tracker values for the date range', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [dateKey('2021-07-01')]: { metric1: [{ value: 1 }] },
        [dateKey('2021-07-03')]: { metric1: [{ value: 2 }] },
      }),
    } as any);

    const range = {
      start: new Date('2021-07-01'),
      end: new Date('2021-07-03'),
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext, range),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackerValues).toEqual([
      { metric1: [{ value: 1 }] }, // 2021-07-01
      {}, // 2021-07-02
      { metric1: [{ value: 2 }] }, // 2021-07-03
    ]);
  });

  it('should set the error when fetchTrackerValues throws', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockRejectedValue('Some Error'),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual('Some Error');
  });

  it('should update the current value for a metric when the valuesChanged event occurs', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [dateKey(startOfToday())]: {
          metric1: [{ value: 1, createdDate: startOfToday(), id: 'id' }],
        },
      }),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackerValues).toEqual([
      { metric1: [{ value: 1, createdDate: startOfToday(), id: 'id' }] },
    ]);

    act(() => {
      notifier.emit('valuesChanged', [
        {
          valuesContext,
          metricId: 'metric1',
          tracker: {
            id: 'id',
            createdDate: startOfToday(),
            value: 5,
          },
        },
      ]);
    });

    expect(result.current.trackerValues).toEqual([
      { metric1: [{ value: 5, createdDate: startOfToday(), id: 'id' }] },
    ]);
  });

  it('should ignore valuesChanged event if system does not match', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [dateKey(startOfToday())]: {
          metric1: [{ value: 1, createdDate: startOfToday() }],
        },
      }),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackerValues).toEqual([
      { metric1: [{ value: 1, createdDate: startOfToday() }] },
    ]);

    act(() => {
      notifier.emit('valuesChanged', [
        {
          valuesContext: { system: 'other-system', codeBelow: 'codeBelow' },
          metricId: 'metric1',
          tracker: {
            createdDate: startOfToday(),
            value: 5,
          },
        },
      ]);
    });

    expect(result.current.trackerValues).toEqual([
      { metric1: [{ value: 1, createdDate: startOfToday() }] },
    ]);
  });

  it('should remove a value for a metric when the valuesChanged event occurs and drop is true', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [dateKey(startOfToday())]: {
          metric1: [
            { id: 'value-id-1', value: 1, createdDate: startOfToday() },
            { id: 'value-id-2', value: 1, createdDate: startOfToday() },
          ],
        },
      }),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackerValues).toEqual([
      {
        metric1: [
          { id: 'value-id-1', value: 1, createdDate: startOfToday() },
          { id: 'value-id-2', value: 1, createdDate: startOfToday() },
        ],
      },
    ]);

    act(() => {
      notifier.emit('valuesChanged', [
        {
          drop: true, // drop this value
          valuesContext,
          metricId: 'metric1',
          tracker: {
            createdDate: startOfToday(),
            id: 'value-id-1',
          },
        },
      ]);
    });

    expect(result.current.trackerValues).toEqual([
      {
        metric1: [{ id: 'value-id-2', value: 1, createdDate: startOfToday() }],
      },
    ]);
  });

  it('should ignore valuesChanged event with drop set to true if system does not match', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [dateKey(startOfToday())]: {
          metric1: [{ id: 'value-id', value: 1, createdDate: startOfToday() }],
        },
      }),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTrackerValues(valuesContext),
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackerValues).toEqual([
      { metric1: [{ id: 'value-id', value: 1, createdDate: startOfToday() }] },
    ]);

    act(() => {
      notifier.emit('valuesChanged', [
        {
          drop: true,
          valuesContext: { system: 'other-system', codeBelow: 'codeBelow' },
          metricId: 'metric1',
          tracker: {
            createdDate: startOfToday(),
            id: 'value-id',
          },
        },
      ]);
    });

    expect(result.current.trackerValues).toEqual([
      { metric1: [{ id: 'value-id', value: 1, createdDate: startOfToday() }] },
    ]);
  });

  it('should refetch the values when the date changes to tomorrow', async () => {
    jest.useFakeTimers();

    const today = +startOfToday();
    const tomorrow = +startOfTomorrow();

    jest.setSystemTime(today);

    const fetchTrackerValues = jest.fn(() => ({
      then: (cb: (val: any) => void) => {
        act(() => cb({}));
        return { catch: jest.fn() };
      },
    }));
    mockUseTrackTileService.mockReturnValue({ fetchTrackerValues } as any);

    renderHook(() => useTrackerValues(valuesContext));

    // Async useCallback progression:
    await act(() => jest.advanceTimersByTime(1));

    expect(fetchTrackerValues).toHaveBeenCalledTimes(1);

    await act(() => {
      jest.setSystemTime(tomorrow);
      jest.advanceTimersByTime(60 * 1000);
    });
    await act(() => jest.advanceTimersByTime(1000));

    expect(fetchTrackerValues).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should fetch ontologies if shouldUseOntology set to true', async () => {
    const fetchTrackerValues = jest
      .fn()
      .mockReturnValue(new Promise(jest.fn()));
    const fetchOntology = jest.fn().mockResolvedValue({});
    mockUseTrackTileService.mockReturnValue({
      fetchTrackerValues,
      fetchOntology,
    } as any);

    const customValuesContext: TrackerValuesContext = {
      system: TRACKER_CODE_SYSTEM,
      codeBelow: TRACKER_CODE,
      shouldUseOntology: true,
    };
    const { result, waitFor } = renderHook(() =>
      useTrackerValues(customValuesContext),
    );

    await waitFor(() => {
      expect(fetchTrackerValues).toHaveBeenCalledWith(customValuesContext, {
        start: startOfToday(),
        end: endOfToday(),
      });
      expect(result.current.loading).toBe(true);
      expect(fetchOntology).toHaveBeenCalledWith(TRACKER_CODE);
    });
  });

  it('should refetch the values after a refresh', async () => {
    const fetchTrackerValues = jest.fn(() => ({
      then: (cb: (val: any) => void) => {
        act(() => cb({}));
        return { catch: jest.fn() };
      },
    }));
    mockUseTrackTileService.mockReturnValue({ fetchTrackerValues } as any);

    renderHook(() => useTrackerValues(valuesContext));

    expect(fetchTrackerValues).toHaveBeenCalledTimes(1);

    await act(() => {
      refreshNotifier.emit({ context: 'HomeScreen' });
      expect(fetchTrackerValues).toHaveBeenCalledTimes(2);
    });
  });
});

const dateKey = (date: string | Date) =>
  startOfDay(new Date(date)).toUTCString();
