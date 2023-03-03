import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from './OAuth.stories';
import { RootProviders, RootStack } from 'src';

storiesOf('Example App', module).add('DemoApp', () => (
  <RootProviders authConfig={authConfig}>
    <RootStack />
  </RootProviders>
));
