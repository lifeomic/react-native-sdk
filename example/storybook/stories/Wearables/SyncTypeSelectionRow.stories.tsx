import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import { SyncTypeSelectionRow } from '../../../../src/components/Wearables/SyncTypeSelectionRow';
import { WearableIntegration } from '../../../../src/components/Wearables/WearableTypes';
import { CenterView } from '../../helpers/CenterView';

export const exampleProps = {
  selectedEHRId: 'garmin',
  syncTypeOptions: [
    {
      ehrId: 'garmin',
      ehrType: 'garmin',
      name: 'Garmin',
    },
    {
      ehrId: 'fitbit',
      ehrType: 'fitbit',
      name: 'Fitbit',
    },
    {
      ehrId: 'none',
      ehrType: 'none',
      name: 'Do Not Sync',
    },
  ] as WearableIntegration[],
  syncTypeTitle: 'Weight',
  onUpdate: action('onUpdated'),
};

storiesOf('SyncType Selection Row', module)
  .addDecorator(withKnobs)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => (
    <SyncTypeSelectionRow
      disabled={boolean('disabled', false)}
      onUpdate={exampleProps.onUpdate}
      selectedEHRId={text('selectedEHRId', exampleProps.selectedEHRId)}
      styles={object('styles', {})}
      syncTypeOptions={object('syncTypeOptions', exampleProps.syncTypeOptions)}
      syncTypeTitle={text('syncTypeTitle', exampleProps.syncTypeTitle)}
    />
  ))
  .add('disabled', () => (
    <SyncTypeSelectionRow {...exampleProps} disabled={true} />
  ));
