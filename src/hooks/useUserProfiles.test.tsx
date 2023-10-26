import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  UserProfilesContextProvider,
  useProfilesForTile,
} from './useUserProfiles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppConfig } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useUser } from './useUser';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
const api = createRestAPIMock();

jest.mock('./useAppConfig');
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useActiveAccount');
jest.mock('./useUser');

const useUserMock = useUser as jest.Mock;
useUserMock.mockReturnValue({
  data: {
    id: 'user1',
  },
});

const renderHookInContext = async () => {
  return renderHook(() => useProfilesForTile('someTileId'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <UserProfilesContextProvider>{children}</UserProfilesContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  (useAppConfig as jest.Mock).mockReturnValue({
    data: {
      homeTab: {
        messageTiles: [
          {
            id: 'someTileId',
            userIds: ['user1', 'user2', 'user3'],
          } as any,
        ],
      },
    },
  });
  (useActiveAccount as jest.Mock).mockReturnValue({
    isLoading: false,
  });
});

test('gets profiles based on tileId and populates with placeholder data', async () => {
  const getProfile = (userId: string) => ({
    id: userId,
    profile: {
      displayName: userId,
    },
  });

  const all = [getProfile('user1'), getProfile('user2'), getProfile('user3')];
  const others = [getProfile('user2'), getProfile('user3')];

  const { result } = await renderHookInContext();
  await waitFor(() => result.current);
  expect(result.current).toEqual({ all: all, others: others });
});

test('Eventually fetches profiles from the API', async () => {
  const profile1 = jest.fn();
  const profile2 = jest.fn();
  const profile3 = jest.fn();

  api.mockOrdered('GET /v1/users/:userId', [
    profile1.mockResolvedValue({
      status: 200,
      data: { id: 'user1', profile: { displayName: 'Tom' } } as any,
    }),
    profile2.mockResolvedValue({
      status: 200,
      data: { id: 'user2', profile: { displayName: 'Jim' } } as any,
    }),
    profile3.mockResolvedValue({
      status: 200,
      data: { id: 'user3', profile: { displayName: 'Frank' } } as any,
    }),
  ]);

  const all = [
    {
      id: 'user1',
      profile: {
        displayName: 'Tom',
      },
    },
    {
      id: 'user2',
      profile: {
        displayName: 'Jim',
      },
    },
    {
      id: 'user3',
      profile: {
        displayName: 'Frank',
      },
    },
  ];
  const others = [
    {
      id: 'user2',
      profile: {
        displayName: 'Jim',
      },
    },
    {
      id: 'user3',
      profile: {
        displayName: 'Frank',
      },
    },
  ];

  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(profile1).toHaveBeenCalled();
    expect(profile2).toHaveBeenCalled();
    expect(profile3).toHaveBeenCalled();
  });

  expect(result.current).toEqual({ all: all, others: others });
});
