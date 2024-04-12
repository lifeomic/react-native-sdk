import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useHttpClient } from '../useHttpClient';
import { useActiveProject } from '../useActiveProject';
import { CircleTile, useAppConfig } from '../useAppConfig';
import { useJoinCircles } from './useJoinCircles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderHookInContext = async () => {
  return renderHook(() => useJoinCircles(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

jest.mock('../useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));
jest.mock('../useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

const useActiveProjectMock = useActiveProject as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;
const useAuthMock = useAuth as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;

beforeEach(() => {
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
    activeSubjectId: 'subjectId',
  });
  useAuthMock.mockReturnValue({
    authResult: { accessToken: 'accessToken' },
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

const circleTile1: CircleTile = {
  circleId: '12345',
  circleName: 'Some Circle',
  buttonText: 'some text',
  isMember: false,
};

const circleTile2: CircleTile = {
  circleId: '23456',
  circleName: 'Some Other Circle',
  buttonText: 'some text',
  isMember: false,
};

const circleTile3: CircleTile = {
  circleId: '34567',
  circleName: 'Some Other Other Circle',
  buttonText: 'some text',
  isMember: true,
};

test('joins circles listed in app-config', async () => {
  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        tiles: [],
        appTiles: [],
        circleTiles: [circleTile1, circleTile2, circleTile3],
      },
    },
  });
  axiosMock
    .onPatch('/v1/life-research/projects/projectId/app-config/circles')
    .reply(200, {});
  const { result } = await renderHookInContext();
  await waitFor(() => expect(result.current.isSuccess).toBeDefined());
  expect(axiosMock.history.patch[0].url).toBe(
    '/v1/life-research/projects/projectId/app-config/circles',
  );
  expect(axiosMock.history.patch[0].data).toBe(
    JSON.stringify([
      { ...circleTile1, isMember: true },
      { ...circleTile2, isMember: true },
      circleTile3,
    ]),
  );
});

test('does nothing if all circles are joined', async () => {
  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        tiles: [],
        appTiles: [],
        circleTiles: [circleTile3],
      },
    },
  });
  axiosMock.reset();
  const { result } = await renderHookInContext();
  await waitFor(() => expect(result.current.isSuccess).toBeDefined());
  await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));
});
