import React from 'react';
import {
  fireEvent,
  render,
} from '../../../common/testHelpers/testing-library-wrapper';
import { PostsList } from '../PostsList';
import { CircleTile } from '../../../hooks/useAppConfig';
import { useInfinitePosts, useCreatePost } from '../../../hooks';
import { CreateEditPostModal } from '../CreateEditPostModal';

jest.unmock('@react-navigation/native');
jest.mock('../../../hooks/Circles/useInfinitePosts');
jest.mock('../../../hooks/Circles/useCreatePost');
jest.mock('../ReactionsToolbar');
const circleTile: CircleTile = {
  circleName: 'Some Circle',
  circleId: 'Some CircleId',
  isMember: true,
  buttonText: 'Some Text',
};

jest.mock('../../../hooks/Circles/useActiveCircleTile', () => ({
  useActiveCircleTile: jest.fn().mockImplementation(() => ({
    circleTile: circleTile,
  })),
}));

const useInfinitePostsMock = useInfinitePosts as jest.Mock;
const useCreatePostMock = useCreatePost as jest.Mock;

test('renders no post text when no posts are returned', () => {
  useInfinitePostsMock.mockReturnValue({
    data: {
      pages: [
        {
          postsV2: {
            edges: [],
          },
        },
      ],
    },
  });

  const postsList = render(<PostsList onOpenPost={jest.fn()} />);
  expect(postsList.getByText('No posts yet.')).toBeDefined();
});

test('renders a post', () => {
  useInfinitePostsMock.mockReturnValue({
    data: {
      pages: [
        {
          postsV2: {
            edges: [
              {
                node: {
                  message: 'Hello!',
                  createdAt: '2023-05-02T02:00:00',
                  author: {
                    profile: {
                      picture: '',
                      displayName: 'Joe Shmoe',
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  });

  const postsList = render(<PostsList onOpenPost={jest.fn()} />);
  expect(postsList.getByText('Hello!')).toBeDefined();
  expect(postsList.getByText('Joe Shmoe')).toBeDefined();
});

test('FAB shows the new post modal', () => {
  useInfinitePostsMock.mockReturnValue({
    data: {
      pages: [
        {
          postsV2: {
            edges: [],
          },
        },
      ],
    },
  });

  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });

  const postsList = render(
    <>
      <CreateEditPostModal />
      <PostsList onOpenPost={jest.fn()} />
    </>,
  );
  expect(postsList.queryByPlaceholderText('What do you want to share?')).toBe(
    null,
  );

  fireEvent.press(postsList.getByTestId('new-post-button'));
  expect(
    postsList.findByPlaceholderText('What do you want to share?'),
  ).toBeDefined();
});

test('clicking post or comment calls onOpenPost with correct data', () => {
  const post = {
    message: 'Hello!',
    createdAt: '2023-05-02T02:00:00',
    replyCount: 0,
    author: {
      profile: {
        picture: '',
        displayName: 'Joe Shmoe',
      },
    },
  };

  useInfinitePostsMock.mockReturnValue({
    data: {
      pages: [
        {
          postsV2: {
            edges: [{ node: post }],
          },
        },
      ],
    },
  });

  const onOpenPost = jest.fn();
  const postsList = render(<PostsList onOpenPost={onOpenPost} />);

  fireEvent.press(postsList.getByText('Hello!'));

  expect(onOpenPost).toHaveBeenLastCalledWith(post, false);

  fireEvent.press(postsList.getByText('COMMENT'));

  expect(onOpenPost).toHaveBeenLastCalledWith(post, true);
});
