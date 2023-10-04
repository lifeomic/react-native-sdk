import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import {
  UserData,
  useLookupUsers,
  useLookupUsersFirstPost,
} from '../hooks/Circles/usePrivatePosts';
import { MessageScreen } from './MessageScreen';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

jest.mock('../hooks/Circles/usePrivatePosts', () => {
  return {
    ...jest.requireActual('../hooks/Circles/usePrivatePosts'),
    useLookupUsers: jest.fn(),
    useLookupUsersFirstPost: jest.fn(),
  };
});
jest.mock('../hooks/useUnreadMessages');

const useLookupUserMock = useLookupUsers as jest.Mock;
const useUnreadMessagesMock = useUnreadMessages as jest.Mock;
const useLookupUsersFirstPostMock = useLookupUsersFirstPost as jest.Mock;

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
      <MessageScreen
        navigation={navigateMock as any}
        route={
          {
            params: {
              recipientsUserIds: ['no_unread_messages', 'other_user'],
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  const mockUserData: UserData = {
    user: {
      userId: 'UserId',
      profile: {
        displayName: 'UserDisplayName',
        picture: 'UserPicture',
      },
    },
  };
  useLookupUserMock.mockReturnValue([
    {
      data: mockUserData,
    },
  ]);
  useUnreadMessagesMock.mockReturnValue({
    unreadIds: [],
  });

  const mockPrivatePostData = {
    privatePosts: {
      edges: [{ node: { message: 'some message' } }],
    },
  };
  useLookupUsersFirstPostMock.mockReturnValue([{ data: mockPrivatePostData }]);
});

test('renders loading indicator while lookup queries are fetching', async () => {
  useLookupUserMock.mockReturnValue([
    {
      isInitialLoading: false,
    },
    {
      isInitialLoading: true,
    },
  ]);
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders displayName', async () => {
  const { getByTestId, getByText } = render(directMessageScreen);
  expect(getByTestId('user-list-item')).toBeDefined();
  expect(getByText('UserDisplayName')).toBeDefined();
});

test('calls navigate with params', async () => {
  const { getByTestId } = render(directMessageScreen);
  const userListItem = getByTestId('user-list-item');
  expect(userListItem).toBeDefined();
  fireEvent.press(userListItem);
  expect(navigateMock.navigate).toBeCalledWith('Home/DirectMessage', {
    displayName: 'UserDisplayName',
    recipientUserId: 'UserId',
  });
});

test('renders badge if unread messages are available and sorts list', async () => {
  const mockFirstUser: UserData = {
    user: {
      userId: 'no_unread_messages',
      profile: {
        displayName: 'Should be second',
        picture: 'UserPicture',
      },
    },
  };
  const mockSecondUser: UserData = {
    user: {
      userId: 'other_user',
      profile: {
        displayName: 'Should be first',
        picture: 'UserPicture',
      },
    },
  };

  useLookupUserMock.mockReturnValue([
    {
      data: mockSecondUser,
    },
    {
      data: mockFirstUser,
    },
  ]);

  useLookupUsersFirstPostMock.mockReturnValue([
    {
      data: {
        privatePosts: {
          edges: [{ node: { message: 'First message' } }],
        },
      },
    },
    {
      data: {
        privatePosts: {
          edges: [{ node: { message: 'Second message' } }],
        },
      },
    },
  ]);

  useUnreadMessagesMock.mockReturnValue({
    unreadIds: ['other_user'],
  });

  const { queryAllByTestId } = render(directMessageScreen);
  const results = queryAllByTestId('user-list-item');

  expect(within(results[0]).queryAllByTestId('unread-badge')).toHaveLength(1);
  expect(within(results[0]).getByText('Should be first')).toBeDefined();
  expect(within(results[0]).getByText('First message')).toBeDefined();
  expect(within(results[1]).queryAllByTestId('unread-badge')).toHaveLength(0);
  expect(within(results[1]).getByText('Should be second')).toBeDefined();
  expect(within(results[1]).getByText('Second message')).toBeDefined();
});
