import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ActiveAccountProvider, useUser } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';
import { DirectMessagesScreen } from './DirectMessagesScreen';
import {
  useInfinitePrivatePosts,
  InfinitePrivatePostsData,
  useCreatePrivatePostMutation,
  useCreatePrivatePostAttachmentMutation,
} from '../hooks/Circles/usePrivatePosts';
import { launchImageLibrary } from 'react-native-image-picker';

jest.unmock('i18next');
jest.unmock('@react-navigation/native');
jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: jest.fn(() => 0),
}));
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));
jest.mock('../hooks/Circles/usePrivatePosts', () => {
  return {
    ...jest.requireActual('../hooks/Circles/usePrivatePosts'),
    useInfinitePrivatePosts: jest.fn(),
    useCreatePrivatePostMutation: jest.fn(),
    useCreatePrivatePostAttachmentMutation: jest.fn(),
  };
});
jest.mock('../hooks/useConversations', () => ({
  useMarkAsRead: jest.fn().mockReturnValue({
    mutateAsync: jest.fn(),
  }),
  useInfiniteConversations: jest.fn().mockReturnValue({
    pages: [
      {
        conversations: {
          edges: [{ node: { hasUnread: true, conversationsId: 'someId' } }],
        },
      },
    ],
  }),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

const launchImageLibraryMock = launchImageLibrary as jest.Mock;
const useUserMock = useUser as jest.Mock;
const useInfinitePrivatePostsMock = useInfinitePrivatePosts as jest.Mock;
const useCreatePrivatePostMutationMock =
  useCreatePrivatePostMutation as jest.Mock;
const useCreatePrivatePostAttachmentMutationMock =
  useCreatePrivatePostAttachmentMutation as jest.Mock;

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
          {
            node: {
              id: 'markdown_post_id',
              message:
                '[text](https://google.com) - renders a link.\n***text*** - renders text as bold and italic.\n**text** or __text__ - renders text as bold.\n*text* or _text_ - renders text as italic.\n~~text~~ - renders text as strikethrough.\n![image](https://reactnative.dev/img/tiny_logo.png)\nPhone (317) 555-555\nEmail: test@test.com\nUrl: www.google.com',
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

const baseURL = 'https://some-domain/unit-test';
const directMessageScreen = (
  <QueryClientProvider client={queryClient}>
    <ActiveAccountProvider account="mockaccount">
      <GraphQLClientContextProvider baseURL={baseURL}>
        <DirectMessagesScreen
          navigation={navigateMock as any}
          route={
            {
              params: {
                users: [mockMeProfile, mockYouProfile],
                conversationId: 'someId',
              },
            } as any
          }
        />
      </GraphQLClientContextProvider>
    </ActiveAccountProvider>
  </QueryClientProvider>
);

const mockMutation = jest.fn();
beforeEach(() => {
  useUserMock.mockReturnValue({
    isLoading: false,
    data: {
      id: 'me',
    },
  });
  useInfinitePrivatePostsMock.mockReturnValue({
    isLoading: false,
    data: InfinitePrivatePostMock,
  });
  useCreatePrivatePostMutationMock.mockReturnValue({
    mutateAsync: mockMutation,
  });
  useCreatePrivatePostAttachmentMutationMock.mockReturnValue({
    mutateAsync: jest.fn(),
  });
});

test('renders loading indicator while account fetching', async () => {
  useUserMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(directMessageScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
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
      title: 'You',
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

  const textInput = getByTestId('Write Your Message');
  fireEvent.changeText(textInput, 'some new message');
  const sendButton = getByTestId('GC_SEND_TOUCHABLE');
  fireEvent.press(sendButton);

  await waitFor(() => {
    expect(mockMutation).toHaveBeenCalled();
  });
});

test('can send an image message', async () => {
  let resolveAttachment = (_: unknown) => {};
  const resolvablePromise = new Promise((resolve) => {
    resolveAttachment = resolve;
  });
  useCreatePrivatePostAttachmentMutationMock.mockReturnValue({
    mutateAsync: jest.fn().mockReturnValue(resolvablePromise),
  });
  launchImageLibraryMock.mockResolvedValue({
    assets: [{ uri: 'someUri', type: 'image/jpg' }],
  });

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

  const uploadImageButton = getByTestId('upload-image-button');
  fireEvent.press(uploadImageButton);

  await waitFor(() => getByTestId('image-preview-container'));

  getByTestId('GC_SEND_TOUCHABLE_DISABLED');

  resolveAttachment({
    attachment: {
      externalId: 'externalId',
      type: 'IMAGE',
      subType: 's3',
      fileName: 'fileName',
    },
    uploadConfig: {
      id: 'id',
      fileLocation: {
        permanentUrl: 'permanentUrl',
        uploadUrl: 'uploadUrl',
      },
    },
  });

  await waitFor(() => getByTestId('GC_SEND_TOUCHABLE'));

  fireEvent.press(getByTestId('GC_SEND_TOUCHABLE'));

  await waitFor(() => {
    expect(mockMutation).toHaveBeenCalled();
  });
});

test('can remove a pending image', async () => {
  useCreatePrivatePostAttachmentMutationMock.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({
      attachment: {
        externalId: 'externalId',
        type: 'IMAGE',
        subType: 's3',
        fileName: 'fileName',
      },
      uploadConfig: {
        id: 'id',
        fileLocation: {
          permanentUrl: 'permanentUrl',
          uploadUrl: 'uploadUrl',
        },
      },
    }),
  });
  launchImageLibraryMock.mockResolvedValue({
    assets: [{ uri: 'someUri', type: 'image/jpg' }],
  });

  const { getByTestId, queryByTestId } = render(directMessageScreen);
  const loadingWrapper = getByTestId('GC_LOADING_CONTAINER');
  fireEvent(loadingWrapper, 'layout', {
    nativeEvent: {
      layout: {
        width: 20,
        height: 2000,
      },
    },
  });

  const uploadImageButton = getByTestId('upload-image-button');
  fireEvent.press(uploadImageButton);

  await waitFor(() => getByTestId('image-preview-container'));
  await waitFor(() => getByTestId('GC_SEND_TOUCHABLE'));

  fireEvent.press(getByTestId('remove-image-button'));

  await waitFor(() => {
    expect(queryByTestId('image-preview-container')).toBeNull();
  });
});

test('can handle image upload failure', async () => {
  let resolvers: ((_: unknown) => void)[] = [];
  let i = 0;
  useCreatePrivatePostAttachmentMutationMock.mockReturnValue({
    mutateAsync: jest.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          // simulate second image upload failure
          resolvers.push(++i === 2 ? reject : resolve);
        }),
    ),
  });
  launchImageLibraryMock.mockResolvedValue({
    assets: [
      { uri: 'someUri1', type: 'image/jpg' },
      { uri: 'someUri2', type: 'image/jpg' },
      { uri: 'someUri3', type: 'image/jpg' },
    ],
  });

  const { getByTestId, queryAllByTestId } = render(directMessageScreen);
  const loadingWrapper = getByTestId('GC_LOADING_CONTAINER');
  fireEvent(loadingWrapper, 'layout', {
    nativeEvent: {
      layout: {
        width: 20,
        height: 2000,
      },
    },
  });

  const uploadImageButton = getByTestId('upload-image-button');
  fireEvent.press(uploadImageButton);

  await waitFor(() => {
    // Shows three image previews initially while upload is pending
    expect(queryAllByTestId('image-preview-container')).toHaveLength(3);
  });

  expect(resolvers).toHaveLength(3);
  resolvers.forEach((resolver, i) =>
    resolver({
      attachment: {
        externalId: 'externalId',
        type: 'IMAGE',
        subType: 's3',
        fileName: 'fileName',
      },
      uploadConfig: {
        id: 'id',
        fileLocation: {
          permanentUrl: `someUri${i + 1}`,
          uploadUrl: 'uploadUrl',
        },
      },
    }),
  );

  await waitFor(() => getByTestId('GC_SEND_TOUCHABLE'));

  await waitFor(() => {
    // Shows two image previews because second upload failed
    expect(queryAllByTestId('image-preview-container')).toHaveLength(2);
  });
});
