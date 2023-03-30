import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import {
  SyncTypeSelectionView,
  SyncTypeSelectionViewProps,
} from '../../../../src/components/Wearables//SyncTypeSelectionView';
import { WearableIntegration } from '@lifeomic/wearables-sync';
import { WearableStateSyncType } from '@lifeomic/ehr-core';
import { SyncTypeSelectionRowDefaultStyles } from '../../../../src/components/Wearables//SyncTypeSelectionRow';
import { SelectorViewDefaultStyles } from '../../../../src/components/Wearables//SelectorView';
import { SelectorRowDefaultStyles } from '../../../../src/components/Wearables//SelectorRow';

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
  .add('default', () => (
    <SyncTypeSelectionView
      disabled={boolean('disabled', false)}
      onUpdate={exampleProps.onUpdate}
      selectionRowStyles={object('selectionRowStyles', {
        ...SyncTypeSelectionRowDefaultStyles,
        selectorView: {
          ...SelectorViewDefaultStyles,
          selectorRow: SelectorRowDefaultStyles,
        },
      })}
      wearables={object('wearables', exampleProps.wearables)}
    />
  ))
  .add('disabled', () => (
    <SyncTypeSelectionView {...exampleProps} disabled={true} />
  ));
