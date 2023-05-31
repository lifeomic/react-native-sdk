import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import {
  SyncTypeSelectionView,
  SyncTypeSelectionViewProps,
} from '../../../../src/components/Wearables//SyncTypeSelectionView';
import {
  WearableIntegration,
  WearableStateSyncType,
} from '../../../../src/components/Wearables/WearableTypes';
import { SafeView } from '../../helpers/SafeView';

export const exampleProps: SyncTypeSelectionViewProps = {
  wearables: [
    {
      ehrId: 'garmin',
      ehrType: 'garmin',
      name: 'Garmin',
      enabled: true,
      syncTypes: [WearableStateSyncType.BodyMass],
      supportedSyncTypes: [
        WearableStateSyncType.BodyMass,
        WearableStateSyncType.SleepAnalysis,
        WearableStateSyncType.Workout,
      ],
    },
    {
      ehrId: 'fitbit',
      ehrType: 'fitbit',
      name: 'Fitbit',
      enabled: true,
      syncTypes: [WearableStateSyncType.Workout],
      supportedSyncTypes: [
        WearableStateSyncType.BodyMass,
        WearableStateSyncType.SleepAnalysis,
        WearableStateSyncType.Workout,
      ],
    },
  ] as WearableIntegration[],
  onUpdate: action('onUpdate'),
};

storiesOf('SyncType Selection View', module)
  .addDecorator(withKnobs)
  .addDecorator((story) => <SafeView>{story()}</SafeView>)
  .add('default', () => (
    <SyncTypeSelectionView
      disabled={boolean('disabled', false)}
      onUpdate={exampleProps.onUpdate}
      styles={object('selectionRowStyles', {})}
      wearables={object('wearables', exampleProps.wearables)}
    />
  ))
  .add('disabled', () => (
    <SyncTypeSelectionView {...exampleProps} disabled={true} />
  ));
