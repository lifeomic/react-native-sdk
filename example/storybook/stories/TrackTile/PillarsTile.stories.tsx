import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { PillarsTile } from '../../../../src/components/TrackTile/PillarsTile/PillarsTile';
import { action } from '@storybook/addon-actions';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import { View } from 'react-native';
import { boolean } from '@storybook/addon-knobs';
import {
  Anchor,
  Smartphone,
  Camera,
  Planet,
  Aperture,
  CheckCircle,
  PlusSquare,
} from '@lifeomic/chromicons-native';
import { IconProvider } from '../../../../src';
import { CenterView } from '../../helpers/CenterView';
import { getTrackers } from './util/trackerData';

storiesOf('TrackTile/PillarsTile', module)
  .addDecorator((storyFn, context) =>
    MockEnvironmentDecorator({
      trackers: getTrackers({ pillars: true }),
    })(storyFn, context),
  )
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => (
    <IconProvider
      icons={
        boolean('Use Custom Icons', false)
          ? {
              nutrition: Anchor,
              activity: Smartphone,
              'self-care': Camera,
              sleep: Planet,
              school: Aperture,
              'pillars-goal-met-icon': CheckCircle,
              'pillars-add-data-button-icon': PlusSquare,
            }
          : {}
      }
    >
      <PillarsTile
        onOpenDetails={action('onOpenDetails')}
        onSaveNewValueOverride={action('onSaveNewValueOverride')}
      />
    </IconProvider>
  ))
  .add('Custom Background', () => (
    <PillarsTile
      onOpenDetails={action('onOpenDetails')}
      onSaveNewValueOverride={action('onSaveNewValueOverride')}
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
