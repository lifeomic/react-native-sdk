import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import { SelectorRow } from '../../../../src/components/Wearables/SelectorRow';
import { CenterView } from '../../helpers/CenterView';

export const exampleProps = {
  id: 'rowId',
  title: 'Row Title',
  onSelected: action('onSelected'),
};

storiesOf('Selector Row', module)
  .addDecorator(withKnobs)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => (
    <SelectorRow
      disabled={boolean('disabled', false)}
      id={text('id', exampleProps.id)}
      styles={object('styles', {})}
      selected={boolean('selected', false)}
      title={text('title', exampleProps.title)}
      onSelected={exampleProps.onSelected}
    />
  ))
  .add('selected', () => <SelectorRow {...exampleProps} selected={true} />)
  .add('disabled', () => <SelectorRow {...exampleProps} disabled={true} />);
