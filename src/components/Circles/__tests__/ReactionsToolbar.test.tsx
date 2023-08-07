import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ReactionsToolbar } from '../ReactionsToolbar';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from '../../../hooks/useGraphQLClient';
import type { Post } from '../../../hooks';
import {
  useCreateReactionMutation,
  useUndoReactionMutation,
} from '../../../hooks';
import { useUser } from '../../../hooks/useUser';

jest.unmock('@react-navigation/native');
jest.useFakeTimers();
jest.mock('../../../hooks/Circles/useReactionMutations', () => ({
  useCreateReactionMutation: jest.fn(),
  useUndoReactionMutation: jest.fn(),
}));
jest.mock('../../../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

const useCreateReactionMutationMock = useCreateReactionMutation as jest.Mock;
const useUndoReactionMutationMock = useUndoReactionMutation as jest.Mock;
const useUserMock = useUser as jest.Mock;
useUserMock.mockReturnValue({
  data: {
    id: 'userId',
  },
});

const baseURL = 'https://some-domain/unit-test';
const toolbarComponent = (post: Post) => (
  <QueryClientProvider client={new QueryClient()}>
    <GraphQLClientContextProvider baseURL={baseURL} />
    <ReactionsToolbar post={post} />
  </QueryClientProvider>
);

const renderToolbar = (post: Post) => {
  return render(toolbarComponent(post));
};

test('renders toolbar without reaction when count is 0', () => {
  const post: Post = {
    __typename: 'ActivePost',
    parentId: '456',
    replies: { edges: [], pageInfo: {} },
    status: 'READY',
    id: '123',
    message: 'Some message!',
    author: {
      profile: {
        displayName: 'Joe Shmoe',
        picture: '',
      },
    },
    createdAt: '2023-05-02T02:00:00',
    replyCount: 0,
    reactionTotals: [
      {
        type: '😃',
        count: 0,
      },
    ],
  };

  const toolbar = renderToolbar(post);
  expect(toolbar.queryByTestId('😃-button')).toBe(null);
  expect(toolbar.getByTestId('select-emoji-button')).toBeDefined();
});

test('renders toolbar with reaction', () => {
  const post: Post = {
    id: '123',
    __typename: 'ActivePost',
    parentId: '456',
    replies: { edges: [], pageInfo: {} },
    status: 'READY',
    message: 'Some message!',
    author: {
      profile: {
        displayName: 'Joe Shmoe',
        picture: '',
      },
    },
    createdAt: '2023-05-02T02:00:00',
    replyCount: 0,
    reactionTotals: [
      {
        type: '😃',
        count: 1,
      },
    ],
  };

  const toolbar = renderToolbar(post);
  expect(toolbar.getByTestId('😃-button')).toBeDefined();
  expect(toolbar.getByTestId('select-emoji-button')).toBeDefined();
});

test('multiple emoji selections create and undo reaction respectively', async () => {
  const postWithReactions = (
    reactions: { type: string; count: number; userHasReacted?: boolean }[],
  ) => ({
    id: '123',
    __typename: 'ActivePost',
    parentId: '456',
    replies: { edges: [], pageInfo: {} },
    status: 'READY',
    message: 'Some message!',
    author: {
      profile: {
        displayName: 'Joe Shmoe',
        picture: '',
      },
    },
    createdAt: '2023-05-02T02:00:00',
    replyCount: 0,
    reactionTotals: reactions,
  });

  const createReaction = jest.fn();
  const undoReaction = jest.fn();
  useCreateReactionMutationMock.mockReturnValue({
    mutate: createReaction,
  });
  useUndoReactionMutationMock.mockReturnValue({
    mutate: undoReaction,
  });

  const toolbar = renderToolbar(
    postWithReactions([
      {
        type: '😃',
        count: 1,
      },
    ]),
  );

  // Confirm that selecting an emoji will create a reaction
  fireEvent.press(toolbar.getByTestId('select-emoji-button'));
  fireEvent.press(toolbar.getByText('😁'));
  expect(createReaction).toBeCalledWith({ type: '😁', postId: '123' });

  toolbar.rerender(
    toolbarComponent(
      postWithReactions([
        {
          type: '😃',
          count: 1,
        },
        {
          type: '😁',
          count: 1,
          userHasReacted: true,
        },
      ]),
    ),
  );

  expect(toolbar.getByTestId('😁-button')).toBeDefined();

  // Confirm that repeating the same selection removes the reaction
  fireEvent.press(toolbar.getByTestId('select-emoji-button'));
  fireEvent.press(toolbar.getByText('😁'));
  expect(undoReaction).toBeCalledWith({
    type: '😁',
    postId: '123',
    userId: 'userId',
  });

  toolbar.rerender(
    toolbarComponent(
      postWithReactions([
        {
          type: '😃',
          count: 1,
        },
        {
          type: '😁',
          count: 0,
          userHasReacted: false,
        },
      ]),
    ),
  );

  expect(toolbar.queryByTestId('😁-button')).toBe(null);
  undoReaction.mockClear();

  toolbar.rerender(
    toolbarComponent(
      postWithReactions([
        {
          type: '😃',
          count: 1,
        },
        {
          type: '😁',
          count: 1,
          userHasReacted: true,
        },
      ]),
    ),
  );

  expect(toolbar.getByTestId('😁-button')).toBeDefined();

  // Confirm that clicking on the reaction itself removes it
  fireEvent.press(toolbar.getByTestId('😁-button'));
  expect(undoReaction).toBeCalledWith({
    type: '😁',
    postId: '123',
    userId: 'userId',
  });
});
