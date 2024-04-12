import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAuth } from './useAuth';
import { useUpdateUser, useUser } from './useUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { ActiveAccountProvider } from './useActiveAccount';
import { HttpClientContextProvider } from './useHttpClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;

// This second generic is required to tell the parser that it isn't
// JSX syntax
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderInContext = async <T, _ = never>(hook: () => T) => {
  return renderHook(() => hook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ActiveAccountProvider account="mockaccount">
          <HttpClientContextProvider>{children}</HttpClientContextProvider>
        </ActiveAccountProvider>
      </QueryClientProvider>
    ),
  });
};

const api = createRestAPIMock();

beforeEach(() => {
  useAuthMock.mockReturnValue({
    authResult: { accessToken: 'accessToken' },
  });
});

test('fetches and parses user', async () => {
  const userProfile = { id: 'id', profile: {} };
  const mockGet = jest.fn().mockReturnValue({ status: 200, data: userProfile });
  api.mock('GET /v1/user', mockGet);
  const { result } = await renderInContext(() => useUser());
await waitFor(() => expect(result.current.isSuccess).toBe(true));
  await waitFor(() => expect(result.current.data).toEqual(userProfile));
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith({
    query: {},
    params: {},
    headers: expect.objectContaining({
      authorization: 'Bearer accessToken',
    }),
  });

  expect(mockGet.mock.calls[0][0].headers['LifeOmic-Account']).toBeUndefined();
});

test('useUpdateUser can update a user', async () => {
  const userProfile = { id: 'id', profile: { email: 'email' } };
  const updatedProfile = {
    ...userProfile,
    profile: {
      ...userProfile.profile,
      familyName: 'test',
    },
  };

  const mockPatch = jest.fn().mockResolvedValue({
    status: 200,
    data: updatedProfile,
  });
  api.mock('GET /v1/user', { status: 200, data: userProfile });
  api.mock('PATCH /v1/user', mockPatch);

  const { result } = await renderInContext(() => {
    const query = useUser();
    const mutation = useUpdateUser();

    return {
      data: query.data,
      mutate: mutation.mutate,
    };
  });

  await waitFor(() => {
    expect(result.current.data).toStrictEqual(userProfile);
  });

  act(() => {
    result.current.mutate({
      profile: {
        familyName: 'test',
      },
    });
  });

  await waitFor(() => expect(result.current.data).toEqual(updatedProfile));

  expect(mockPatch).toHaveBeenCalledTimes(1);
  expect(mockPatch).toHaveBeenCalledWith({
    body: {
      profile: {
        familyName: 'test',
      },
    },
    params: {},
    headers: expect.objectContaining({
      authorization: 'Bearer accessToken',
    }),
  });
  expect(
    mockPatch.mock.calls[0][0].headers['LifeOmic-Account'],
  ).toBeUndefined();
});
