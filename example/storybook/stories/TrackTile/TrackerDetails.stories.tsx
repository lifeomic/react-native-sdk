import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { TrackerDetails } from 'src/components/TrackTile/TrackerDetails/TrackerDetails';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  MetricType,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
} from 'src/components/TrackTile/services/TrackTileService';
import i18n from '@i18n';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { Anchor } from '@lifeomic/chromicons-native';

storiesOf('TrackerDetails', module)
  .addDecorator(withKnobs)
  .addDecorator(
    MockEnvironmentDecorator({
      trackers: [
        {
          id: '1',
          name: 'Test',
          color: 'chartreuse',
          system: TRACKER_CODE_SYSTEM,
        },
      ],
    }),
  )
  .add('default', () => {
    return (
      <TrackerDetails
        tracker={
          {
            id: 'id',
            name: 'Example',
            color: 'cadetblue',
            resourceType: 'Observation',
            description: i18n.t('example-description', {
              defaultValue:
                'This is an example description for the track tile that is to be added',
              ns: 'track-tile-ui',
            }),
            units: [
              {
                unit: 'unit-1',
                display: 'steps',
                target: 100,
                default: true,
              },
              {
                unit: 'unit-2',
                display: 'skips',
                target: 75,
              },
              {
                unit: 'unit-3',
                display: 'jumps',
                target: 50,
              },
            ],
            system: TRACKER_CODE_SYSTEM,
          } as Partial<MetricType> as any
        }
        valuesContext={{
          system: TRACKER_CODE_SYSTEM,
          codeBelow: TRACKER_CODE,
        }}
        icons={
          boolean('Use Custom Icons', false)
            ? {
                id: Anchor,
              }
            : {}
        }
      />
    );
  });
