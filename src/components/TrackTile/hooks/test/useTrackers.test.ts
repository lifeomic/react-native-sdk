import { renderHook, act } from '@testing-library/react-hooks';
import { useTrackers } from '../useTrackers';
import {
  TRACKER_PILLAR_CODE_SYSTEM,
  useTrackTileService,
} from '../../services/TrackTileService';
import { notifier, notifyTrackerRemoved } from '../../services/EmitterService';

jest.mock('../../services/TrackTileService', () => ({
  ...jest.requireActual('../../services/TrackTileService'),
  useTrackTileService: jest.fn(),
}));

const mockUseTrackTileService: jest.Mock<typeof useTrackTileService> =
  useTrackTileService as any;

describe('useTrackers', () => {
  it('should fetch installed metrics on mount', () => {
    const fetchTrackers = jest.fn().mockReturnValue(new Promise(jest.fn()));
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers,
    } as any);

    const { result } = renderHook(() => useTrackers());

    expect(fetchTrackers).toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('should return the fetched installed metrics and stop loading', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers: jest
        .fn()
        .mockResolvedValue([
          { name: 'metric' },
          { name: 'metric2', system: TRACKER_PILLAR_CODE_SYSTEM },
        ]),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useTrackers());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.trackers).toEqual([{ name: 'metric' }]);
    expect(result.current.pillarTrackers).toEqual([
      { name: 'metric2', system: TRACKER_PILLAR_CODE_SYSTEM },
    ]);
  });

  it('should set the API error if one is present', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers: jest.fn().mockRejectedValue({ error: 'Some API Error' }),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useTrackers());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual('Some API Error');
  });

  it('should replace an installed metric (by id) when the trackerChanged event is invoked', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers: jest
        .fn()
        .mockResolvedValue([
          { id: 'tracker-id', metricId: '1', unit: 'u', target: 1 },
        ]),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useTrackers());

    await waitForNextUpdate();

    expect(result.current.trackers).toEqual([
      expect.objectContaining({ target: 1 }),
    ]);

    act(() => {
      notifier.emit('trackerChanged', {
        id: 'tracker-id',
        metricId: '1',
        unit: 'u',
        target: 999,
      } as any);
    });

    expect(result.current.trackers).toEqual([
      expect.objectContaining({ target: 999 }),
    ]);
  });

  it('should modify the metric metadata (by id) when notifyTrackerRemoved is called so that it is not installed', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([
        {
          id: 'tracker-id',
          metricId: '1',
          unit: 'u',
          target: 1,
          installed: true,
        },
      ]),
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useTrackers());

    await waitForNextUpdate();

    expect(result.current.trackers[0].installed).toBe(true);

    act(() => {
      notifyTrackerRemoved({
        id: 'tracker-id',
        metricId: '1',
        unit: 'u',
        target: 999,
      } as any);
    });

    expect(result.current.trackers[0].installed).toBe(false);
  });

  it('sort the trackers correctly when updating settings', async () => {
    mockUseTrackTileService.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([
        { name: 'B', order: 2, metricId: 'B' },
        { name: 'A', order: 2, metricId: 'A' },
        { name: 'D', order: 3, metricId: 'D' },
        { name: 'C', id: 'C' },
        { name: 'F', id: 'F' },
        { name: 'E', id: 'E' },
        {
          name: 'A',
          order: 2,
          metricId: 'A',
          system: TRACKER_PILLAR_CODE_SYSTEM,
        },
        {
          name: 'B',
          order: 1,
          metricId: 'B',
          system: TRACKER_PILLAR_CODE_SYSTEM,
        },
      ]),
    } as any);

    const updatedTracker: any = {
      id: 'tracker-id',
      metricId: 'C',
      unit: 'u',
      target: 1,
      order: 1,
    };

    const { result, waitForNextUpdate } = renderHook(() => useTrackers());

    await waitForNextUpdate();

    act(() => {
      notifier.emit('trackerChanged', updatedTracker);
    });

    expect(result.current.trackers).toEqual([
      updatedTracker,
      { name: 'A', order: 2, metricId: 'A' },
      { name: 'B', order: 2, metricId: 'B' },
      { name: 'D', order: 3, metricId: 'D' },
      { name: 'E', id: 'E' },
      { name: 'F', id: 'F' },
    ]);
    expect(result.current.pillarTrackers).toEqual([
      {
        name: 'B',
        order: 1,
        metricId: 'B',
        system: TRACKER_PILLAR_CODE_SYSTEM,
      },
      {
        name: 'A',
        order: 2,
        metricId: 'A',
        system: TRACKER_PILLAR_CODE_SYSTEM,
      },
    ]);
  });
});
