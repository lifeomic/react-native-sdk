import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useUser } from './useUser';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';

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
