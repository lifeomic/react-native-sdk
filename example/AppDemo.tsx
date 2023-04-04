import React, { FC, useEffect } from 'react';
import { Button, Text } from 'react-native-paper';
import { authConfig } from './storybook/stories/OAuth.stories';
import {
  RootProviders,
  RootStack,
  useRequestNotificationPermissions,
  useIsRegisteredForNotifications,
  useNotificationReceivedForeground,
  useNotificationOpened,
  useRegisterNotificationReceivedBackground,
  useInitialNotification,
} from '../src';
import { Notifications } from 'react-native-notifications';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

const App: FC = () => {
  const { value: registered } = useIsRegisteredForNotifications();
  const { deviceToken, denied } = useRequestNotificationPermissions(
    'react-native-sdk-example',
  );

  const { notification: notificationReceived } =
    useNotificationReceivedForeground();
  const { notification: notificationOpened } = useNotificationOpened();
  const { notification: backgroundNotification } =
    useRegisterNotificationReceivedBackground();
  const { value: initialNotification } = useInitialNotification();
  const sendNotification = () => {
    let localNotification = Notifications.postLocalNotification({
      body: 'Local notification!',
      title: 'Local Notification Title',
      sound: 'chime.aiff',
      silent: false,
      category: 'SOME_CATEGORY',
      userInfo: {},
      // fireDate: new Date(),
    });
  };
  console.log({
    deviceToken,
    denied,
    registered,
    notificationOpened,
    notificationReceived,
    initialNotification,
  });

  // useEffect(() => {
  //   if (initialNotification) {
  //     console.log('A notification opened the app', { initialNotification });
  //   }
  // }, [initialNotification]);

  // useEffect(() => {
  //   if (notificationOpened) {
  //     console.log('Pressed a notification', { notificationOpened });
  //   }
  // }, [notificationOpened]);

  // useEffect(() => {
  //   if (notificationReceived) {
  //     console.log('Received a notification', { notificationReceived });
  //   }
  // }, [notificationReceived]);

  return (
    <RootProviders authConfig={authConfig}>
      <Button style={{ top: 200, left: 0 }} onPress={sendNotification}>
        Send Notification
      </Button>
    </RootProviders>
  );
};

export default App;
