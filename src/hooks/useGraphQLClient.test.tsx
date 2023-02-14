import React from 'react';
import { renderHook } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  GraphQLClientContextProvider,
  useGraphQLClient,
} from './useGraphQLClient';
import { useHttpClient } from './useHttpClient';
import { gql /*useApolloClient*/ } from '@apollo/client';

jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useHttpClientMock = useHttpClient as jest.Mock;

const EXAMPLE_QUERY = gql`
  query User($userId: String!) {
    user(userId: $userId) {
      id
      displayImage
    }
  }
`;

const renderHookInContext = async () => {
  return renderHook(() => useGraphQLClient(), {
    wrapper: ({ children }) => (
      <GraphQLClientContextProvider>{children}</GraphQLClientContextProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);
beforeEach(() => {
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

test('provides client that re-uses httpClient as link', async () => {
  axiosMock.onGet('/v1/graphql').reply(200, {
    data: {},
    errors: [],
  });
  const { result } = await renderHookInContext();
  // TODO: getting `Response is not defined`
  await result.current.client?.query({
    query: EXAMPLE_QUERY,
    variables: { userId: 'userId' },
  });
  expect(axiosMock.history.get[0].url).toBe('/v1/graphql');
});

// test('useApolloClient re-uses same link', async () => {
//   axiosMock.onGet('/v1/graphql').reply(200);
//   const useApolloClientResult = renderHook(() => useApolloClient(), {
//     wrapper: ({ children }) => (
//       <GraphQLClientContextProvider>
//         {children}
//       </GraphQLClientContextProvider>
//     ),
//   });

// });
