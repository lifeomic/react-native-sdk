import React from 'react';
import {
  fireEvent,
  render,
} from '../../../common/testHelpers/testing-library-wrapper';
import { PostItem } from '../PostItem';
import { Post as PostType, Priority } from '../../../hooks';

jest.mock('../ReactionsToolbar');

const post: PostType = {
  id: '123',
  __typename: 'ActivePost',
  replies: { edges: [], pageInfo: {} },
  parentId: '456',
  status: 'READY',
  message: 'Some message!',
  priority: Priority.ANNOUNCEMENT,
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
      type: '',
      count: 1,
    },
  ],
};

test('renders a post', () => {
  const postItem = render(<PostItem post={post} onComment={jest.fn()} />);
  expect(postItem.getByText('Announcement')).toBeDefined();
  expect(postItem.getByText(post.message!)).toBeDefined();
  expect(postItem.getByText(post.author!.profile.displayName)).toBeDefined();
});

test('clicking comment calls onComment', () => {
  const onComment = jest.fn();
  const postItem = render(<PostItem post={post} onComment={onComment} />);

  fireEvent.press(postItem.getByText('COMMENT'));

  expect(onComment).toHaveBeenCalled();
});
