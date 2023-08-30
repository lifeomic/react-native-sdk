import React from 'react';

import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';
import { NotificationsManagerProvider } from '../hooks/useNotificationManager';
import { UnreadMessagesContextProvider } from '../hooks/useUnreadMessages';

export const LoggedInProviders = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <NotificationsManagerProvider>
      <UnreadMessagesContextProvider>
        <ActiveAccountContextProvider>{children}</ActiveAccountContextProvider>
      </UnreadMessagesContextProvider>
    </NotificationsManagerProvider>
  );
};
