import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useCreatePost, ParentType } from '../../../hooks/usePosts';
import { CreateEditPostModal } from '../CreateEditPostModal';

jest.mock('../../../hooks/usePosts');
jest.mock('../ReactionsToolbar');
jest.mock('react-native-paper', () => {
  const lib = jest.requireActual('react-native-paper');

  return {
    ...lib,
    Appbar: {
      Header: jest.fn(),
      BackAction: jest.fn(),
      Action: jest.fn(),
      Content: jest.fn(),
    },
  };
});

const useCreatePostMock = useCreatePost as jest.Mock;

test('Post button disabled if no text entered', () => {
  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });

  const setVisibleMock = jest.fn();
  const createPostModal = render(
    <CreateEditPostModal
      parentId={'123'}
      parentType={ParentType.CIRCLE}
      visible={true}
      setVisible={setVisibleMock}
    />,
  );
  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(setVisibleMock).toBeCalledTimes(0);
  expect(mutateMock).toBeCalledTimes(0);
});

test('Post button enabled if valid post is entered', () => {
  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });
  const setVisibleMock = jest.fn();
  const validPost = { message: 'Hello! This is a valid post.' };
  const createPostModal = render(
    <CreateEditPostModal
      parentId={'123'}
      parentType={ParentType.CIRCLE}
      visible={true}
      setVisible={setVisibleMock}
      postToEdit={validPost as any}
    />,
  );
  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(setVisibleMock).toBeCalledTimes(1);
  expect(mutateMock).toBeCalledTimes(1);
});

test('Post button disabled if post is too long', () => {
  const mutateMock = jest.fn();
  useCreatePostMock.mockReturnValue({
    mutate: mutateMock,
  });
  const setVisibleMock = jest.fn();
  const validPost = { message: new Array(1201 + 1).join('M') };
  const createPostModal = render(
    <CreateEditPostModal
      parentId={'123'}
      parentType={ParentType.CIRCLE}
      visible={true}
      setVisible={setVisibleMock}
      postToEdit={validPost as any}
    />,
  );
  fireEvent.press(createPostModal.getByTestId('create-post-button'));
  expect(setVisibleMock).toBeCalledTimes(0);
  expect(mutateMock).toBeCalledTimes(0);
});
