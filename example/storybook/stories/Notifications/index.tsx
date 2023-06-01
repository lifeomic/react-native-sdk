import React, { useContext, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Notifications, Notification } from 'react-native-notifications';
import {
  registerDeviceToken,
  requestNotificationsPermissions,
} from '../../../../src/common/Notifications';
import { PushNotificationsContext } from '../../../../src/hooks/usePushNotifications';

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
  buttonContainer: {
    paddingTop: '20%',
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
  const pushNotificationsContext = useContext(PushNotificationsContext);

  if (!pushNotificationsContext) {
    return <Text>Context is undefined</Text>;
  }

  const { events, setEvents, httpClient, account } = pushNotificationsContext;

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
      android_channel_id: 'sdk-example-channel',
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
        // Register the device with the LifeOmic platform to start receiving push notifications
        registerDeviceToken({
          deviceToken,
          application: 'lifeResearch', // The application name will be provided by LifeOmic upon onboarding
          httpClient,
          accountId: account.id,
        });
      }
    });
  }, [account, httpClient]);

  return (
    <View>
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

      {(events as unknown as Event[]).map((event: Event, idx: number) => (
        <View key={`event${idx}`}>{renderEvent(event)}</View>
      ))}
    </View>
  );
};
