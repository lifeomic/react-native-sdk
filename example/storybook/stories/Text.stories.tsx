import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { Text } from 'src/components/Text';
import { BrandConfigProvider } from 'src';
import { View, ViewStyle } from 'react-native';

const style: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

storiesOf('Text', module)
  .addDecorator((story) => <BrandConfigProvider>{story()}</BrandConfigProvider>)
  .addDecorator((story) => <View style={style}>{story()}</View>)
  .add('default', () => <Text>Example textual content.</Text>, {
    notes: '# Text component',
  });
