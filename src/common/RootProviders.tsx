import * as React from 'react';
import { AuthConfiguration } from 'react-native-app-auth';
import { AuthContextProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpClientContextProvider } from '../hooks/useHttpClient';
import { OAuthContextProvider } from '../hooks/useOAuthFlow';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { InviteProvider } from '../components/Invitations/InviteProvider';
import { BrandConfigProvider } from '../components/BrandConfigProvider';
import { NoInternetToastProvider } from '../hooks/NoInternetToastProvider';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemedNavigationContainer } from './ThemedNavigationContainer';
const queryClient = new QueryClient();

export function RootProviders({
  authConfig,
  children,
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) {
  const { apiBaseURL, theme } = useDeveloperConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HttpClientContextProvider baseURL={apiBaseURL}>
          <GraphQLClientContextProvider baseURL={apiBaseURL}>
            <InviteProvider>
              <OAuthContextProvider authConfig={authConfig}>
                <BrandConfigProvider theme={theme}>
                  <NoInternetToastProvider>
                    <ActionSheetProvider>
                      <SafeAreaProvider>
                        <ThemedNavigationContainer>
                          {children}
                        </ThemedNavigationContainer>
                      </SafeAreaProvider>
                    </ActionSheetProvider>
                  </NoInternetToastProvider>
                </BrandConfigProvider>
              </OAuthContextProvider>
            </InviteProvider>
          </GraphQLClientContextProvider>
        </HttpClientContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
