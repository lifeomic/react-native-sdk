import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';
import { Notifications } from 'react-native-notifications';
import {
  onNotificationOpened,
  requestNotificationsPermissions,
} from 'src/common';

type EventType = 'notificationReceived' | 'notificationOpened';

type Event = {
  type: EventType;
  notification: Notification;
};

export const OptionalScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [deviceToken, setDeviceToken] = useState<string | undefined>();

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
      android_channel_id: 'starter-app-channel',
    });
  };

  const renderOpenedNotification = (notification: Notification) => {
    return (
      <View style={{ backgroundColor: 'lightgray', margin: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Notification Opened</Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
        {/* <Text>{`Link: ${notification.payload.payload.link}`}</Text> */}
      </View>
    );
  };

  const renderReceivedNotification = (notification: Notification) => {
    return (
      <View style={{ backgroundColor: 'lightblue', margin: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Notification Received</Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
        {/* <Text>{`Link: ${notification.payload.payload.link}`}</Text> */}
      </View>
    );
  };

  const renderEvent = (event: Event) => {
    if (event.type === 'notificationReceived') {
      return renderReceivedNotification(event.notification);
    }
    return renderOpenedNotification(event.notification);
  };

  return (
    <View>
      <Text style={{ margin: 10 }}>test</Text>

      <Button
        title={'Send local notification'}
        onPress={sendLocalNotification}
      />

      {events.map((event, idx) => (
        <View key={`event${idx}`}>{renderEvent(event)}</View>
      ))}
    </View>
  );
};
