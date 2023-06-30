import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  getInitialNotification,
  onNotificationOpened,
  onNotificationReceived,
  safelyImportReactNativeNotifications,
} from '../../../../src/common/Notifications';

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

type PushNotificationsEventType = 'notificationReceived' | 'notificationOpened';

export type PushNotificationsEvent = {
  type: PushNotificationsEventType;
  notification: Notification;
};

export const NotificationsScreen = () => {
  const [pushNotificationsEvents, setPushNotificationsEvents] = useState<
    PushNotificationsEvent[]
  >([]);

  const sendLocalNotification = async () => {
    const { rnnotifications } = await safelyImportReactNativeNotifications();
    rnnotifications.Notifications.postLocalNotification({
      body: 'Local notification!',
      title: 'Local Notification Title',
      sound: 'chime.aiff',
      badge: 0,
      type: '',
      thread: '',
      payload: {
        category: 'LO_RN_SDK_CATEGORY',
        link: 'localNotificationLink',
      },
      //@ts-ignore
      android_channel_id: 'LifeOmic react native SDK',
    });
  };

  const clearLocalNotifications = () => {
    setPushNotificationsEvents([]);
  };

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setPushNotificationsEvents(
        (events) =>
          [
            { type: 'notificationOpened', notification },
            ...events,
          ] as PushNotificationsEvent[],
      );
    });

    onNotificationReceived((notification) => {
      setPushNotificationsEvents(
        (events) =>
          [
            { type: 'notificationReceived', notification },
            ...events,
          ] as PushNotificationsEvent[],
      );
    });

    const getInitial = async () => {
      // Get the notification that opened the application
      const notification = await getInitialNotification();
      if (notification) {
        setPushNotificationsEvents(
          (events) =>
            [
              { type: 'notificationOpened', notification },
              ...events,
            ] as PushNotificationsEvent[],
        );
      }
    };

    getInitial();
  }, []);

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

  const renderEvent = (event: PushNotificationsEvent) => {
    if (event.type === 'notificationReceived') {
      return renderReceivedNotification(event.notification);
    }
    return renderOpenedNotification(event.notification);
  };

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

      {pushNotificationsEvents.map(
        (event: PushNotificationsEvent, idx: number) => (
          <View key={`event${idx}`}>{renderEvent(event)}</View>
        ),
      )}
    </View>
  );
};
