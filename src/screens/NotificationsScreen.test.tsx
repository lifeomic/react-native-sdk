import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useActiveAccount, useUser } from '../hooks';
import { NotificationQueryResponse } from '../hooks/useNotifications';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';
import { NotificationsScreen } from './NotificationsScreen';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test/v1/graphql';
const notificationsScreen = (
  <QueryClientProvider client={queryClient}>
    <GraphQLClientContextProvider baseURL={baseURL}>
      <NotificationsScreen />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useUserMock = useUser as jest.Mock;

beforeEach(() => {
  useUserMock.mockReturnValue({
    data: {
      id: 'userId',
      profile: {},
    },
    isLoading: false,
  });
  useActiveAccountMock.mockReturnValue({
    accountHeaders: {
      'LifeOmic-Account': 'unittest',
    },
  });
});

test('renders loading indicator while user is fetching', async () => {
  useUserMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(notificationsScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders no notification message', async () => {
  const notificationResponse: NotificationQueryResponse = {
    notificationsForUser: {
      edges: [],
    },
  };
  const scope = mockGraphQLResponse(baseURL, undefined, notificationResponse);
  const { getByTestId } = render(notificationsScreen);
  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
  });
  expect(getByTestId('no-notifications-message')).toBeDefined();
});

test('renders notifications', async () => {
  const notificationText =
    "You've been invited to take the Top 10 Foods survey by LifeOmic.";
  const notificationResponse: NotificationQueryResponse = {
    notificationsForUser: {
      edges: [
        {
          node: {
            __typename: 'SurveyAssignedNotification',
            id: '1234',
            fullText: notificationText,
            time: new Date().toString(),
            surveyName: 'Top 10 Foods',
            organizationName: 'LifeOmic',
          },
        },
      ],
    },
  };
  const scope = mockGraphQLResponse(baseURL, undefined, notificationResponse);
  const { getByTestId, getByText } = render(notificationsScreen);
  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
  });
  const notification = getByTestId('notification-0');
  expect(notification).toBeDefined();
  expect(getByText(notificationText)).toBeDefined();
});