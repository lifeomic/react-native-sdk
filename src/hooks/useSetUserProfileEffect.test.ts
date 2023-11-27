import { renderHook } from '@testing-library/react-native';
import { useUpdateUser, useUser } from './useUser';
import { useActiveProject } from './useActiveProject';
import { useSetUserProfileEffect } from './useSetUserProfileEffect';

jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('./useUser', () => ({
  useUser: jest.fn(),
  useUpdateUser: jest.fn(),
}));

const useUserMock = useUser as jest.Mock;
const useUpdateUserMock = useUpdateUser as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const updateUser = jest.fn();

beforeEach(() => {
  updateUser.mockReset();
  useUserMock.mockReturnValue({
    isLoading: true,
    updateUser,
  });
  useUpdateUserMock.mockReturnValue({
    mutate: updateUser,
  });
  useActiveProjectMock.mockReturnValue({ activeSubject: {} });
});

test('should update the user once all hooks load and the user does not have data', () => {
  const result = renderHook(() => useSetUserProfileEffect());

  expect(updateUser).not.toHaveBeenCalled();

  useUserMock.mockReturnValue({
    isLoading: false,
    isFetched: true,
    data: { profile: {} },
  });

  result.rerender({});

  expect(updateUser).not.toHaveBeenCalled();

  useActiveProjectMock.mockReturnValue({
    activeSubject: {
      name: [
        {
          family: 'LastName',
          given: ['FirstName'],
        },
      ],
    },
  });

  result.rerender({});

  expect(updateUser).toHaveBeenCalledWith({
    profile: {
      givenName: 'FirstName',
      familyName: 'LastName',
    },
  });
});

test('should use the first official name', () => {
  useUserMock.mockReturnValue({
    isLoading: false,
    isFetched: true,
    data: { profile: {} },
  });
  useActiveProjectMock.mockReturnValue({
    activeSubject: {
      name: [
        {
          use: 'nickname',
          family: 'nickname-LastName',
          given: ['nickname-FirstName'],
        },
        {
          use: 'official',
          family: 'LastName',
          given: ['FirstName'],
        },
      ],
    },
  });

  renderHook(() => useSetUserProfileEffect());

  expect(updateUser).toHaveBeenCalledWith({
    profile: {
      givenName: 'FirstName',
      familyName: 'LastName',
    },
  });
});

test('not set the username if it is already set', () => {
  useUserMock.mockReturnValue({
    isLoading: false,
    isFetched: true,
    data: {
      profile: {
        familyName: 'AlreadySet',
      },
    },
  });
  useActiveProjectMock.mockReturnValue({
    activeSubject: {
      name: [
        {
          family: 'LastName',
          given: ['FirstName'],
        },
      ],
    },
  });

  renderHook(() => useSetUserProfileEffect());

  expect(updateUser).not.toHaveBeenCalled();
});
