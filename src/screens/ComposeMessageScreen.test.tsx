import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { useMessagingProfiles } from '../hooks/useMessagingProfiles';
import { ComposeMessageScreen } from './ComposeMessageScreen';
import { useUser } from '../hooks/useUser';
import { useNavigation } from '@react-navigation/native';
import { useAppConfig } from '../hooks/useAppConfig';

jest.mock('../hooks/useMessagingProfiles');
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
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

const useMessagingProfilesMock = useMessagingProfiles as jest.Mock;
const useUserMock = useUser as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;

const baseURL = 'https://some-domain/unit-test';

const routeMap = {
  DirectMessageScreen: 'Home/DirectMessages',
};

beforeEach(() => {
  const otherProfiles = [...Array(10)].map((_, i) => ({
    id: `user-${i}`,
    profile: { displayName: `User ${i}` },
  }));
  useMessagingProfilesMock.mockReturnValue({
    data: otherProfiles,
  });
  useUserMock.mockReturnValue({
    data: {
      id: 'me',
    },
  });
  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        messageTiles: [
          {
            id: 'mockTileId',
            providerUserIds: ['me', 'user-1', 'user-2'],
          },
        ],
      },
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
        routeMapIn={routeMap}
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
        routeMapIn={routeMap}
      />
    </GraphQLClientContextProvider>,
  );

  const addButton = getByTestId('add-provider-button');
  fireEvent.press(addButton);
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
        routeMapIn={routeMap}
      />
    </GraphQLClientContextProvider>,
  );

  const addButton = getByTestId('add-provider-button');
  fireEvent.press(addButton);
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
        routeMapIn={routeMap}
      />
    </GraphQLClientContextProvider>,
  );

  const addButton = getByTestId('add-provider-button');
  fireEvent.press(addButton);
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
        routeMapIn={routeMap}
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
        routeMapIn={routeMap}
      />
    </GraphQLClientContextProvider>,
  );
  const textInput = getByTestId('Type a message...');
  fireEvent.changeText(textInput, 'some new message');

  const sendButton = getByTestId('send-button');
  fireEvent.press(sendButton);
  expect(replaceMock).not.toHaveBeenCalled();
});

test('compose button enabled when user selected and message entered', async () => {
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
        routeMapIn={routeMap}
      />
    </GraphQLClientContextProvider>,
  );
  const addButton = await getByTestId('add-provider-button');
  fireEvent.press(addButton);

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

test('cannot select more than one non-provider', async () => {
  const { getByTestId, queryAllByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        routeMapIn={routeMap}
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

  expect(queryAllByTestId('chip').length).toBe(0);

  const addButton = await getByTestId('add-patient-button');
  fireEvent.press(addButton);
  const searchBar = await getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 3');

  const item = await getByTestId('user-list-item');
  fireEvent.press(item);
  expect(queryAllByTestId('chip').length).toBe(1);

  fireEvent.changeText(searchBar, 'User 4');
  const item2 = await getByTestId('user-list-item');
  fireEvent.press(item2);
  expect(queryAllByTestId('chip').length).toBe(1);
});

test('can remove non-provider', async () => {
  const { getByTestId, queryAllByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        navigation={useNavigation() as any}
        routeMapIn={routeMap}
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

  expect(queryAllByTestId('chip').length).toBe(0);

  const addButton = await getByTestId('add-patient-button');
  fireEvent.press(addButton);
  const searchBar = await getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 3');

  const item = await getByTestId('user-list-item');
  fireEvent.press(item);
  expect(queryAllByTestId('chip').length).toBe(1);

  fireEvent.press(await getByTestId('chip'));

  expect(queryAllByTestId('chip').length).toBe(0);
});

test('can select more than one provider', async () => {
  const { getByTestId, queryAllByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        routeMapIn={routeMap}
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

  expect(queryAllByTestId('chip').length).toBe(0);

  const addButton = await getByTestId('add-provider-button');
  fireEvent.press(addButton);
  const searchBar = await getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 1');
  const item = await getByTestId('user-list-item');
  fireEvent.press(item);
  expect(queryAllByTestId('chip').length).toBe(1);

  fireEvent.changeText(searchBar, 'User 2');
  const item2 = await getByTestId('user-list-item');
  fireEvent.press(item2);
  expect(queryAllByTestId('chip').length).toBe(2);
});

test('can remove provider', async () => {
  const { getByTestId, queryAllByTestId } = render(
    <GraphQLClientContextProvider baseURL={baseURL}>
      <ComposeMessageScreen
        routeMapIn={routeMap}
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

  expect(queryAllByTestId('chip').length).toBe(0);

  const addButton = await getByTestId('add-provider-button');
  fireEvent.press(addButton);
  const searchBar = await getByTestId('search-bar');
  fireEvent.changeText(searchBar, 'User 1');
  const item = await getByTestId('user-list-item');
  fireEvent.press(item);
  expect(queryAllByTestId('chip').length).toBe(1);

  fireEvent.press(await getByTestId('chip'));

  expect(queryAllByTestId('chip').length).toBe(0);
});
