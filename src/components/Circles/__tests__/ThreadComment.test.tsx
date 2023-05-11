import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThreadComment } from '../ThreadComment';
import { Post } from '../../../hooks';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  formatDistanceToNow: jest.fn(() => '5 minutes'),
}));
jest.mock('../ReactionsToolbar');

const mockPost: Post = {
  id: 'post',
  parentId: '',
  replyCount: 0,
  createdAt: '2021-11-22T18:42:36.000Z',
  author: {
    profile: {
      picture: '',
      displayName: 'Shaggy',
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
    edges: [],
  },
};

describe('ThreadComment', () => {
  test('renders the component', () => {
    const { getByText } = render(
      <ThreadComment post={mockPost} onComment={jest.fn()} />,
    );

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('5 minutes ago')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();
  });

  test('clicking comments calls onComment', () => {
    const onComment = jest.fn();

    const { getByText } = render(
      <ThreadComment post={mockPost} onComment={onComment} />,
    );

    fireEvent.press(getByText('0 COMMENTS'));

    expect(onComment).toHaveBeenCalled();
  });
});
