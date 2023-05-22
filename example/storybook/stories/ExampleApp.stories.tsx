import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from './OAuth.stories';
import {
  DeveloperConfigProvider,
  RootProviders,
  RootStack,
} from '../../../src';
import { withKnobs, color } from '@storybook/addon-knobs';
import Color from 'color';
import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

storiesOf('Example App', module)
  .addDecorator(withKnobs)
  .add('DemoApp', () => {
    const rgbColorString = color('Primary Color', '#0477BF');
    const primaryColor = Color(rgbColorString).hex();

    return (
      <DeveloperConfigProvider
        developerConfig={{
          simpleTheme: {
            primaryColor,
          },
        }}
      >
        <RootProviders authConfig={authConfig}>
          <RootStack />
        </RootProviders>
      </DeveloperConfigProvider>
    );
  })
  .add('Custom AppNavHeader', () => {
    return (
      <DeveloperConfigProvider
        developerConfig={{
          AppNavHeader,
        }}
      >
        <RootProviders authConfig={authConfig}>
          <RootStack />
        </RootProviders>
      </DeveloperConfigProvider>
    );
  });

const AppNavHeader = (({ route }: NativeStackHeaderProps) => {
  return (
    <Appbar.Header elevated>
      <Appbar.Content title={`Custom ${route.name}`} />
    </Appbar.Header>
  );
}) as () => JSX.Element;
