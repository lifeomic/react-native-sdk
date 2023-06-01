import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { NotificationsScreen } from '.';
import { PushNotificationsProvider } from 'src/hooks/usePushNotifications';

storiesOf('NotificationsScreen', module).add('demo', () => (
  <PushNotificationsProvider>
    <NotificationsScreen />
  </PushNotificationsProvider>
));
