import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from '../../helpers/oauthConfig';
import {
  DeveloperConfigProvider,
  RootProviders,
  RootStack,
  LogoHeader,
  BrandConfigProvider,
} from '../../../../src';
import { withKnobs, color, boolean } from '@storybook/addon-knobs';
import Color from 'color';
import logo from './header-logo.png';
import { t } from 'i18next';
import { Home, Bell, Settings, Menu } from '@lifeomic/chromicons-native';
import { HelloWorldScreen } from '../../../src/screens/HelloWorldScreen';

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
  .add('With additional navigation tab', () => {
    const rgbColorString = color('Primary Color', '#0477BF');
    const primaryColor = Color(rgbColorString).hex();

    return (
      <DeveloperConfigProvider
        developerConfig={{
          simpleTheme: {
            primaryColor,
          },
          additionalNavigationTabs: [
            {
              name: 'AdditionalTab',
              component: HelloWorldScreen,
              options: {
                tabBarLabel: t('tabs-settings', 'Settings'),
                tabBarIcon: Menu,
              },
            },
          ],
        }}
      >
        <RootProviders authConfig={authConfig}>
          <RootStack />
        </RootProviders>
      </DeveloperConfigProvider>
    );
  })
  .add('Customized TabBar', () => {
    return (
      <DeveloperConfigProvider
        developerConfig={{
          componentProps: {
            TabNavigator: {
              useTabBar: true,
            },
            TabBar: {
              showLabels: boolean('Show Labels', false),
              tabs: [
                {
                  icon: Home,
                  svgProps: () => ({
                    width: 42,
                    height: 42,
                    strokeWidth: 3,
                  }),
                  svgPropsActive: (theme) => ({
                    stroke: theme.colors.onPrimaryContainer,
                  }),
                  svgPropsInactive: (theme) => ({
                    stroke: theme.colors.onSurfaceDisabled,
                  }),
                },
                {
                  icon: Bell,
                  svgProps: () => ({
                    width: 42,
                    height: 42,
                    strokeWidth: 3,
                  }),
                  svgPropsActive: (theme) => ({
                    stroke: theme.colors.onSecondaryContainer,
                  }),
                  svgPropsInactive: (theme) => ({
                    stroke: theme.colors.onSurfaceDisabled,
                  }),
                },
                {
                  icon: Settings,
                  svgProps: () => ({
                    width: 42,
                    height: 42,
                    strokeWidth: 3,
                  }),
                  svgPropsActive: (theme) => ({
                    stroke: theme.colors.onTertiaryContainer,
                  }),
                  svgPropsInactive: (theme) => ({
                    stroke: theme.colors.onSurfaceDisabled,
                  }),
                },
              ],
            },
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
            statusBarHeight: 0,
          },
        }}
      >
        <RootProviders authConfig={authConfig}>
          <BrandConfigProvider {...brand}>
            <LogoHeader visible={true} imageSource={logo} />
            <RootStack />
          </BrandConfigProvider>
        </RootProviders>
      </DeveloperConfigProvider>
    );
  });
