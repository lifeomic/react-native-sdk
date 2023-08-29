import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import { useUser } from './useUser';

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

export type PrivatePostNotification = NotificationBase & {
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
      node:
        | PostReplyNotification
        | SurveyAssignedNotification
        | CircleAdminPostNotification
        | PrivatePostNotification;
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

export type SupportedNotifications = [
  'PostReplyNotification',
  'CircleAdminPostNotification',
  'SurveyAssignedNotification',
  'PrivatePostNotification',
];

function isSupportedNotification(
  __typename: any,
): __typename is SupportedNotifications {
  return true;
}

const selectNotifications = (
  data: NotificationQueryResponse,
): NotificationQueryResponse => {
  return {
    notificationsForUser: {
      edges: data.notificationsForUser.edges.filter((edge) =>
        isSupportedNotification(edge.node.__typename),
      ),
    },
  };
};

export function useNotifications() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const { data } = useUser();

  const queryForNotifications = useCallback(() => {
    return graphQLClient.request<NotificationQueryResponse>(
      notificationQuery,
      {
        userId: data?.id,
      },
      accountHeaders,
    );
  }, [accountHeaders, data?.id, graphQLClient]);

  return useQuery(['notifications'], queryForNotifications, {
    enabled: !!accountHeaders?.['LifeOmic-Account'] && !!data?.id,
    select: selectNotifications,
  });
}
