import React, { FC, useState } from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import { SwitchRow } from '../../../../src/components/Wearables//SwitchRow';

storiesOf('Switch Row', module)
  .addDecorator(withKnobs)
  .add('default', () => <DefaultView />)
  .add('disabled', () => <DefaultView disabled={true} />);

const DefaultView: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const [value, setValue] = useState(false);

  const onValueChange = (v: boolean) => {
    action('onValueChange');
    setValue(v);
  };

  const props = {
    accessibilityLabel: 'switch-row-accessibility-label',
    disabled,
    onValueChange,
    rowStyle: {},
    testID: 'switch-row-test-id',
    title: 'Title',
    value,
  };

  return (
    <SwitchRow
      title={text('title', props.title)}
      value={boolean('value', props.value)}
      onValueChange={props.onValueChange}
      styles={object('styles', {})}
      accessibilityLabel={props.accessibilityLabel}
      disabled={boolean('disabled', !!props.disabled)}
    />
  );
};
