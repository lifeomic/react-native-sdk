import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { Tile } from '../../../src/components/tiles/Tile';

storiesOf('Tile', module).add('demo', () => {
  const onPress = action('onPress');

  // TODO: once we have styles/theming/branding: add knobs for styling.

  return <Tile id="tile1" title="App Tile" onPress={onPress} />;
});
