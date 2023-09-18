import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import { action } from '@storybook/addon-actions';
import { TrackTile } from '../../../../src/components/TrackTile';
import { CenterView } from '../../helpers/CenterView';

storiesOf('TrackTile', module)
  .addDecorator((storyFn, context) =>
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
    })(storyFn, context),
  )
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
    />
  ))
  .add('With title and settings button', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      title="TrackTile Title"
    />
  ))
  .add('Title without settings button', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      title="TrackTile Title"
      hideSettingsButton
    />
  ))
  .add('Settings button without title', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
    />
  ))
  .add('Without settings button or title', () => (
    <TrackTile
      onOpenSettings={action('onOpenSettings')}
      onOpenTracker={action('onOpenTracker')}
      hideSettingsButton
    />
  ))
  .add('Custom style', () => {
    const styles = {
      cardView: {
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
