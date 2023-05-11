import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PostsList } from '../PostsList';
import { CircleTile } from '../../../hooks/useAppConfig';
import { useInfinitePosts, useCreatePost } from '../../../hooks/usePosts';

jest.mock('../../../hooks/usePosts');
jest.mock('../ReactionsToolbar');

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

  const circleTile: CircleTile = {
    circleName: 'Some Circle',
    circleId: 'Some CircleId',
    isMember: true,
    buttonText: 'Some Text',
  };

  const postsList = render(<PostsList circleTile={circleTile} />);
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

  const circleTile: CircleTile = {
    circleName: 'Some Circle',
    circleId: 'Some CircleId',
    isMember: true,
    buttonText: 'Some Text',
  };
  const postsList = render(<PostsList circleTile={circleTile} />);
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

  const circleTile: CircleTile = {
    circleName: 'Some Circle',
    circleId: 'Some CircleId',
    isMember: true,
    buttonText: 'Some Text',
  };

  const postsList = render(<PostsList circleTile={circleTile} />);
  expect(postsList.queryByPlaceholderText('What do you want to share?')).toBe(
    null,
  );

  fireEvent.press(postsList.getByTestId('new-post-button'));
  expect(
    postsList.findByPlaceholderText('What do you want to share?'),
  ).toBeDefined();
});
