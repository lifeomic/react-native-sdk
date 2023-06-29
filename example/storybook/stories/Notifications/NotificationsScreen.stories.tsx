import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { NotificationsScreen } from '.';
import { PushNotificationsProvider } from '../../../../src/hooks/usePushNotifications';
import { useDeveloperConfig } from 'src';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    padding: 20,
    margin: 10,
  },
});

const PushNotificationsScreen = () => {
  const { pushNotificationsConfig } = useDeveloperConfig();

  return (
    <View>
      {pushNotificationsConfig?.enabled ? (
        <PushNotificationsProvider>
          <NotificationsScreen />
        </PushNotificationsProvider>
      ) : (
        <View>
          <Text style={styles.text}>
            Enable Push Notifications in DeveloperConfig (and refer to
            directions in README.md) to experiment with Push Notifications
          </Text>
        </View>
      )}
    </View>
  );
};

storiesOf('NotificationsScreen', module).add('demo', () => (
  <PushNotificationsScreen />
));
