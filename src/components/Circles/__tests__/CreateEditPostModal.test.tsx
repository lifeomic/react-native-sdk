import React from 'react';
import {
  act,
  fireEvent,
  render,
} from '../../../common/testHelpers/testing-library-wrapper';
import {
  useUpdatePostMessage,
  useCreatePost,
  ParentType,
} from '../../../hooks';
import {
  CreateEditPostModal,
  showCreateEditPostModal,
} from '../CreateEditPostModal';

jest.mock('../../../hooks/Circles/useCreatePost');
jest.mock('../../../hooks/Circles/useUpdatePostMessage');
jest.mock('../ReactionsToolbar');

const useCreatePostMock = useCreatePost as jest.Mock;
const useUpdatePostMessageMock = useUpdatePostMessage as jest.Mock;

test('Post button disabled if no text entered', () => {
  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });

  const setVisibleMock = jest.fn();
  const createPostModal = render(<CreateEditPostModal />);
  act(() =>
    showCreateEditPostModal({
      parentId: '123',
      parentType: ParentType.CIRCLE,
    }),
  );
  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(setVisibleMock).toBeCalledTimes(0);
  expect(mutateMock).toBeCalledTimes(0);
});

test('Post button enabled if valid post is entered', () => {
  const mutateMock = jest.fn();
  useUpdatePostMessageMock.mockReturnValue({
    mutate: mutateMock,
  });
  const validPost = { message: 'Hello! This is a valid post.' };
  const createPostModal = render(<CreateEditPostModal />);
  act(() =>
    showCreateEditPostModal({
      parentId: '123',
      parentType: ParentType.CIRCLE,
      postToEdit: validPost as any,
    }),
  );

  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(mutateMock).toBeCalledTimes(1);
});

test('Post button disabled if post is too long', () => {
  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });
  const invalidPost = { message: new Array(1201 + 1).join('M') };
  const createPostModal = render(<CreateEditPostModal />);
  act(() =>
    showCreateEditPostModal({
      parentId: '123',
      parentType: ParentType.CIRCLE,
      postToEdit: invalidPost as any,
    }),
  );
  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(mutateMock).toBeCalledTimes(0);
});
