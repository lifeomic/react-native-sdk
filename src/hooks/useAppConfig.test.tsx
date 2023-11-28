import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAppConfig, AppTile } from './useAppConfig';
import { useActiveProject } from './useActiveProject';
import { HttpClientContextProvider } from './useHttpClient';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveAccountProvider } from './useActiveAccount';

const api = createRestAPIMock();

jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));

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
        <ActiveAccountProvider account="mockaccount">
          <HttpClientContextProvider>{children}</HttpClientContextProvider>
        </ActiveAccountProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
  });
});

test('configured appTiles are returned', async () => {
  const mockAppTiles = ['appTile-1', 'appTile-2', 'appTile-3'].map(mockAppTile);
  api.mock('GET /v1/life-research/projects/:projectId/app-config', {
    status: 200,
    data: {
      homeTab: {
        appTiles: mockAppTiles,
      },
    },
  });
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current.data?.homeTab?.appTiles).toEqual(mockAppTiles);
  });
});
