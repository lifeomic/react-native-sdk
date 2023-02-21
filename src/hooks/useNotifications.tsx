import { useQuery } from 'react-query';
import { gql } from 'graphql-request';
import { useUser } from './useUser';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';

const notificationQuery = gql`
  query GetNotificationsForUser($userId: ID!) {
    notificationsForUser(user: $userId) {
      edges {
        node {
          id
          fullText
          time
          ... on SurveyAssignedNotification {
            surveyName
            organizationName
          }
          ... on CircleAdminPostNotification {
            post {
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

export function useNotifications() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const queryForNotifications = async () => {
    return graphQLClient.request(
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
  });

  return {
    isLoading: notificationsLoading || userLoading,
    isFetched: notificationsFetched || userFetched,
    error: notificationsError || userError,
    data: notificationsData,
  };
}
