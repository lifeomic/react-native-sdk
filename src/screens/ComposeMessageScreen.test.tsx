import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { useProfilesForTile } from '../hooks/useUserProfiles';
import { ComposeMessageScreen } from './ComposeMessageScreen';
import { useUser } from '../hooks/useUser';
import { useNavigation } from '@react-navigation/native';

jest.mock('../hooks/useUserProfiles');
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('../hooks/Circles/usePrivatePosts', () => ({
  useCreatePrivatePostMutation: jest.fn().mockReturnValue({
    mutateAsync: jest
      .fn()
      .mockReturnValue({ createPrivatePost: { conversationId: 'id' } }),
  }),
}));

const replaceMock = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    test: 'blah',
    replace: replaceMock,
    setOptions: jest.fn(),
  }),
}));

const useProfilesForTileMock = useProfilesForTile as jest.Mock;
const useUserMock = useUser as jest.Mock;

const baseURL = 'https://some-domain/unit-test';

beforeEach(() => {
  const otherProfiles = [...Array(10)].map((_, i) => ({
    id: `user-${i}`,
    profile: { displayName: `User ${i}` },
  }));
  useProfilesForTileMock.mockReturnValue({
    others: otherProfiles,
  });
  useUserMock.mockReturnValue({
    data: {
      id: 'me',
    },
  });
});

test('no items when nothing is searched', () => {
  const { queryAllByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  expect(queryAllByTestId('user-list-item').length).toBe(0);
});

test('all items returned when matched', () => {
  const { queryAllByTestId, getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const searchBar = getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User');
  expect(queryAllByTestId('user-list-item').length).toBe(10);
});

test('single item returned when searched', () => {
  const { queryAllByTestId, getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const searchBar = getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 1');
  expect(queryAllByTestId('user-list-item').length).toBe(1);
});

test('item added as chip but removed from search when selected', () => {
  const { queryAllByTestId, getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const searchBar = getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 1');

  const item = getByTestId('user-list-item');
  expect(queryAllByTestId('chip').length).toBe(0);
  fireEvent.press(item);
  expect(queryAllByTestId('user-list-item').length).toBe(0);
  expect(queryAllByTestId('chip').length).toBe(1);
});

test('compose button disabled by default', () => {
  const { getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const sendButton = getByTestId('send-button');
  fireEvent.press(sendButton);
  expect(replaceMock).not.toHaveBeenCalled();
});

test('compose button disabled with user selected but no message text', () => {
  const { getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const textInput = getByTestId('Type a message...');
  fireEvent.changeText(textInput, 'some new message');

  const sendButton = getByTestId('send-button');
  fireEvent.press(sendButton);
  expect(replaceMock).not.toHaveBeenCalled();
});

test('compose button disabled with message text but no user selected', async () => {
  const { getByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        route={
          {
            params: {
              tileId: 'mockTileId',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>,
  );
  const searchBar = await getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 1');

  const item = await getByTestId('user-list-item');
  fireEvent.press(item);

  const textInput = await getByTestId('Type a message...');
  fireEvent.changeText(textInput, 'some new message');

  const sendButton = await getByTestId('send-button');
  fireEvent.press(sendButton);

  // TODO: This test exits with an open handle which I've
  // attempted to fix but came up emtpy. Moving on for now.
  await waitFor(() => {
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });
});
