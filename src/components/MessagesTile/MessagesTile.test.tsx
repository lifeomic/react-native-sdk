import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useUser, useHasNewMessagesFromUsers } from '../../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../../hooks/useGraphQLClient';
import { MessagesTile } from '.';

jest.unmock('@react-navigation/native');
jest.mock('../../hooks/useUser', () => ({
  useUser: jest.fn(),
}));
jest.mock('../../hooks/useDirectMessageEndCursor');

const useUserMock = useUser as jest.Mock;
const useHasNewMessagesFromUsersMock = useHasNewMessagesFromUsers as jest.Mock;

const navigateMock = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const directMessageScreen = (
  <QueryClientProvider client={queryClient}>
    <GraphQLClientContextProvider baseURL={baseURL}>
      <MessagesTile
        navigation={navigateMock as any}
        id="some-messages-tile"
        title="Message your doctor"
        recipientsUserIds={['doctorId']}
      />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  useUserMock.mockReturnValue({
    isLoading: false,
    data: {
      id: 'current_user',
    },
  });
  useHasNewMessagesFromUsersMock.mockReturnValue({
    isLoading: false,
    userIds: [],
  });
});

test('renders loading indicator while user is fetching', async () => {
  useUserMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders loading indicator while unread queries are fetching', async () => {
  useHasNewMessagesFromUsersMock.mockReturnValue({
    isLoading: true,
    userIds: [],
  });
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('calls navigate with params', async () => {
  const { getByTestId, queryAllByTestId } = render(directMessageScreen);
  const messageTile = getByTestId('message-tile');
  expect(messageTile).toBeDefined();
  expect(queryAllByTestId('tile-badge')).toHaveLength(0);
  fireEvent.press(messageTile);
  expect(navigateMock.navigate).toBeCalledWith('Home/Messages', {
    recipientsUserIds: ['doctorId'],
  });
});

test('renders badge if unread messages are available', async () => {
  useHasNewMessagesFromUsersMock.mockReturnValue({
    isLoading: false,
    userIds: ['doctorId'],
  });

  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('tile-badge')).toBeDefined();
});
