import React from 'react';
import { View, Text } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { authConfig, baseURL } from '../../helpers/oauthConfig';
import {
  DeveloperConfigProvider,
  RootProviders,
  LoggedInStack,
  LogoHeader,
  BrandConfigProvider,
  getDefaultTabs,
  useTheme,
  Theme,
} from '../../../../src';
import { withKnobs, color, boolean, number } from '@storybook/addon-knobs';
import Color from 'color';
import logo from './header-logo.png';
import { Home, Bell, Settings, Menu } from '@lifeomic/chromicons-native';
import { HelloWorldScreen } from '../../../src/screens/HelloWorldScreen';
import { IconButton } from 'react-native-paper';
import { navigationRef } from '../../../../src/common/ThemedNavigationContainer';
import { DataOverrideProvider } from '../../helpers/DataProviderDecorator';

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
          apiBaseURL: baseURL,
        }}
      >
        <RootProviders account="mockaccount" authConfig={authConfig}>
          <LoggedInStack />
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
          componentProps: {
            TabBar: {
              tabs: [
                ...getDefaultTabs(),
                {
                  name: 'AdditionalTab',
                  component: HelloWorldScreen,
                  label: 'Hello World',
                  icon: Menu,
                },
              ],
            },
          },
          apiBaseURL: baseURL,
        }}
      >
        <RootProviders account="mockaccount" authConfig={authConfig}>
          <LoggedInStack />
        </RootProviders>
      </DeveloperConfigProvider>
    );
  })
  .add('Customized TabBar', () => {
    const defaultTabs = getDefaultTabs();

    return (
      <ThemeProvider>
        {(theme) => (
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
                      ...defaultTabs[0],
                      icon: Home,
                      styles: {
                        svgProps: {
                          width: 42,
                          height: 42,
                          strokeWidth: 3,
                        },
                        svgPropsActive: {
                          stroke: theme.colors.onPrimaryContainer,
                        },
                        svgPropsInactive: {
                          stroke: theme.colors.onSurfaceDisabled,
                        },
                      },
                    },
                    {
                      ...defaultTabs[1],
                      icon: Bell,
                      styles: {
                        svgProps: {
                          width: 42,
                          height: 42,
                          strokeWidth: 3,
                        },
                        svgPropsActive: {
                          stroke: theme.colors.onSecondaryContainer,
                        },
                        svgPropsInactive: {
                          stroke: theme.colors.onSurfaceDisabled,
                        },
                      },
                    },
                    {
                      ...defaultTabs[2],
                      icon: Settings,
                      styles: {
                        svgProps: {
                          width: 42,
                          height: 42,
                          strokeWidth: 3,
                        },
                        svgPropsActive: {
                          stroke: theme.colors.onTertiaryContainer,
                        },
                        svgPropsInactive: {
                          stroke: theme.colors.onSurfaceDisabled,
                        },
                      },
                    },
                  ],
                },
              },
              apiBaseURL: baseURL,
            }}
          >
            <RootProviders account="mockaccount" authConfig={authConfig}>
              <LoggedInStack />
            </RootProviders>
          </DeveloperConfigProvider>
        )}
      </ThemeProvider>
    );
  })
  .add('Customized AppNavHeader with LogoHeader', () => {
    const options = {
      range: true,
      min: 0,
      max: 100,
      step: 1,
    };

    const alignImageValue = number(
      'Align Image (Re-navigate to screen to take effect)',
      30,
      options,
    );
    const alignItemValue = number('Align Item', 85, options);

    const visibleValue = boolean('Visible', true);
    const iconButton = (
      <IconButton
        icon={Settings}
        onPress={() => {
          navigationRef.navigate('app', { screen: 'SettingsTab' });
        }}
      />
    );

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
          logoHeaderConfig: {
            Home: {
              alignImage: `${alignImageValue}%`,
              visible: visibleValue,
              item: iconButton,
              alignItem: `${alignItemValue}%`,
            },
          },
          apiBaseURL: baseURL,
        }}
      >
        <RootProviders account={'mockaccount'} authConfig={authConfig}>
          <BrandConfigProvider {...brand}>
            <LogoHeader visible={true} imageSource={logo} />
            <LoggedInStack />
          </BrandConfigProvider>
        </RootProviders>
      </DeveloperConfigProvider>
    );
  })
  .add('With App Config Configured Tabs', () => (
    <DeveloperConfigProvider
      developerConfig={{
        apiBaseURL: baseURL,
        CustomStacks: {
          CustomTabStack: () => (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center' }}>
                {'Custom Screen\nCould be a whole @react-navigation/stack'}
              </Text>
            </View>
          ),
        },
      }}
    >
      <RootProviders account={'mockaccount'} authConfig={authConfig}>
        <DataOverrideProvider
          builder={(mock) => {
            mock.onGet().reply(200, {
              homeTab: {
                tiles: ['myDataTile'],
                myDataSettings: {
                  components: [],
                },
              },
              tabsConfig: {
                tabs: [
                  {
                    name: 'af5242b5-2cc6-4189-8859-f92552aea14b',
                    label: 'Home',
                    type: 'home',
                    icon: 'home',
                  },
                  {
                    name: 'a70e806d-f108-4c45-ab70-d40fc5f757fb',
                    label: 'Notifications',
                    type: 'notifications',
                    icon: 'bell',
                  },
                  {
                    name: 'ca21f64d-4ea8-46ac-ab9a-f47055e8225f',
                    label: 'Settings',
                    type: 'settings',
                    icon: 'settings',
                  },
                  {
                    name: '5e3228b9-7e12-4fb8-bb04-c180ebd139db',
                    label: 'Custom',
                    type: 'customTab',
                    icon: 'zap',
                    initialParams: {
                      name: 'CustomTabStack',
                    },
                  },
                  {
                    name: 'ff49b800-5940-4bad-a55d-790ad1d0661a',
                    label: 'Authed App Tile',
                    type: 'appTile',
                    icon: 'user-key',
                    initialParams: {
                      appTile: {
                        title: 'Authed App Tile',
                        source: {
                          url: 'https://lifeapplets.dev.lifeomic.com/my-data/#/',
                        },
                        callbackUrls: [
                          'https://lifeapplets.dev.lifeomic.com/my-data/',
                        ],
                        clientId: 'example', // requires real client id to work
                      },
                    },
                  },
                  {
                    name: '2fd1c6ce-946d-4499-a24d-8c048569ed32',
                    label: 'App Tile',
                    type: 'appTile',
                    icon: 'user',
                    initialParams: {
                      appTile: {
                        title: 'App Tile',
                        source: {
                          url: 'https://wikipedia.com',
                        },
                      },
                    },
                  },
                ],
              },
            });
          }}
        >
          <LoggedInStack />
        </DataOverrideProvider>
      </RootProviders>
    </DeveloperConfigProvider>
  ));

function ThemeProvider({
  children,
}: {
  children: (theme: Theme) => React.ReactElement;
}) {
  const theme = useTheme();

  return children(theme);
}
