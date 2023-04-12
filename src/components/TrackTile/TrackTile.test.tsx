import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrackTileProvider } from './TrackTileProvider';
import { startOfToday } from 'date-fns';
import { TRACKER_CODE, TRACKER_CODE_SYSTEM } from './services/TrackTileService';
import { TrackTile } from './TrackTile';
import { useAxiosTrackTileService } from './hooks/useAxiosTrackTileService';

jest.unmock('i18next');

jest.mock('./hooks/useAxiosTrackTileService', () => ({
  useAxiosTrackTileService: jest.fn(),
}));
const useAxiosTrackTileServiceMock = useAxiosTrackTileService as jest.Mock;

describe('Track Tile', () => {
  it('should show the loading indicator when trackers are loading', async () => {
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([]),
      fetchTrackerValues: jest.fn().mockResolvedValue({}),
    });

    const { findByRole } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={jest.fn()} onOpenTracker={jest.fn()} />
      </TrackTileProvider>,
    );

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should show the loading indicator when tracker values are loading', async () => {
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([]),
      fetchTrackerValues: jest.fn().mockResolvedValue({}),
    });

    const { findByRole } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={jest.fn()} onOpenTracker={jest.fn()} />
      </TrackTileProvider>,
    );

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should display all returned trackers', async () => {
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([
        { id: '1', name: 'Tracker A', units: [] },
        { id: '2', name: 'Tracker B', units: [] },
      ]),
      fetchTrackerValues: jest.fn().mockResolvedValue({}),
    });

    const { findByText } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={jest.fn()} onOpenTracker={jest.fn()} />
      </TrackTileProvider>,
    );

    expect(await findByText('Tracker A')).toBeDefined();
    expect(await findByText('Tracker B')).toBeDefined();
  });

  it('clicking a tracker calls onOpenTracker handler with selected tracker', async () => {
    const tracker = { id: '1', name: 'Tracker A', units: [] };
    const onOpenTracker = jest.fn();
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([tracker]),
      fetchTrackerValues: jest.fn().mockResolvedValue({}),
    });

    const { findByText } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={jest.fn()} onOpenTracker={onOpenTracker} />
      </TrackTileProvider>,
    );

    fireEvent.press(await findByText(tracker.name));

    expect(onOpenTracker).toHaveBeenCalledWith(tracker, {
      system: TRACKER_CODE_SYSTEM,
      codeBelow: TRACKER_CODE,
    });
  });

  it('clicking the settings button calls onOpenTracker handler', async () => {
    const onOpenSettings = jest.fn();
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([]),
      fetchTrackerValues: jest.fn(() => new Promise(jest.fn)),
    });

    const { findByLabelText } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={onOpenSettings} onOpenTracker={jest.fn()} />
      </TrackTileProvider>,
    );

    fireEvent.press(await findByLabelText('Open Tracker Settings'));

    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('should display tracker value based on metricId', async () => {
    const tracker = { id: '1', name: 'Tracker A', metricId: '2', units: [] };
    const trackerValue = '999';
    useAxiosTrackTileServiceMock.mockReturnValue({
      fetchTrackers: jest.fn().mockResolvedValue([tracker]),
      fetchTrackerValues: jest.fn().mockResolvedValue({
        [startOfToday().toUTCString()]: {
          [tracker.metricId]: [{ value: trackerValue }],
        },
      }),
    });

    const { findByText } = render(
      <TrackTileProvider>
        <TrackTile onOpenSettings={jest.fn()} onOpenTracker={jest.fn()} />
      </TrackTileProvider>,
    );

    expect(await findByText(trackerValue)).toBeDefined();
  });
});
