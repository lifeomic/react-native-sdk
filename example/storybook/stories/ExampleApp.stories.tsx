import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from './OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from 'src';
import { withKnobs, color } from '@storybook/addon-knobs';

storiesOf('Example App', module)
  .addDecorator(withKnobs)
  .add('DemoApp', () => (
    <DeveloperConfigProvider
      developerConfig={{
        simpleTheme: {
          primaryColor: color('primaryColor', '#fb5607'),
          accentColor: color('accentColor', '#ffbe0b'),
        },
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  ));
