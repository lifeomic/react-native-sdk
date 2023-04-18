import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import { View } from 'react-native';
import { action } from '@storybook/addon-actions';
import { TrackTile } from 'src/components/TrackTile';

storiesOf('TrackTile', module)
  .addDecorator(
    MockEnvironmentDecorator({
      trackers: [
        {
          id: '1',
          metricId: '1',
          name: 'Test',
          color: 'chartreuse',
          resourceType: 'Procedure',
          units: [
            {
              code: 'h',
              default: true,
              display: 'hour',
              system: 'http://unitsofmeasure.org',
              target: 5,
              unit: 'h',
            },
          ],
        },
      ],
    }),
  )
  .add('default', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
    />
  ))
  .add('Custom title', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      title="Testing"
    />
  ))
  .add('Custom Background', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      background={
        <View
          style={{
            backgroundColor: '#E44572',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      }
    />
  ));
