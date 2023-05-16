import React from 'react';
import {
  fireEvent,
  render as renderComponent,
  waitFor,
} from '@testing-library/react-native';
import { Thread } from '../Thread';
import { usePost, Post, useLoadReplies } from '../../../hooks/usePosts';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../../../hooks/usePosts', () => ({
  ...jest.requireActual('../../../hooks/usePosts'),
  usePost: jest.fn(() => ({})),
  useLoadReplies: jest.fn(() => ({})),
}));
jest.mock('../ReactionsToolbar');

const mockUsePost = usePost as jest.Mock;
const mockUseLoadReplies = useLoadReplies as jest.Mock;

const mockPost: Post = {
  id: 'post',
  parentId: '',
  replyCount: 1,
  createdAt: '2021-11-22T18:42:36.000Z',
  author: {
    profile: {
      displayName: 'Shaggy',
      picture: '',
    },
  },
  __typename: 'ActivePost',
  message: 'Zoinks!',
  metadata: {},
  status: 'status',
  attachments: [],
  reactionTotals: [],
  replies: {
    pageInfo: {},
    edges: [
      {
        node: {
          id: 'comment',
          parentId: 'post',
          replyCount: 1,
          createdAt: '2021-11-22T18:42:36.000Z',
          author: {
            profile: {
              displayName: 'Velma',
              picture: '',
            },
          },
          __typename: 'ActivePost',
          message: 'Jinkies!',
          attachments: [],
          reactionTotals: [],
          metadata: {},
          status: 'status',
          replies: {
            pageInfo: {},
            edges: [
              {
                node: {
                  id: 'reply',
                  parentId: 'comment',
                  replyCount: 0,
                  createdAt: '2021-11-22T18:42:36.000Z',
                  author: {
                    profile: {
                      displayName: 'Scooby Doo',
                      picture: '',
                    },
                  },
                  __typename: 'ActivePost',
                  message: 'Ruh Roh!',
                  attachments: [],
                  reactionTotals: [],
                  metadata: {},
                  status: 'status',
                  replies: {
                    pageInfo: {},
                    edges: [],
                  },
                },
              },
            ],
          },
        },
      },
    ],
  },
};

const render = (children: React.ReactNode) => {
  return renderComponent(
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>,
  );
};

describe('Thread', () => {
  test('renders the component by fetching the post based on the postId', () => {
    mockUsePost.mockReturnValue({ data: { post: mockPost } });

    const { getByText } = render(
      <Thread post={mockPost} onOpenThread={jest.fn()} />,
    );

    expect(mockUsePost).toHaveBeenCalledWith(mockPost);

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();

    expect(getByText('Velma')).toBeDefined();
    expect(getByText('Jinkies!')).toBeDefined();

    expect(getByText('Scooby Doo')).toBeDefined();
    expect(getByText('Ruh Roh!')).toBeDefined();
  });

  test('can handle a post with no replies', () => {
    const post = Object.assign({}, mockPost);
    post.replies = undefined as any;

    mockUsePost.mockReturnValue({
      data: { post },
    });

    const { getByText } = render(
      <Thread post={post} onOpenThread={jest.fn()} />,
    );

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();
  });

  test('does not display the post if there is an error and displays a message', () => {
    mockUsePost.mockReturnValue({
      error: 'some error',
      data: { post: undefined },
    });

    const { getByText, queryByText } = render(
      <Thread post={mockPost} onOpenThread={jest.fn()} />,
    );

    expect(getByText('Oh No!')).toBeDefined();
    expect(queryByText('Shaggy')).toBeNull();
  });

  test('calls onOpenThread when post/comments are pressed', () => {
    const post = Object.assign({}, mockPost);
    const firstComment = post.replies.edges[0].node;
    firstComment.replies = undefined as any;
    firstComment.replyCount = 0;

    mockUsePost.mockReturnValue({
      data: { post },
    });

    const onOpenThread = jest.fn();
    const { getByText } = render(
      <Thread post={post} onOpenThread={onOpenThread} />,
    );

    fireEvent.press(getByText('Jinkies!'));
    expect(onOpenThread).toHaveBeenLastCalledWith(firstComment, false);

    fireEvent.press(getByText('COMMENT'));
    expect(onOpenThread).toHaveBeenLastCalledWith(firstComment, true);
  });

  test('loads more replies when clicking Read X earlier comments', async () => {
    const post = Object.assign({}, mockPost);
    post.replies = {
      edges: [],
      pageInfo: { endCursor: 'nextPage', hasNextPage: true },
    };
    post.replyCount = 1; // Has reply but isn't loaded
    const mockLoadReplies = jest.fn();

    mockUsePost.mockReturnValue({
      data: { post },
    });
    mockUseLoadReplies.mockReturnValue({
      loadReplies: mockLoadReplies,
    });

    const { getByText } = render(
      <Thread post={post} onOpenThread={jest.fn()} />,
    );

    fireEvent.press(getByText('Read 1 earlier comments...'));

    await waitFor(() => {
      expect(mockLoadReplies).toHaveBeenCalledWith(post);
    });
  });
});