import React, { FC } from 'react';
import { Text } from 'react-native';
import { storiesOf } from '@storybook/react-native';

import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { action } from '@storybook/addon-actions';
import {
  AuthContextProvider,
  useAuth,
  OAuthLoginButton,
  OAuthContextProvider,
  SettingsScreen,
} from '../../../src';
import { authConfig } from './OAuth.stories';

storiesOf('App', module).add('demo', () => {
  return (
    <AuthContextProvider>
      <OAuthContextProvider authConfig={authConfig}>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </OAuthContextProvider>
    </AuthContextProvider>
  );
});

const noop = () => {};

const LoginScreen: FC = () => {
  const onFail = action('login onFail');
  return (
    <OAuthLoginButton onSuccess={noop} onFail={onFail}>
      <Text>Login</Text>
    </OAuthLoginButton>
  );
};

// TODO: Once we have some real screens in place, move all this below into src and make this story reuse it.
type LoggedInRootParamList = {
  'screens/Settings': undefined;
};

type NotLoggedInRootParamList = {
  'screens/Login': undefined;
};

function RootStack() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (isLoggedIn) {
    const Stack = createNativeStackNavigator<LoggedInRootParamList>();
    return (
      <Stack.Navigator>
        <Stack.Screen name="screens/Settings" component={SettingsScreen} />
      </Stack.Navigator>
    );
  }

  const Stack = createNativeStackNavigator<NotLoggedInRootParamList>();
  return (
    <Stack.Navigator>
      <Stack.Screen name="screens/Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
