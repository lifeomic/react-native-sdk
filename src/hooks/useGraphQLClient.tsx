import React, { useContext, useMemo } from 'react';
import {
  ApolloClient,
  ApolloContextValue,
  ApolloLink,
  getApolloContext,
  InMemoryCache,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
const { buildAxiosFetch } = require('@lifeomic/axios-fetch');
import { useHttpClient } from './useHttpClient';

const ApolloContext = getApolloContext();

/**
 * The GraphQLClientContextProvider's job is to provide an apollo client that
 * takes care of things like managing the HTTP Authorization header and
 * other default behavior.
 */
export const GraphQLClientContextProvider = ({
  injectedApolloClient,
  children,
}: {
  injectedApolloClient?: ApolloClient<any>;
  children?: React.ReactNode;
}) => {
  const { httpClient } = useHttpClient();

  const client = useMemo(() => {
    let apolloClient = injectedApolloClient;
    if (!apolloClient) {
      apolloClient = new ApolloClient({
        cache: new InMemoryCache(),
        assumeImmutableResults: true,
      });
    }
    const httpLink = new BatchHttpLink({
      uri: '/v1/graphql',
      fetch: buildAxiosFetch(httpClient),
      credentials: 'include',
    });
    const link = ApolloLink.from([httpLink]);
    apolloClient.setLink(link);

    return apolloClient;
  }, [httpClient, injectedApolloClient]);

  const context: ApolloContextValue = { client };

  return (
    <ApolloContext.Provider value={context}>{children}</ApolloContext.Provider>
  );
};

export const useGraphQLClient = () => useContext(ApolloContext);
