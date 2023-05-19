import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Notifications, Notification } from 'react-native-notifications';
import {
  getInitialNotification,
  onNotificationOpened,
  onNotificationReceived,
  registerDeviceToken,
  requestNotificationsPermissions,
} from '../../../../src/common/Notifications';
import { useActiveAccount } from '../../../../src/hooks/useActiveAccount';
import { useHttpClient } from '../../../../src/hooks/useHttpClient';

type EventType = 'notificationReceived' | 'notificationOpened';

type Event = {
  type: EventType;
  notification: Notification;
};

const styles = StyleSheet.create({
  openedNotificationView: {
    backgroundColor: 'lightgray',
    margin: 10,
  },
  openedNotificationText: {
    fontWeight: 'bold',
  },
  receivedNotificationView: {
    backgroundColor: 'lightblue',
    margin: 10,
  },
  recievedNotificationText: {
    fontWeight: 'bold',
  },
  deviceToken: {
    margin: 10,
    paddingTop: '20%',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    width: '49%',
  },
  clearButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    width: '43%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export const NotificationsScreen = () => {
  const [deviceToken, setDeviceToken] = useState<string | undefined>();
  const [events, setEvents] = useState<Event[]>([]);
  const { httpClient } = useHttpClient();
  const { account } = useActiveAccount();

  const sendLocalNotification = () => {
    Notifications.postLocalNotification({
      body: 'Local notification!',
      title: 'Local Notification Title',
      sound: 'chime.aiff',
      badge: 0,
      type: '',
      thread: '',
      payload: {
        category: 'SOME_CATEGORY',
        link: 'localNotificationLink',
      },
      //@ts-ignore
      android_channel_id: 'bma-example-channel',
    });
  };

  const clearLocalNotifications = () => {
    setEvents([]);
  };

  const renderOpenedNotification = (notification: Notification) => {
    return (
      <View style={styles.openedNotificationView}>
        <Text style={styles.openedNotificationText}>Notification Opened</Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
      </View>
    );
  };

  const renderReceivedNotification = (notification: Notification) => {
    return (
      <View style={styles.receivedNotificationView}>
        <Text style={styles.recievedNotificationText}>
          Notification Received
        </Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
      </View>
    );
  };

  const renderEvent = (event: Event) => {
    if (event.type === 'notificationReceived') {
      return renderReceivedNotification(event.notification);
    }
    return renderOpenedNotification(event.notification);
  };

  // Request the permissions to receive notifications
  useEffect(() => {
    requestNotificationsPermissions(({ deviceToken }) => {
      if (deviceToken && account) {
        setDeviceToken(deviceToken);

        // Register the device with the LifeOmic platform to start receiving push notifications
        registerDeviceToken({
          deviceToken,
          // TODO: update the application when the background allows BMAs
          application: 'lifeResearch', // The application name will be provided by LifeOmic upon onboarding
          httpClient,
          accountId: account.id,
        });
      }
    });
  }, [account, httpClient]);

  // Set the notification channel for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannel({
        channelId: 'starter-example-channel',
        name: 'Starter Example',
        importance: 5,
        description: 'Channel for the Starter App',
        enableLights: true,
        enableVibration: true,
        showBadge: true,
        vibrationPattern: [200, 1000, 500, 1000, 500],
      });
    }
  }, []);

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setEvents((events) => [
        { type: 'notificationOpened', notification },
        ...events,
      ]);
    });

    onNotificationReceived((notification) => {
      setEvents((events) => [
        { type: 'notificationReceived', notification },
        ...events,
      ]);
    });

    const getInitial = async () => {
      // Get the notification that opened the application
      const notification = await getInitialNotification();
      if (notification) {
        setEvents((events) => [
          { type: 'notificationOpened', notification },
          ...events,
        ]);
      }
    };

    getInitial();
  }, []);

  return (
    <View>
      <Text style={styles.deviceToken}>
        Device Token: {deviceToken ? deviceToken : 'undefined'}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendLocalNotification}
        >
          <Text style={styles.buttonText}>Send local notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearLocalNotifications}
        >
          <Text style={styles.buttonText}>Clear notifications</Text>
        </TouchableOpacity>
      </View>

      {events.map((event, idx) => (
        <View key={`event${idx}`}>{renderEvent(event)}</View>
      ))}
    </View>
  );
};
