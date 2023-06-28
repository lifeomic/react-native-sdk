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
import { WearableLifecycleProvider } from '../components/Wearables/WearableLifecycleProvider';
import { CreateEditPostModal } from '../components/Circles/CreateEditPostModal';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { InviteProvider } from '../components/Invitations/InviteProvider';

const queryClient = new QueryClient();

export function RootProviders({
  authConfig,
  children,
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) {
  const { theme, apiBaseURL, pushNotificationsConfig } = useDeveloperConfig();

  let PushNotificationsProvider;
  if (pushNotificationsConfig?.enabled) {
    try {
      PushNotificationsProvider = require('../hooks/usePushNotifications');
    } catch (error) {
      console.log('error: ', error);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HttpClientContextProvider baseURL={apiBaseURL}>
          <GraphQLClientContextProvider baseURL={apiBaseURL}>
            <InviteProvider>
              <OAuthContextProvider authConfig={authConfig}>
                <ActiveAccountContextProvider>
                  <ActiveProjectContextProvider>
                    <TrackTileProvider>
                      <WearableLifecycleProvider>
                        <BrandConfigProvider theme={theme}>
                          <NoInternetToastProvider>
                            <ActionSheetProvider>
                              <SafeAreaProvider>
                                <ThemedNavigationContainer>
                                  {pushNotificationsConfig?.enabled && (
                                    <PushNotificationsProvider
                                      config={pushNotificationsConfig}
                                    >
                                      {children}
                                    </PushNotificationsProvider>
                                  )}
                                  {!pushNotificationsConfig?.enabled &&
                                    children}
                                </ThemedNavigationContainer>
                                <CreateEditPostModal />
                                <Toast />
                              </SafeAreaProvider>
                            </ActionSheetProvider>
                          </NoInternetToastProvider>
                        </BrandConfigProvider>
                      </WearableLifecycleProvider>
                    </TrackTileProvider>
                  </ActiveProjectContextProvider>
                </ActiveAccountContextProvider>
              </OAuthContextProvider>
            </InviteProvider>
          </GraphQLClientContextProvider>
        </HttpClientContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
