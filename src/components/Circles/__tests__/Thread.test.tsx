import React from 'react';
import { render } from '@testing-library/react-native';
import { Thread } from '../Thread';
import { usePost, Post } from '../../../hooks/usePost';

jest.mock('../../../hooks/usePost', () => ({
  usePost: jest.fn(() => ({})),
}));

const mockUsePost = usePost as jest.Mock;

const mockPost: Post = {
  id: 'post',
  parentId: '',
  replyCount: 1,
  createdAt: '2021-11-22T18:42:36.000Z',
  author: {
    profile: {
      displayName: 'Shaggy',
    },
  },
  __typename: 'ActivePost',
  message: 'Zoinks!',
  priority: 'high',
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
            },
          },
          __typename: 'ActivePost',
          message: 'Jinkies!',
          attachments: [],
          reactionTotals: [],
          priority: 'low',
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
                    },
                  },
                  __typename: 'ActivePost',
                  message: 'Ruh Roh!',
                  attachments: [],
                  reactionTotals: [],
                  priority: 'low',
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

describe('Thread', () => {
  test('renders the component by fetching the post based on the postId', () => {
    mockUsePost.mockReturnValue({ data: { post: mockPost } });

    const { getByText } = render(<Thread postId="post" />);

    expect(mockUsePost).toHaveBeenCalledWith('post', false);

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();

    expect(getByText('Velma')).toBeDefined();
    expect(getByText('Jinkies!')).toBeDefined();

    expect(getByText('Scooby Doo')).toBeDefined();
    expect(getByText('Ruh Roh!')).toBeDefined();
  });

  test('renders the component by passing a post to it directly', () => {
    mockUsePost.mockReturnValue({});

    const { getByText } = render(<Thread postId="" post={mockPost} />);

    expect(mockUsePost).toHaveBeenCalledWith('', true); // will not fetch the post

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();

    expect(getByText('Velma')).toBeDefined();
    expect(getByText('Jinkies!')).toBeDefined();

    expect(getByText('Scooby Doo')).toBeDefined();
    expect(getByText('Ruh Roh!')).toBeDefined();
  });

  test('can handle a post with no replies', () => {
    mockUsePost.mockReturnValue({});

    const post = Object.assign({}, mockPost);
    post.replies = undefined as any;

    const { getByText } = render(<Thread postId="" post={post} />);

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();
  });

  test('does not display the post if there is an error and displays a message', () => {
    mockUsePost.mockReturnValue({
      error: 'some error',
      data: { post: undefined },
    });

    const { getByText, queryByText } = render(<Thread postId="post" />);

    expect(getByText('Oh No!')).toBeDefined();
    expect(queryByText('Shaggy')).toBeNull();
  });
});
