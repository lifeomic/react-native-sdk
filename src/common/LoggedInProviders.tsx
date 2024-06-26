import React from 'react';

import { NotificationsManagerProvider } from '../hooks/useNotificationManager';
import { ActiveProjectContextProvider } from '../hooks/useActiveProject';
import { TrackTileProvider } from '../components/TrackTile/TrackTileProvider';
import { WearableLifecycleProvider } from '../components/Wearables/WearableLifecycleProvider';
import { CreateEditPostModal } from '../components/Circles/CreateEditPostModal';
import { PushNotificationsProvider } from '../hooks/usePushNotifications';
import { CircleTileContextProvider } from '../hooks/Circles/useActiveCircleTile';
import { OnboardingCourseContextProvider } from '../hooks/useOnboardingCourse';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { AppConfigContextProvider, useAuth } from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotLoggedInRootParamList } from '../navigators';
import { LoginScreen } from '../screens/LoginScreen';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { InviteProvider } from '../components/Invitations/InviteProvider';
import { t } from 'i18next';
import AppConfigSwitcher from '../components/AppConfigSwitcher';
import { useStoredValue } from '../hooks/useStoredValue';

export type LoggedInProvidersProps = {
  children?: React.ReactNode;
};

const LoggedOutStack = createNativeStackNavigator<NotLoggedInRootParamList>();

export const LoggedInProviders = ({ children }: LoggedInProvidersProps) => {
  const auth = useAuth();
  const { pushNotificationsConfig } = useDeveloperConfig();
  const [priorLoginDetected, setLoginDetected] =
    useStoredValue('loginDetected');

  if (!auth.isLoggedIn && auth.loading) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (!auth.isLoggedIn) {
    return (
      <LoggedOutStack.Navigator>
        <LoggedOutStack.Group>
          <LoggedOutStack.Screen
            name="screens/LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </LoggedOutStack.Group>
      </LoggedOutStack.Navigator>
    );
  }

  if (!priorLoginDetected) {
    setLoginDetected('detected');
  }

  return (
    <InviteProvider>
      <ActiveProjectContextProvider>
        <AppConfigContextProvider>
          <AppConfigSwitcher />
          <TrackTileProvider>
            <WearableLifecycleProvider>
              <CircleTileContextProvider>
                <OnboardingCourseContextProvider>
                  <PushNotificationsProvider config={pushNotificationsConfig}>
                    <NotificationsManagerProvider>
                      {children}
                    </NotificationsManagerProvider>
                  </PushNotificationsProvider>
                  <CreateEditPostModal />
                </OnboardingCourseContextProvider>
              </CircleTileContextProvider>
            </WearableLifecycleProvider>
          </TrackTileProvider>
        </AppConfigContextProvider>
      </ActiveProjectContextProvider>
    </InviteProvider>
  );
};
