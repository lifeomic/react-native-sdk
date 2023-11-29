import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AuthResult, useAuth } from './useAuth';
import {
  GraphQLClientContextProvider,
  useGraphQLClient,
} from './useGraphQLClient';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';
import { ActiveAccountProvider } from './useActiveAccount';

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

const baseURL = 'http://localhost:8080/unit-test';
const renderHookInContext = async () => {
  return renderHook(() => useGraphQLClient(), {
    wrapper: ({ children }) => (
      <ActiveAccountProvider account="mockaccount">
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </ActiveAccountProvider>
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
  const scope = mockGraphQLResponse(`${baseURL}/v1/graphql`, {
    authorization: undefined,
  });
  await result.current.graphQLClient.request('');
  scope.done();
});

test('once authResult is set, adds bearer token and account header', async () => {
  const { result, rerender } = await renderHookInContext();

  act(() => {
    useAuthMock.mockReturnValue({ authResult });
    rerender({});
  });

  const scope = mockGraphQLResponse(`${baseURL}/v1/graphql`, {
    'content-type': 'application/json',
    authorization: `Bearer ${authResult.accessToken}`,
    'lifeomic-account': 'mockaccount',
  });

  await result.current.graphQLClient.request('');
  scope.done();
});
