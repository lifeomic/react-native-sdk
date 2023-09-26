import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import { action } from '@storybook/addon-actions';
import { TrackTile } from '../../../../src/components/TrackTile';
import { CenterView } from '../../helpers/CenterView';
import { getTrackers } from './util/trackerData';
import { boolean } from '@storybook/addon-knobs';
import { PillarsTile } from '../../../../src/components/TrackTile/PillarsTile/PillarsTile';

const trackers = [...getTrackers(), ...getTrackers({ pillars: true })];

storiesOf('TrackTile/TrackTiles', module)
  .addDecorator((storyFn, context) =>
    MockEnvironmentDecorator({
      trackers,
    })(storyFn, context),
  )
  .add('default', () => (
    <CenterView>
      <TrackTile
        onOpenSettings={action('onOpenSettings')}
        onOpenTracker={action('onOpenTracker')}
        title={boolean('Title', true) ? 'TrackTile Title' : undefined}
        hideSettingsButton={boolean('Hide Settings Button', false)}
      />
    </CenterView>
  ))
  .add('In context with Pillars', () => (
    <>
      <PillarsTile
        onOpenDetails={action('onOpenDetails')}
        onSaveNewValueOverride={action('onSaveNewValueOverride')}
      />
      <TrackTile
        onOpenSettings={action('onOpenSettings')}
        onOpenTracker={action('onOpenTracker')}
        title={boolean('Title', true) ? 'TrackTile Title' : undefined}
        hideSettingsButton={boolean('Hide Settings Button', false)}
      />
    </>
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
