import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import {
  SyncTypeSelectionRow,
  SyncTypeSelectionRowDefaultStyles
} from '../../src/SyncTypeSelectionRow';
import { WearableIntegration } from '@lifeomic/wearables-sync';
import { SelectorRowDefaultStyles } from '../../src/SelectorRow';

export const exampleProps = {
  selectedEHRId: 'garmin',
  syncTypeOptions: [
    {
      ehrId: 'garmin',
      ehrType: 'garmin',
      name: 'Garmin'
    },
    {
      ehrId: 'fitbit',
      ehrType: 'fitbit',
      name: 'Fitbit'
    },
    {
      ehrId: 'none',
      ehrType: 'none',
      name: 'Do Not Sync'
    }
  ] as WearableIntegration[],
  syncTypeTitle: 'Weight',
  onUpdate: action('onUpdated')
};

storiesOf('SyncType Selection Row', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <SyncTypeSelectionRow
      disabled={boolean('disabled', false)}
      onUpdate={exampleProps.onUpdate}
      selectedEHRId={text('selectedEHRId', exampleProps.selectedEHRId)}
      styles={object('styles', {
        ...SyncTypeSelectionRowDefaultStyles,
        selectorRow: SelectorRowDefaultStyles
      })}
      syncTypeOptions={object('syncTypeOptions', exampleProps.syncTypeOptions)}
      syncTypeTitle={text('syncTypeTitle', exampleProps.syncTypeTitle)}
    />
  ))
  .add('disabled', () => (
    <SyncTypeSelectionRow {...exampleProps} disabled={true} />
  ));
