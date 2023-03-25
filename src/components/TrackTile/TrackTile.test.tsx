import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrackTileProvider } from './TrackTileProvider';
import { startOfToday } from 'date-fns';
import { TRACKER_CODE, TRACKER_CODE_SYSTEM } from './services/TrackTileService';

jest.unmock('i18next');

describe('Track Tile', () => {
  it('should show the loading indicator when trackers are loading', async () => {
    const { findByRole } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn(() => new Promise(jest.fn)),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenSettings={jest.fn()}
        onOpenTracker={jest.fn()}
      />,
    );

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should show the loading indicator when tracker values are loading', async () => {
    const { findByRole } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([]),
            fetchTrackerValues: jest.fn(() => new Promise(jest.fn)),
          } as any
        }
        onOpenSettings={jest.fn()}
        onOpenTracker={jest.fn()}
      />,
    );

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should display all returned trackers', async () => {
    const { findByText } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([
              { id: '1', name: 'Tracker A', units: [] },
              { id: '2', name: 'Tracker B', units: [] },
            ]),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenSettings={jest.fn()}
        onOpenTracker={jest.fn()}
      />,
    );

    expect(await findByText('Tracker A')).toBeDefined();
    expect(await findByText('Tracker B')).toBeDefined();
  });

  it('clicking a tracker calls onOpenTracker handler with selected tracker', async () => {
    const tracker = { id: '1', name: 'Tracker A', units: [] };
    const onOpenTracker = jest.fn();

    const { findByText } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([tracker]),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenSettings={jest.fn()}
        onOpenTracker={onOpenTracker}
      />,
    );

    fireEvent.press(await findByText(tracker.name));

    expect(onOpenTracker).toHaveBeenCalledWith(tracker, {
      system: TRACKER_CODE_SYSTEM,
      codeBelow: TRACKER_CODE,
    });
  });

  it('clicking the settings button calls onOpenTracker handler', async () => {
    const onOpenSettings = jest.fn();

    const { findByLabelText } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([]),
            fetchTrackerValues: jest.fn(() => new Promise(jest.fn)),
          } as any
        }
        onOpenSettings={onOpenSettings}
        onOpenTracker={jest.fn()}
      />,
    );

    fireEvent.press(await findByLabelText('Open Tracker Settings'));

    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('should display tracker value based on metricId', async () => {
    const tracker = { id: '1', name: 'Tracker A', metricId: '2', units: [] };
    const trackerValue = '999';

    const { findByText } = render(
      <TrackTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([tracker]),
            fetchTrackerValues: jest.fn().mockResolvedValue({
              [startOfToday().toUTCString()]: {
                [tracker.metricId]: [{ value: trackerValue }],
              },
            }),
          } as any
        }
        onOpenSettings={jest.fn()}
        onOpenTracker={jest.fn()}
      />,
    );

    expect(await findByText(trackerValue)).toBeDefined();
  });
});
