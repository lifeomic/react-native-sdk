import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { AppConfig, useAppConfig, AppTile } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { HttpClientContextProvider } from './useHttpClient';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const api = createRestAPIMock();

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;

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
      <QueryClientProvider client={new QueryClient()}>
        <HttpClientContextProvider>{children}</HttpClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

const configWith = (homeTab: AppConfig['homeTab']) => {
  api.mock(
    'GET /v1/life-research/projects/:projectId/app-config',
    jest.fn().mockReturnValue({
      status: 200,
      data: { homeTab },
    }),
  );
};

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    account: 'acct1',
  });
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
  });
});

test('configured appTiles are returned', async () => {
  const mockAppTiles = ['appTile-1', 'appTile-2', 'appTile-3'].map(mockAppTile);
  configWith({ appTiles: mockAppTiles });
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current.data?.homeTab?.appTiles).toEqual(mockAppTiles);
  });
});
