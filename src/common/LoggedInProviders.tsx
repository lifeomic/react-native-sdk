import React from 'react';

import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';
import { NotificationsManagerProvider } from '../hooks/useNotificationManager';
import { ActiveProjectContextProvider } from '../hooks/useActiveProject';
import Toast from 'react-native-toast-message';
import { TrackTileProvider } from '../components/TrackTile/TrackTileProvider';
import { WearableLifecycleProvider } from '../components/Wearables/WearableLifecycleProvider';
import { CreateEditPostModal } from '../components/Circles/CreateEditPostModal';
import { PushNotificationsProvider } from '../hooks/usePushNotifications';
import { CircleTileContextProvider } from '../hooks/Circles/useActiveCircleTile';
import { OnboardingCourseContextProvider } from '../hooks/useOnboardingCourse';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { AppConfigContextProvider } from '../hooks/useAppConfig';
import { UserProfilesContextProvider } from '../hooks/useUserProfiles';

export const LoggedInProviders = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  return (
    <ActiveAccountContextProvider>
      <ActiveProjectContextProvider>
        <AppConfigContextProvider>
          <UserProfilesContextProvider>
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
                    <Toast />
                  </OnboardingCourseContextProvider>
                </CircleTileContextProvider>
              </WearableLifecycleProvider>
            </TrackTileProvider>
          </UserProfilesContextProvider>
        </AppConfigContextProvider>
      </ActiveProjectContextProvider>
    </ActiveAccountContextProvider>
  );
};
