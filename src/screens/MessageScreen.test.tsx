import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { MessageScreen } from './MessageScreen';
import { useUser } from '../hooks/useUser';
import { useInfiniteConversations } from '../hooks/useConversations';
import { useProfilesForTile } from '../hooks/useMessagingProfiles';

jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));
jest.mock('../hooks/useConversations');
jest.mock('../hooks/useMessagingProfiles');

const mockMeProfile = {
  id: 'me',
  profile: {
    displayName: 'Me',
  },
};
const mockYouProfile = {
  id: 'you',
  profile: {
    displayName: 'You',
  },
};

const useInfiniteConversationsMock = useInfiniteConversations as jest.Mock;
const useUserMock = useUser as jest.Mock;
const useProfilesForTileMock = useProfilesForTile as jest.Mock;

const navigateMock = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const directMessageScreen = (
  <MessageScreen
    navigation={navigateMock as any}
    route={
      {
        params: {
          tileId: 'mockTileId',
        },
      } as any
    }
    routeMapIn={{ DirectMessageScreen: 'Home/DirectMessage' }}
  />
);

beforeEach(() => {
  useUserMock.mockReturnValue({
    data: {
      id: 'me',
    },
  });
  useInfiniteConversationsMock.mockReturnValue({
    data: {
      pages: [
        {
          conversations: {
            edges: [
              {
                node: {
                  conversationId: 'someId',
                  userIds: ['me', 'you'],
                  latestMessageText: 'some message',
                  latestMessageTime: new Date().toISOString(),
                  latestMessageUserId: 'you',
                  hasUnread: true,
                },
              },
            ],
          },
        },
      ],
    },
  });
  useProfilesForTileMock.mockReturnValue({
    others: [mockYouProfile],
    all: [mockMeProfile, mockYouProfile],
  });
});

test('renders default displayName as loading while profiles are being fetched', () => {
  const { getByTestId, getByText } = render(directMessageScreen);
  expect(getByTestId('user-list-item')).toBeDefined();
  expect(getByText('You')).toBeDefined();
});

test('calls navigate with params', async () => {
  const { getByTestId } = render(directMessageScreen);
  const userListItem = getByTestId('user-list-item');
  expect(userListItem).toBeDefined();
  fireEvent.press(userListItem);
  expect(navigateMock.navigate).toBeCalledWith('Home/DirectMessage', {
    conversationId: 'someId',
    users: [mockMeProfile, mockYouProfile],
  });
});

test('renders badge if unread messages are available', async () => {
  useInfiniteConversationsMock.mockReturnValue({
    data: {
      pages: [
        {
          conversations: {
            edges: [
              {
                node: {
                  conversationId: 'someId',
                  userIds: ['me', 'you'],
                  latestMessageText: 'Should prefix message',
                  latestMessageTime: new Date().toISOString(),
                  latestMessageUserId: 'me',
                  hasUnread: false,
                },
              },
              {
                node: {
                  conversationId: 'someId2',
                  userIds: ['me', 'you'],
                  latestMessageText: 'Should not prefix message',
                  latestMessageTime: new Date().toISOString(),
                  latestMessageUserId: 'you',
                  hasUnread: true,
                },
              },
            ],
          },
        },
      ],
    },
  });

  const { queryAllByTestId } = render(directMessageScreen);
  const results = queryAllByTestId('user-list-item');

  expect(
    within(results[0]).getByText('You: Should prefix message'),
  ).toBeDefined();
  expect(within(results[0]).queryAllByTestId('unread-badge').length).toBe(0);

  expect(
    within(results[1]).getByText('Should not prefix message'),
  ).toBeDefined();
  expect(within(results[1]).getByTestId('unread-badge')).toBeDefined();
});
