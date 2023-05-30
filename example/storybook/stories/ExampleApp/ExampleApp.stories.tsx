import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from '../OAuth.stories';
import {
  DeveloperConfigProvider,
  RootProviders,
  RootStack,
  LogoHeader,
  BrandConfigProvider,
} from '../../../../src';
import { withKnobs, color } from '@storybook/addon-knobs';
import Color from 'color';
import logo from './header-logo.png';

storiesOf('Example App', module)
  .addDecorator(withKnobs)
  .add('Default', () => {
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
  .add('Customized AppNavHeader with LogoHeader', () => {
    const brand = {
      styles: {
        AppNavHeader: {
          style: {
            backgroundColor: '#444444',
          },
          titleText: {
            color: 'white',
            fontSize: 24,
          },
          backActionIconAny: {
            color: 'white',
          },
        },
        LogoHeader: {
          view: {
            marginBottom: 16,
          },
        },
      },
    };
    return (
      <DeveloperConfigProvider
        developerConfig={{
          AppNavHeader: {
            headerColors: [
              {
                route: 'Home',
                color: (theme) => theme.colors.primary,
              },
              {
                route: 'Notifications',
                color: (theme) => theme.colors.secondary,
              },
              {
                route: 'Settings',
                color: (theme) => theme.colors.tertiary,
              },
            ],
            onHeaderColors: [
              {
                route: 'Home',
                color: (theme) => theme.colors.onPrimary,
              },
              {
                route: 'Notifications',
                color: (theme) => theme.colors.onSecondary,
              },
              {
                route: 'Settings',
                color: (theme) => theme.colors.onTertiary,
              },
            ],
          },
        }}
      >
        <RootProviders authConfig={authConfig}>
          <BrandConfigProvider {...brand}>
            <LogoHeader imageSource={logo} />
            <RootStack />
          </BrandConfigProvider>
        </RootProviders>
      </DeveloperConfigProvider>
    );
  });