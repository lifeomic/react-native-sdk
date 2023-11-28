import React from 'react';
import { render } from '@testing-library/react-native';
import TrackTileTrackerScreen from './TrackTileTrackerScreen';
import {
  TRACKER_CODE_SYSTEM,
  TrackTileServiceProvider,
} from '../components/TrackTile/main';
import { TrackerDetails } from '../components/TrackTile/TrackerDetails/TrackerDetails';

jest.mock('../components/TrackTile/TrackerDetails/TrackerDetails', () => ({
  TrackerDetails: jest.fn(() => null),
}));

const TrackerDetailsMock = TrackerDetails as any as jest.Mock;
const navSetOptions = jest.fn();
const tracker = {
  account: 'account-id',
  description: 'desc',
  lifePoints: 0,
  installed: true,
  system: TRACKER_CODE_SYSTEM,
  id: 'activity',
  metricId: 'activity',
  name: 'activity',
  icon: 'running',
  color: '#CD335E',
  resourceType: 'Procedure',
  code: 'activity',
  order: 1,
  units: [
    {
      code: 'activity',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/activity',
      target: 30,
      unit: 'min',
    },
  ],
};

const valuesContext = {};
const referenceDate = {};
const navigation: any = { setOptions: navSetOptions };
const route: any = {
  params: {
    tracker,
    valuesContext,
    referenceDate,
  },
};

const renderInContext = () => {
  return render(
    <TrackTileTrackerScreen navigation={navigation as any} route={route} />,
    {
      wrapper: ({ children }) => (
        <TrackTileServiceProvider value={{} as any}>
          {children}
        </TrackTileServiceProvider>
      ),
    },
  );
};

describe('TrackTileTrackerScreen', () => {
  it('should render', () => {
    renderInContext();
    expect(TrackerDetailsMock).toHaveBeenCalled();
  });
});
