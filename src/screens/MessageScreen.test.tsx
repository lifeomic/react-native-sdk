import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { useUser } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import {
  PageInfoData,
  UserData,
  useLookupUsers,
  usePollPageInfoForUsers,
} from '../hooks/Circles/usePrivatePosts';
import { MessageScreen } from './MessageScreen';

jest.unmock('@react-navigation/native');
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));
jest.mock('../hooks/Circles/usePrivatePosts', () => {
  return {
    ...jest.requireActual('../hooks/Circles/usePrivatePosts'),
    useLookupUsers: jest.fn(),
    usePollPageInfoForUsers: jest.fn(),
  };
});

const useUserMock = useUser as jest.Mock;
const useLookupUserMock = useLookupUsers as jest.Mock;
const usePollPageInfoForUsersMock = usePollPageInfoForUsers as jest.Mock;

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
              recipientsUserIds: ['other_user'],
            },
          } as any
        }
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
  const mockPageInfoData: PageInfoData = {
    privatePosts: {
      pageInfo: {
        endCursor: '123',
        hasNextPage: false,
      },
    },
  };
  usePollPageInfoForUsersMock.mockReturnValue([
    {
      isLoading: false,
      data: mockPageInfoData,
    },
  ]);
});

test('renders loading indicator while user is fetching', async () => {
  useUserMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders loading indicator while lookup queries are fetching', async () => {
  useLookupUserMock.mockReturnValue([
    {
      isLoading: false,
    },
    { isLoading: true },
  ]);
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders loading indicator while unread queries are fetching', async () => {
  usePollPageInfoForUsersMock.mockReturnValue([
    {
      isLoading: false,
    },
    { isLoading: true },
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
      data: mockFirstUser,
    },
    {
      data: mockSecondUser,
    },
  ]);

  const { queryAllByTestId } = render(directMessageScreen);
  const results = queryAllByTestId('user-list-item');

  expect(within(results[0]).queryAllByTestId('unread-badge')).toHaveLength(1);
  expect(within(results[0]).getByText('Should be first')).toBeDefined();
  expect(within(results[1]).queryAllByTestId('unread-badge')).toHaveLength(0);
  expect(within(results[1]).getByText('Should be second')).toBeDefined();
});
