import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { DirectMessagesScreen } from './DirectMessagesScreen';
import {
  useInfinitePrivatePosts,
  InfinitePrivatePostsData,
  useCreatePrivatePostMutation,
} from '../hooks/Circles/usePrivatePosts';

jest.unmock('i18next');
jest.unmock('@react-navigation/native');
jest.mock('../hooks/Circles/usePrivatePosts', () => {
  return {
    ...jest.requireActual('../hooks/Circles/usePrivatePosts'),
    useInfinitePrivatePosts: jest.fn(),
    useCreatePrivatePostMutation: jest.fn(),
  };
});

const useInfinitePrivatePostsMock = useInfinitePrivatePosts as jest.Mock;
const useCreatePrivatePostMutationMock =
  useCreatePrivatePostMutation as jest.Mock;

const navigateMock = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const InfinitePrivatePostMock: RecursivePartial<InfinitePrivatePostsData> = {
  pages: [
    {
      privatePosts: {
        pageInfo: {
          endCursor: 'some_end_cursor',
        },
        edges: [
          {
            node: {
              id: 'some_post_id',
              message: 'Hi, how are you!',
              authorId: 'otherUser',
              author: {
                profile: {
                  displayName: 'Other User',
                  picture: 'some picture',
                },
              },
            },
          },
        ],
      },
    },
  ],
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
      <DirectMessagesScreen
        navigation={navigateMock as any}
        route={
          {
            params: {
              recipientUserId: 'other_user',
              displayName: 'Other User',
            },
          } as any
        }
      />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  useInfinitePrivatePostsMock.mockReturnValue({
    isLoading: false,
    data: InfinitePrivatePostMock,
  });
});

const mockMutation = jest.fn();
useCreatePrivatePostMutationMock.mockReturnValue({
  mutateAsync: mockMutation,
});

test('renders loading indicator while posts are fetching', async () => {
  useInfinitePrivatePostsMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('sets the custom header title', async () => {
  render(directMessageScreen);
  await waitFor(() => {
    expect(navigateMock.setOptions).toHaveBeenCalledWith({
      title: 'Other User',
    });
  });
});

test('renders an incoming message', async () => {
  const { getByTestId, getByText } = render(directMessageScreen);
  const loadingWrapper = getByTestId('GC_LOADING_CONTAINER');
  fireEvent(loadingWrapper, 'layout', {
    nativeEvent: {
      layout: {
        width: 20,
        height: 2000,
      },
    },
  });

  expect(getByText('Hi, how are you!')).toBeDefined();
});

test('mutation when a new message is sent', async () => {
  const { getByTestId } = render(directMessageScreen);
  const loadingWrapper = getByTestId('GC_LOADING_CONTAINER');
  fireEvent(loadingWrapper, 'layout', {
    nativeEvent: {
      layout: {
        width: 20,
        height: 2000,
      },
    },
  });

  const textInput = getByTestId('Type a message...');
  fireEvent.changeText(textInput, 'some new message');
  const sendButton = getByTestId('GC_SEND_TOUCHABLE');
  fireEvent.press(sendButton);

  await waitFor(() => {
    expect(mockMutation).toHaveBeenCalled();
  });
});
