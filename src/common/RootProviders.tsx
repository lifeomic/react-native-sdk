import * as React from 'react';
import { ThemedNavigationContainer } from './ThemedNavigationContainer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthConfiguration } from 'react-native-app-auth';
import { AuthContextProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';
import { HttpClientContextProvider } from '../hooks/useHttpClient';
import { OAuthContextProvider } from '../hooks/useOAuthFlow';
import { ActiveProjectContextProvider } from '../hooks/useActiveProject';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import Toast from 'react-native-toast-message';
import { NoInternetToastProvider } from '../hooks/NoInternetToastProvider';
import { BrandConfigProvider } from '../components/BrandConfigProvider';
import { TrackTileProvider } from '../components/TrackTile/TrackTileProvider';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

const queryClient = new QueryClient();

export function RootProviders({
  authConfig,
  children,
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) {
  const { theme: customTheme } = useDeveloperConfig();
  const theme = customTheme ?? {};

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HttpClientContextProvider>
          <GraphQLClientContextProvider>
            <OAuthContextProvider authConfig={authConfig}>
              <ActiveAccountContextProvider>
                <ActiveProjectContextProvider>
                  <TrackTileProvider>
                    <BrandConfigProvider theme={theme}>
                      <NoInternetToastProvider>
                        <SafeAreaProvider>
                          <ThemedNavigationContainer>
                            {children}
                          </ThemedNavigationContainer>
                          <Toast />
                        </SafeAreaProvider>
                      </NoInternetToastProvider>
                    </BrandConfigProvider>
                  </TrackTileProvider>
                </ActiveProjectContextProvider>
              </ActiveAccountContextProvider>
            </OAuthContextProvider>
          </GraphQLClientContextProvider>
        </HttpClientContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
