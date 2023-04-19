import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
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
      title="Custom Title"
    />
  ))
  .add('Without settings', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      title="TrackTile Sans Settings"
      hideSettingsButton
    />
  ))
  .add('Custom style', () => {
    const styles = {
      card: {
        backgroundColor: 'green',
      },
      titleText: {
        color: 'white',
      },
    };
    return (
      <TrackTile
        onOpenSettings={action('onOpenSettings')}
        onOpenTracker={action('onOpenTracker')}
        title="Custom Style"
        styles={styles}
      />
    );
  });
