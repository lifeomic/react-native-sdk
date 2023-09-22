import React from 'react';

import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';
import { NotificationsManagerProvider } from '../hooks/useNotificationManager';
import { UnreadMessagesContextProvider } from '../hooks/useUnreadMessages';
import { ActiveConfigContextProvider } from '../hooks/useActiveConfig';
import Toast from 'react-native-toast-message';
import { TrackTileProvider } from '../components/TrackTile/TrackTileProvider';
import { WearableLifecycleProvider } from '../components/Wearables/WearableLifecycleProvider';
import { CreateEditPostModal } from '../components/Circles/CreateEditPostModal';
import { PushNotificationsProvider } from '../hooks/usePushNotifications';
import { CircleTileContextProvider } from '../hooks/Circles/useActiveCircleTile';
import { OnboardingCourseContextProvider } from '../hooks/useOnboardingCourse';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { SessionContextProvider } from '../hooks/useSession';

export const LoggedInProviders = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  return (
    <SessionContextProvider>
      <ActiveAccountContextProvider>
        <ActiveConfigContextProvider>
          <TrackTileProvider>
            <WearableLifecycleProvider>
              <CircleTileContextProvider>
                <OnboardingCourseContextProvider>
                  <PushNotificationsProvider config={pushNotificationsConfig}>
                    <NotificationsManagerProvider>
                      <UnreadMessagesContextProvider>
                        {children}
                      </UnreadMessagesContextProvider>
                    </NotificationsManagerProvider>
                  </PushNotificationsProvider>
                  <CreateEditPostModal />
                  <Toast />
                </OnboardingCourseContextProvider>
              </CircleTileContextProvider>
            </WearableLifecycleProvider>
          </TrackTileProvider>
        </ActiveConfigContextProvider>
      </ActiveAccountContextProvider>
    </SessionContextProvider>
  );
};
