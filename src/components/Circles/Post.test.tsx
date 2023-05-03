import React from 'react';
import { render } from '@testing-library/react-native';
import { Post } from './Post';

test('renders a post', () => {
  const post = {
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
        type: '',
        count: 1,
      },
    ],
  };
  const postItem = render(<Post post={post} />);
  expect(postItem.getByText(post.message)).toBeDefined();
  expect(postItem.getByText(post.author.profile.displayName)).toBeDefined();
});
