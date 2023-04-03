import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import {
  SelectorView,
  SelectorViewDefaultStyles,
} from '../../../../src/components/Wearables/SelectorView';
import { SelectorRowDefaultStyles } from '../../../../src/components/Wearables/SelectorRow';

export const exampleProps = {
  data: [
    {
      id: 'fitbit',
      title: 'Fitbit',
    },
    {
      id: 'garmin',
      title: 'Garmin',
      selected: true,
    },
    {
      id: 'none',
      title: 'Do not sync',
    },
  ],
  onSelected: action('onSelected'),
};

storiesOf('Selector View', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <SelectorView
      data={object('data', exampleProps.data)}
      disabled={boolean('disabled', false)}
      styles={object('styles', {
        ...SelectorViewDefaultStyles,
        selectorRow: SelectorRowDefaultStyles,
      })}
      onSelected={exampleProps.onSelected}
    />
  ))
  .add('disabled', () => <SelectorView {...exampleProps} disabled={true} />);
