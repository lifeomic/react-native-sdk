import React, { useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useNotifications } from '../hooks/useNotifications';
import { Divider, List } from 'react-native-paper';
import { SafeAreaView, View } from 'react-native';
import formatRelative from 'date-fns/formatRelative';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { NotificationsStackParamList } from '../navigators/NotificationsStack';

type Props = NativeStackScreenProps<
  NotificationsStackParamList,
  'Notifications'
>;

export type NotificationsScreenNavigationProps = Props['navigation'];

export const NotificationsScreen = () => {
  const { isLoading, data } = useNotifications();
  const { styles } = useStyles(defaultStyles);

  const surveyIcon = useMemo(
    () => <List.Icon style={styles.icon} icon="chat-question" />,
    [styles.icon],
  );
  const noNotificationsIcon = useMemo(
    () => <List.Icon style={styles.icon} icon="bell-check-outline" />,
    [styles.icon],
  );

  if (isLoading) {
    return (
      <ActivityIndicatorView
        message={t(
          'notifications-screen-loading-notifications',
          'Loading results',
        )}
      />
    );
  }

  const notificationEntries = data?.notificationsForUser.edges.map((edge) => {
    return (
      <View key={edge.node.id}>
        <List.Item
          title={edge.node.fullText}
          titleNumberOfLines={4}
          style={styles.listItem}
          // TODO: switch to i18next formatter when available
          description={formatRelative(new Date(edge.node.time), new Date())}
          left={() => surveyIcon}
        />
        <Divider />
      </View>
    );
  });

  return (
    <View testID="notifications-screen">
      <SafeAreaView>
        <Divider />
        {notificationEntries && notificationEntries.length ? (
          notificationEntries
        ) : (
          <List.Item
            title={t(
              'no-notifications-message',
              'You have no notifications to display!',
            )}
            style={styles.listItem}
            left={() => noNotificationsIcon}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const defaultStyles = createStyles('NotificationsScreen', () => ({
  listItem: {},
  icon: { paddingLeft: 16 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type NotificationsScreenStyle = NamedStylesProp<typeof defaultStyles>;
