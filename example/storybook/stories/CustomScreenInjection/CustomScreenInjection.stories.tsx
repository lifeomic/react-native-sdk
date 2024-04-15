import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from '../../helpers/oauthConfig';
import {
  DeveloperConfigProvider,
  RootProviders,
  LoggedInStack,
  getDefaultTabs,
} from '../../../../src';
import { withKnobs } from '@storybook/addon-knobs';
import {
  NavigationPlaygroundScreen,
  UserDetailsScreen,
  UsersScreen,
} from './customScreens';
import { Navigation } from '@lifeomic/chromicons-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

storiesOf('Custom Screen Injection', module)
  .addDecorator(withKnobs)
  .add('Default', () => {
    return (
      <DeveloperConfigProvider
        developerConfig={{
          getAdditionalHomeScreens: (paramList) => {
            const HomeStack = createNativeStackNavigator<typeof paramList>();
            return [
              <HomeStack.Screen
                name="CustomHomeScreen/Users"
                component={UsersScreen}
                options={{ title: 'Users' }}
              />,
              <HomeStack.Screen
                name="CustomHomeScreen/UserDetails"
                component={UserDetailsScreen}
              />,
            ];
          },
          componentProps: {
            TabBar: {
              tabs: [
                ...getDefaultTabs(),
                {
                  name: 'CustomTab',
                  component: NavigationPlaygroundScreen,
                  label: 'Navigation',
                  icon: Navigation,
                },
              ],
            },
          },
        }}
      >
        <RootProviders account="mockaccount" authConfig={authConfig}>
          <LoggedInStack />
        </RootProviders>
      </DeveloperConfigProvider>
    );
  });
