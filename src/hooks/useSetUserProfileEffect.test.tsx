import { renderHook, waitFor } from '@testing-library/react-native';
import { useSetUserProfileEffect } from './useSetUserProfileEffect';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import {
  mockActiveConfig,
  mockUseSession,
  mockUser,
} from '../common/testHelpers/mockSession';

const api = createRestAPIMock();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const renderProfileHook = () =>
  renderHook(() => useSetUserProfileEffect(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });

test('should update the user once all hooks load and the user does not have data', async () => {
  const updateUser = jest.fn();
  api.mock(
    'PATCH /v1/user',
    updateUser.mockReturnValue({ status: 200, data: mockUser }),
  );

  const result = renderProfileHook();
  expect(updateUser).not.toHaveBeenCalled();

  result.rerender({});

  expect(updateUser).not.toHaveBeenCalled();

  mockUseSession({ user: undefined });
  mockActiveConfig({
    subject: { name: [{ family: 'LastName', given: ['FirstName'] }] } as any,
  });

  result.rerender({});
  await waitFor(() => {
    expect(updateUser).toHaveBeenCalled();
  });
  expect(updateUser).toHaveBeenCalledWith(
    expect.objectContaining({
      body: {
        profile: {
          givenName: 'FirstName',
          familyName: 'LastName',
        },
      },
    }),
  );
});

test('should use the first official name', async () => {
  const updateUser = jest.fn();
  api.mock(
    'PATCH /v1/user',
    updateUser.mockReturnValue({ status: 200, data: mockUser }),
  );
  mockUseSession({ user: undefined });
  mockActiveConfig({
    subject: {
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
    } as any,
  });

  renderProfileHook();

  await waitFor(() => {
    expect(updateUser).toHaveBeenCalled();
  });
  expect(updateUser).toHaveBeenCalledWith(
    expect.objectContaining({
      body: {
        profile: {
          givenName: 'FirstName',
          familyName: 'LastName',
        },
      },
    }),
  );
});

test('not set the username if it is already set', () => {
  const updateUser = jest.fn();
  api.mock(
    'PATCH /v1/user',
    updateUser.mockReturnValue({ status: 200, data: mockUser }),
  );
  mockActiveConfig({
    subject: { name: [{ family: 'Lastname', given: ['FirstName'] }] } as any,
  });

  renderProfileHook();

  expect(updateUser).not.toHaveBeenCalled();
});
