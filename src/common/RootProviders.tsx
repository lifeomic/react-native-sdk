import * as React from 'react';
import { AuthConfiguration } from 'react-native-app-auth';
import { AuthContextProvider } from '../hooks/useAuth';
import { HttpClientContextProvider } from '../hooks/useHttpClient';
import { ModifyAuthConfig, OAuthContextProvider } from '../hooks/useOAuthFlow';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { BrandConfigProvider } from '../components/BrandConfigProvider';
import { NoInternetToastProvider } from '../hooks/NoInternetToastProvider';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemedNavigationContainer } from './ThemedNavigationContainer';
import { LoggedInProviders } from './LoggedInProviders';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { LogoHeaderDimensionsContextProvider } from '../hooks/useLogoHeaderDimensions';
import { ActiveAccountProvider } from '../hooks';

const queryClient = new QueryClient();

export type RootProvidersProps = {
  account: string;
  authConfig: AuthConfiguration;
  modifyAuthConfig?: ModifyAuthConfig;
  children?: React.ReactNode;
};

export function RootProviders({
  account,
  authConfig,
  modifyAuthConfig,
  children,
}: RootProvidersProps) {
  const { apiBaseURL, theme, brand } = useDeveloperConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <ActiveAccountProvider account={account}>
        <AuthContextProvider>
          <HttpClientContextProvider baseURL={apiBaseURL}>
            <GraphQLClientContextProvider baseURL={apiBaseURL}>
              <OAuthContextProvider
                authConfig={authConfig}
                modifyAuthConfig={modifyAuthConfig}
              >
                <BrandConfigProvider theme={theme} {...brand}>
                  <NoInternetToastProvider>
                    <ActionSheetProvider>
                      <SafeAreaProvider>
                        <ThemedNavigationContainer>
                          <Toast />
                          <LoggedInProviders>
                            <LogoHeaderDimensionsContextProvider>
                              {children}
                            </LogoHeaderDimensionsContextProvider>
                          </LoggedInProviders>
                        </ThemedNavigationContainer>
                      </SafeAreaProvider>
                    </ActionSheetProvider>
                  </NoInternetToastProvider>
                </BrandConfigProvider>
              </OAuthContextProvider>
            </GraphQLClientContextProvider>
          </HttpClientContextProvider>
        </AuthContextProvider>
      </ActiveAccountProvider>
    </QueryClientProvider>
  );
}
