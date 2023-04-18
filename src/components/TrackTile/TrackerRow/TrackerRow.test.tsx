import React from 'react';
import { render } from '@testing-library/react-native';
import { TrackerRow } from './TrackerRow';
import {
  Tracker,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

jest.unmock('i18next');

const tracker: Tracker = {
  metricId: '1',
  resourceType: 'Observation',
  units: [{}],
  system: 'system',
  code: '1',
  target: 3,
} as Partial<Tracker> as any;

const renderWithProviders = (children: React.ReactNode) => {
  const providers = {
    datastoreSettings: {},
    upsertTrackerResource: jest.fn(),
  };

  const result = render(
    <TrackTileServiceProvider value={providers as any}>
      {children}
    </TrackTileServiceProvider>,
  );

  return { ...providers, ...result };
};

describe('Tracker Row', () => {
  it('should show the loading indicator when trackers are loading', async () => {
    const { findByTestId } = renderWithProviders(
      <TrackerRow
        onOpenTracker={jest.fn()}
        values={{}}
        trackers={[tracker]}
        loading
      />,
    );

    expect(await findByTestId('trackers-loading')).toBeDefined();
  });

  it('should show the current tracker values', async () => {
    const trackers: Tracker[] = [
      tracker,
      {
        metricId: '2',
        resourceType: 'Procedure',
        units: [
          {
            code: 'h',
          },
        ],
        system: 'system',
        code: '1',
        target: 3,
      } as Partial<Tracker> as any,
    ];
    const { findByText } = renderWithProviders(
      <TrackerRow
        onOpenTracker={jest.fn()}
        values={{
          '1': [{ value: 7 } as any],
          '2': undefined as any, // Simulating now records for metric 2
        }}
        trackers={trackers}
        loading={false}
      />,
    );

    expect(await findByText('7')).toBeDefined();
    expect(await findByText('0')).toBeDefined();
  });
});
