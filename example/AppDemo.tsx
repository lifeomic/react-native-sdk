import React, { FC } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { authConfig } from './storybook/stories/OAuth.stories';
import {
  ActiveAccountContextProvider,
  AuthContextProvider,
  HttpClientContextProvider,
  OAuthContextProvider,
  OAuthLoginButton,
  SettingsScreen,
  useAuth,
} from '../src';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HttpClientContextProvider>
          <OAuthContextProvider authConfig={authConfig}>
            <ActiveAccountContextProvider>
              <NavigationContainer>
                <RootStack />
              </NavigationContainer>
            </ActiveAccountContextProvider>
          </OAuthContextProvider>
        </HttpClientContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const noop = () => {};
const onFail = console.error;

const LoginScreen: FC = () => {
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

export default App;
