import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthConfiguration } from 'react-native-app-auth';
import { AuthContextProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';
import { HttpClientContextProvider } from '../hooks/useHttpClient';
import { OAuthContextProvider } from '../hooks/useOAuthFlow';

const queryClient = new QueryClient();

export function RootProviders({
  authConfig,
  children,
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HttpClientContextProvider>
          <OAuthContextProvider authConfig={authConfig}>
            <ActiveAccountContextProvider>
              <SafeAreaProvider>
                <NavigationContainer>{children}</NavigationContainer>
              </SafeAreaProvider>
            </ActiveAccountContextProvider>
          </OAuthContextProvider>
        </HttpClientContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
