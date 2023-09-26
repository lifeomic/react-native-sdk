import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  ActiveConfigContextProvider,
  useActiveConfig,
} from './useActiveConfig';
import * as useAsyncStorage from './useAsyncStorage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';

let useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');

const mockSubjectProjects = [
  {
    id: 'proj1',
    name: 'Project 1',
  },
  {
    id: 'proj2',
    name: 'Project 1',
  },
];
const mockMe = [
  {
    projectId: 'proj1',
    subjectId: 'subject1',
  },
  {
    projectId: 'proj2',
    subjectId: 'subject2',
  },
];

const renderHookInContext = async () => {
  return renderHook(() => useActiveConfig(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <ActiveConfigContextProvider>{children}</ActiveConfigContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useAsyncStorageSpy.mockReturnValue([
    '',
    (value: string) => AsyncStorage.setItem('selectedProjectIdKey', value),
    true,
    () => {},
    () => {},
  ]);
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useActiveConfig());
  await expect(
    result.current.selectConfigByProjectId('bogus'),
  ).rejects.toBeUndefined();
});

test('converts useSubjectProjects and useMe data into helpful state', async () => {
  const { result } = await renderHookInContext();
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });
});

test('setActiveProjectId saves projectId', async () => {
  const { result } = await renderHookInContext();

  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  await act(async () => {
    result.current.selectConfigByProjectId(mockSubjectProjects[1].id);
  });

  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[1],
    activeSubjectId: mockMe[1].subjectId,
  });
});

test('setActiveProjectId ignores invalid projectId', async () => {
  const { result, rerender } = await renderHookInContext();
  await act(async () => {
    result.current.selectConfigByProjectId('invalid project');
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  await rerender({});
  act(() => {
    result.current.selectConfigByProjectId(mockSubjectProjects[1].id);
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });
});

test('uses projectId from async storage', async () => {
  useAsyncStorageSpy.mockRestore();

  AsyncStorageMock.getItem = jest
    .fn()
    .mockResolvedValueOnce(mockSubjectProjects[0].id);
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => result.current.isLoading === false);
  rerender({});
  expect(AsyncStorage.getItem).toBeCalledWith('selectedProjectIdKey:mockUser');
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  AsyncStorageMock.getItem = jest
    .fn()
    .mockResolvedValueOnce(mockSubjectProjects[1].id);
  const { result: nextResult, rerender: nextRerender } =
    await renderHookInContext();
  await waitFor(() => nextResult.current.isLoading === false);
  nextRerender({});
  expect(nextResult.current).toMatchObject({
    activeProject: mockSubjectProjects[1],
    activeSubjectId: mockMe[1].subjectId,
  });

  useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');
});

test('initial render writes selected projectId to async storage', async () => {
  await renderHookInContext();
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[0].id,
  );
});

test('setActiveProjectId writes selected projectId to async storage', async () => {
  const { result } = await renderHookInContext();
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[0].id,
  );
  await act(async () => {
    result.current.selectConfigByProjectId(mockSubjectProjects[1].id);
  });
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[1].id,
  );
});
