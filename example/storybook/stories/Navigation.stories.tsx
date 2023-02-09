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
  OAuthLogoutButton,
  OAuthContextProvider,
} from '../../../src';
import { authConfig } from './OAuth.stories';

storiesOf('Navigation', module).add('demo', () => {
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

const HomeScreen: FC = () => {
  const onFail = action('logout onFail');
  return (
    <OAuthLogoutButton onSuccess={noop} onFail={onFail}>
      <Text>Logout</Text>
    </OAuthLogoutButton>
  );
};

const LoginScreen: FC = () => {
  const onFail = action('logout onFail');
  return (
    <OAuthLoginButton onSuccess={noop} onFail={onFail}>
      <Text>Login</Text>
    </OAuthLoginButton>
  );
};

// TODO: Once we have some real screens in place, move all this below into src and make this story reuse it.
type LoggedInRootParamList = {
  'screens/Home': undefined;
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
        <Stack.Screen name="screens/Home" component={HomeScreen} />
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
