import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import { SelectorView } from '../../../../src/components/Wearables/SelectorView';
import { CenterView } from '../../helpers/CenterView';

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
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => (
    <SelectorView
      data={object('data', exampleProps.data)}
      disabled={boolean('disabled', false)}
      styles={object('styles', {})}
      onSelected={exampleProps.onSelected}
    />
  ))
  .add('disabled', () => <SelectorView {...exampleProps} disabled={true} />);
