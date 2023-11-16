import * as React from 'react';
import { AuthConfiguration } from 'react-native-app-auth';
import { AuthContextProvider } from '../hooks/useAuth';
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
import { LoggedInProviders } from './LoggedInProviders';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient();

export type RootProvidersProps = {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
};

export function RootProviders({ authConfig, children }: RootProvidersProps) {
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
                          <Toast />
                          <LoggedInProviders>{children}</LoggedInProviders>
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
