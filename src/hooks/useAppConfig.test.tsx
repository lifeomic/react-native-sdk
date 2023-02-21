import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppConfig, useAppConfig, AppTile } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { useHttpClient } from './useHttpClient';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const mockAppTile = (id: string): AppTile => ({
  id,
  title: 'title',
  source: {
    url: 'url',
  },
});

const renderHookInContext = async () => {
  return renderHook(() => useAppConfig(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const configWith = (homeTab: AppConfig['homeTab']) => {
  axiosMock.onGet().reply(200, {
    homeTab,
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'acct1' },
  });
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

test('configured appTiles are returned', async () => {
  const mockAppTiles = ['appTile-1', 'appTile-2', 'appTile-3'].map(mockAppTile);
  configWith({ appTiles: mockAppTiles });
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current.data?.homeTab?.appTiles).toEqual(mockAppTiles);
  });
});
