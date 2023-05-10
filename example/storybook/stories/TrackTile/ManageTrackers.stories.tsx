import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ManageTrackers } from '../../../../src/components/TrackTile/ManageTrackers/ManageTrackers';
import { Tracker } from '../../../../src/components/TrackTile/services/TrackTileService';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import {
  Anchor,
  Smartphone,
  Camera,
  Wifi,
  Planet,
  Aperture,
} from '@lifeomic/chromicons-native';

const defaultMetricTypes: Partial<Tracker>[] = [
  {
    id: '4',
    name: 'Mindful',
    icon: 'mindful',
    metricId: '4',
    target: 1,
    unit: 't',
  },
  {
    id: '3',
    name: 'Protein',
    icon: 'protein',
    metricId: '3',
    target: 1,
    unit: 't',
  },
  {
    id: '2',
    name: 'Steps',
    icon: 'running',
    metricId: '2',
    target: 1,
    unit: 't',
  },
  {
    id: '1',
    name: 'Water',
    icon: 'water',
    metricId: '1',
    target: 1,
    unit: 't',
  },
  {
    id: '5',
    name: 'General',
  },
  {
    id: '6',
    name: 'General',
  },
];

storiesOf('ManageTrackers', module)
  .addDecorator(MockEnvironmentDecorator())
  .add('default', () => (
    <ManageTrackers
      onOpenTracker={action('onOpenTracker')}
      trackerRequestMeta={{
        loading: false,
        error: undefined,
        trackers: defaultMetricTypes as Tracker[],
        pillarTrackers: [],
      }}
      icons={
        boolean('Use Custom Icons', false)
          ? {
              1: Anchor,
              2: Smartphone,
              3: Camera,
              4: Planet,
              5: Aperture,
              6: Wifi,
            }
          : {}
      }
    />
  ))
  .add('loading', () => (
    <ManageTrackers
      onOpenTracker={action('onOpenTracker')}
      trackerRequestMeta={{
        loading: true,
        error: undefined,
        trackers: [],
        pillarTrackers: [],
      }}
    />
  ))
  .add('error', () => (
    <ManageTrackers
      onOpenTracker={action('onOpenTracker')}
      trackerRequestMeta={{
        loading: false,
        error: 'error',
        trackers: [],
        pillarTrackers: [],
      }}
    />
  ))
  .add('reorder error', () => (
    <ManageTrackers
      onOpenTracker={action('onOpenTracker')}
      trackerRequestMeta={{
        loading: false,
        error: undefined,
        trackers: defaultMetricTypes as Tracker[],
        pillarTrackers: [],
      }}
      hasReorderError={true}
    />
  ));
