import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useUser } from './useUser';

export type NotificationBase = {
  id: string;
  fullText: string;
  time: string;
};

export type CircleAdminPostNotification = NotificationBase & {
  __typename: 'CircleAdminPostNotification';
  post: {
    id: string;
    circle: {
      id: string;
      isMember: boolean;
    };
  };
};

export type SurveyAssignedNotification = NotificationBase & {
  __typename: 'SurveyAssignedNotification';
  surveyName: string;
  organizationName: string;
};

export type PostReplyNotification = NotificationBase & {
  __typename: 'PostReplyNotification';
  replyPost: {
    id: string;
    circle: {
      id: string;
    };
  };
};

export type PrivatePostNotification = NotificationBase & {
  __typename: 'PrivatePostNotification';
  post: {
    id: string;
    authorId: string;
  };
};

export type FeedNotification =
  | PostReplyNotification
  | SurveyAssignedNotification
  | CircleAdminPostNotification
  | PrivatePostNotification;

export type NotificationQueryResponse = {
  notificationsForUser: {
    edges: {
      node: FeedNotification;
    }[];
  };
};

const supportedNotificationTypes = [
  'PostReplyNotification',
  'CircleAdminPostNotification',
  'SurveyAssignedNotification',
  'PrivatePostNotification',
];

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
          ... on PrivatePostNotification {
            post {
              id
              __typename
              ... on ActivePost {
                authorId
              }
            }
          }
        }
      }
    }
  }
`;

export function isSupportedNotification(
  notification: any,
): notification is FeedNotification {
  return supportedNotificationTypes.includes(notification?.__typename);
}

const selectNotifications = (
  data: NotificationQueryResponse,
): NotificationQueryResponse => {
  return {
    notificationsForUser: {
      edges: data.notificationsForUser.edges.filter((edge) =>
        isSupportedNotification(edge.node),
      ),
    },
  };
};

export function useNotifications() {
  const { graphQLClient } = useGraphQLClient();
  const { data } = useUser();

  const queryForNotifications = useCallback(() => {
    return graphQLClient.request<NotificationQueryResponse>(notificationQuery, {
      userId: data?.id,
    });
  }, [data?.id, graphQLClient]);

  return useQuery(['notifications'], queryForNotifications, {
    enabled: !!data?.id,
    select: selectNotifications,
  });
}
