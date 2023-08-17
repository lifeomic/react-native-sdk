import React, { useCallback, useLayoutEffect } from 'react';
import { useHasNewMessagesFromUsers, useStyles, useUser } from '../hooks';
import { Badge, Divider, List } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { ScrollView, View } from 'react-native';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { HomeStackScreenProps } from '../navigators/types';
import { ActivityIndicatorViewStyles } from '../components';
import { t } from 'i18next';

export function MessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Messages'>) {
  const { recipientsUserIds } = route.params;
  const { styles } = useStyles(defaultStyles);
  const { data } = useUser();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'My Messages'),
    });
  }, [navigation]);

  const { User } = useIcons();

  const unreadIds = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipientsUserIds,
  });

  const handlePostTapped = useCallback(
    (userId: string) => () => {
      navigation.navigate('Home/DirectMessage', { recipientUserId: userId });
    },
    [navigation],
  );

  const renderLeft = useCallback(
    (props: any) => <List.Icon {...props} icon={User} />,
    [User],
  );

  const renderRight = useCallback(
    (userId: string) => unreadIds?.includes(userId) && <Badge size={12} />,
    [unreadIds],
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {recipientsUserIds?.map((userId) => (
          <TouchableOpacity
            key={`message-${userId}`}
            onPress={handlePostTapped(userId)}
            activeOpacity={0.6}
          >
            <List.Item
              left={renderLeft}
              title={userId}
              right={() => renderRight(userId)}
            />
            <Divider />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const defaultStyles = createStyles('Messages', (theme) => {
  const activityIndicatorStyle: ActivityIndicatorViewStyles = {
    view: { paddingTop: theme.spacing.medium },
  };

  return {
    rootView: { minHeight: '100%', maxHeight: '100%' },
    scrollView: { minHeight: '100%' },
    morePostsIndicator: activityIndicatorStyle,
    noPostsText: {},
    fabView: {
      position: 'absolute',
      margin: theme.spacing.medium,
      right: 0,
      bottom: 0,
      borderRadius: 32,
    },
    repliesContainer: {
      marginLeft: theme.spacing.medium,
    },
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostsListStyle = NamedStylesProp<typeof defaultStyles>;
