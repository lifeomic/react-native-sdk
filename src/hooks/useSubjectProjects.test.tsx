import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useActiveAccount } from './useActiveAccount';
import { useMe } from './useMe';
import { useHttpClient } from './useHttpClient';
import { useSubjectProjects } from './useSubjectProjects';

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useMe', () => ({
  useMe: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useMeMock = useMe as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return renderHook(() => useSubjectProjects(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    account: 'acct1',
  });
  useMeMock.mockReturnValue({
    data: [{ projectId: 'proj1' }, { projectId: 'proj2' }],
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
  axiosMock.reset();
});

test('fetches and returns projects related to useMe', async () => {
  const projectsResponse = { items: [{}, {}] };
  axiosMock.onGet().reply(200, projectsResponse);
  const { result } = await renderHookInContext();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(axiosMock.history.get[0].url).toBe('/v1/projects?id=proj1&id=proj2');
  await waitFor(() => expect(result.current.data).toEqual([{}, {}]));
});

/*
  This test used to not fetch if useMe
  returned empty. This would lead to an endless loading
  state for the useSubjectProjects query for users that
  do not have subjects, i.e, they were never invited to a project.
  To control the flow of the app (specifically to navigate to the InviteRequired screen)
  we need to know when this query has settled even if it failed.
*/

test('fetches even if useMe returns no data', async () => {
  useMeMock.mockReturnValue({
    isLoading: true,
  });
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  useMeMock.mockReturnValue({
    data: [],
  });

  rerender({});
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  useMeMock.mockReturnValue({
    data: [{ projectId: 'proj1' }, { noProjectIdEdgeCase: true }],
  });

  axiosMock.onGet().replyOnce(200, { items: [] });
  rerender({});
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(axiosMock.history.get.length).toBe(1);
  expect(result.current.data).toEqual([]);
});
