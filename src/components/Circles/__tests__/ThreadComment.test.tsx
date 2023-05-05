import React from 'react';
import { render } from '@testing-library/react-native';
import { ThreadComment } from '../ThreadComment';
import { Post } from 'src/hooks';

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
    edges: [],
  },
};

describe('ThreadComment', () => {
  test('renders the component', () => {
    const { getByText } = render(<ThreadComment post={mockPost} />);

    expect(getByText('Shaggy')).toBeDefined();
    expect(getByText('5 minutes ago')).toBeDefined();
    expect(getByText('Zoinks!')).toBeDefined();
  });
});
