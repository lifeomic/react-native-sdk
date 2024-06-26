import React from 'react';
import {
  fireEvent,
  render,
} from '../../../common/testHelpers/testing-library-wrapper';
import { ThreadComment } from '../ThreadComment';
import { ActiveAccountProvider, Post } from '../../../hooks';

jest.unmock('@react-navigation/native');
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
  reactionTotals: [],
  replies: {
    pageInfo: {},
    edges: [],
  },
};

describe('ThreadComment', () => {
  test('renders the component', () => {
    const { getByText } = render(
      <ActiveAccountProvider account="mockaccount">
        <ThreadComment post={mockPost} onReply={jest.fn()} />
      </ActiveAccountProvider>,
    );

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('5 minutes ago')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();
  });

  test('clicking replies calls onReply', () => {
    const onReply = jest.fn();

    const { getByText } = render(
      <ActiveAccountProvider account="mockaccount">
        <ThreadComment post={mockPost} onReply={onReply} />
      </ActiveAccountProvider>,
    );

    fireEvent.press(getByText('REPLY'));
    expect(onReply).toHaveBeenCalled();
  });
});
