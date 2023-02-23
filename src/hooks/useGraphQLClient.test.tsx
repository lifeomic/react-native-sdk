import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AuthResult, useAuth } from './useAuth';
import {
  GraphQLClientContextProvider,
  useGraphQLClient,
} from './useGraphQLClient';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;

const authResult: AuthResult = {
  tokenType: 'bearer',
  accessTokenExpirationDate: new Date().toISOString(),
  accessToken: 'accessToken',
  idToken: 'idToken',
  refreshToken: 'refreshToken',
};

const baseURL = 'http://localhost:8080/unit-test/v1/graphql';
const renderHookInContext = async () => {
  return renderHook(() => useGraphQLClient(), {
    wrapper: ({ children }) => (
      <GraphQLClientContextProvider baseURL={baseURL}>
        {children}
      </GraphQLClientContextProvider>
    ),
  });
};

beforeEach(() => {
  useAuthMock.mockReturnValue({});
});

test('initial state test', async () => {
  const { result } = await renderHookInContext();
  expect(result.current.graphQLClient).toBeDefined();
});

test('if authResult is not present, has no Authorization header', async () => {
  const { result } = await renderHookInContext();
  const scope = mockGraphQLResponse(baseURL, {
    authorization: undefined,
  });
  await result.current.graphQLClient.request('');
  scope.done();
});

test('once authResult is set, adds bearer token', async () => {
  const { result, rerender } = await renderHookInContext();

  act(() => {
    useAuthMock.mockReturnValue({ authResult });
    rerender({});
  });

  const scope = mockGraphQLResponse(baseURL, {
    'content-type': 'application/json',
    authorization: `Bearer ${authResult.accessToken}`,
  });

  await result.current.graphQLClient.request('');
  scope.done();
});
