import { renderHook, waitFor } from '@testing-library/react-native';
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

test('should update the user once all hooks load and the user does not have data', async () => {
  const result = renderHook(() => useSetUserProfileEffect());
  await waitFor(() => expect(updateUser).not.toHaveBeenCalled());

  useUserMock.mockReturnValue({
    isLoading: false,
    isFetched: true,
    data: { profile: {} },
  });

  result.rerender({});
  await waitFor(() => expect(updateUser).not.toHaveBeenCalled());

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

  await waitFor(() => {
    expect(updateUser).toHaveBeenCalledWith({
      profile: {
        givenName: 'FirstName',
        familyName: 'LastName',
      },
    });
  });
});

test('should use the first official name', async () => {
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
  await waitFor(() =>
    expect(updateUser).toHaveBeenCalledWith({
      profile: {
        givenName: 'FirstName',
        familyName: 'LastName',
      },
    }),
  );
});

test('not set the username if it is already set', async () => {
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
  await waitFor(() => expect(updateUser).not.toHaveBeenCalled());
});
