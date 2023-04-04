import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { gql } from 'graphql-request';
import { Platform } from 'react-native';
import { useUser } from './useUser';
import useAsync from 'react-use/lib/useAsync';
import {
  Notifications,
  Registered,
  Notification,
  NotificationCompletion,
  RegistrationError,
  NotificationBackgroundFetchResult,
} from 'react-native-notifications';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { AxiosInstance } from 'axios';

export type NotificationBase = {
  __typename: string;
  id: string;
  fullText: string;
  time: string;
};

export type CircleAdminPostNotification = NotificationBase & {
  post: {
    id: string;
    circle: {
      id: string;
      isMember: boolean;
    };
  };
};

export type SurveyAssignedNotification = NotificationBase & {
  surveyName: string;
  organizationName: string;
};

export type PostReplyNotification = NotificationBase & {
  replyPost: {
    id: string;
    circle: {
      id: string;
    };
  };
};

export type NotificationQueryResponse = {
  notificationsForUser: {
    edges: {
      node:
        | PostReplyNotification
        | SurveyAssignedNotification
        | CircleAdminPostNotification;
    }[];
  };
};

const notificationQuery = gql`
  query GetNotificationsForUser($userId: ID!) {
    notificationsForUser(user: $userId) {
      edges {
        node {
          __typename
          id
          fullText
          time
          ... on SurveyAssignedNotification {
            surveyName
            organizationName
          }
          ... on CircleAdminPostNotification {
            post {
              __typename
              id
              ... on ActivePost {
                circle {
                  id
                  isMember
                }
              }
            }
          }
          ... on PostReplyNotification {
            replyPost {
              id
              __typename
              ... on ActivePost {
                circle {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

const supportedNotificationTypes = [
  'PostReplyNotification',
  'CircleAdminPostNotification',
  'SurveyAssignedNotification',
];
const selectNotifications = (
  data: NotificationQueryResponse,
): NotificationQueryResponse => {
  return {
    notificationsForUser: {
      edges: data.notificationsForUser.edges.filter((edge) =>
        supportedNotificationTypes.includes(edge.node.__typename),
      ),
    },
  };
};

export function useNotifications() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const queryForNotifications = async () => {
    return graphQLClient.request<NotificationQueryResponse>(
      notificationQuery,
      {
        userId: userData?.id,
      },
      accountHeaders,
    );
  };

  const {
    isLoading: userLoading,
    isFetched: userFetched,
    data: userData,
    error: userError,
  } = useUser();
  const {
    isLoading: notificationsLoading,
    isFetched: notificationsFetched,
    data: notificationsData,
    error: notificationsError,
  } = useQuery('notifications', queryForNotifications, {
    enabled: !!userData?.id && !!accountHeaders?.['LifeOmic-Account'],
    select: selectNotifications,
  });

  return {
    isLoading: notificationsLoading || userLoading,
    isFetched: notificationsFetched || userFetched,
    error: notificationsError || userError,
    data: notificationsData,
  };
}

const registerDeviceToken = ({
  deviceToken,
  application,
  httpClient,
}: {
  deviceToken: string;
  application: string;
  httpClient: AxiosInstance;
}) => {
  const provider = Platform.OS === 'ios' ? 'APNS' : 'GCM';
  const params = {
    provider,
    deviceToken,
    application,
  };
  httpClient.post('/device-endpoints', params);
};

export const useInitialNotification = () => {
  return useAsync(() => Notifications.getInitialNotification(), []);
};

export const useIsRegisteredForNotifications = () => {
  return useAsync(() => Notifications.isRegisteredForRemoteNotifications(), []);
};

export const useRequestNotificationPermissions = (application: string) => {
  const [deviceToken, setDeviceToken] = useState<string | undefined>();
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState<RegistrationError | undefined>();
  const { httpClient } = useHttpClient();

  useEffect(() => {
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        const { deviceToken: token } = event;
        setDeviceToken(token);
        setDenied(false);
        setError(undefined);
        registerDeviceToken({ deviceToken: token, application, httpClient });
      },
    );

    Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
      setDenied(true);
      setError(undefined);
      setDeviceToken(undefined);
    });

    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (registrationError: RegistrationError) => {
        setError(registrationError);
        setDenied(false);
        setDeviceToken(undefined);
      },
    );
  }, [application, httpClient]);

  return { deviceToken, denied, error };
};

export const useNotificationReceivedForeground = () => {
  const [notification, setNotification] = useState<Notification | undefined>();

  useEffect(() => {
    Notifications.events().registerNotificationReceivedForeground(
      (
        receivedNotification: Notification,
        completion: (response: NotificationCompletion) => void,
      ) => {
        setNotification(receivedNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );
  }, []);

  return { notification };
};

export const useRegisterNotificationReceivedBackground = () => {
  const [notification, setNotification] = useState<Notification | undefined>();

  useEffect(() => {
    Notifications.events().registerNotificationReceivedBackground(
      (
        receivedNotification: Notification,
        completion: (response: NotificationBackgroundFetchResult) => void,
      ) => {
        setNotification(receivedNotification);
        completion(NotificationBackgroundFetchResult.NEW_DATA);
      },
    );
  }, []);

  return { notification };
};

export const useNotificationOpened = () => {
  const [notification, setNotification] = useState<Notification | undefined>();

  useEffect(() => {
    Notifications.events().registerNotificationOpened(
      (
        openedNotification: Notification,
        completion: (response: NotificationCompletion) => void,
      ) => {
        setNotification(openedNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );
  }, []);

  return { notification };
};
