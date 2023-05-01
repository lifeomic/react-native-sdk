import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './useAuth';
import { GraphQLClient as GQLClient } from 'graphql-request';

const defaultBaseURL = 'https://api.us.lifeomic.com/v1/graphql';
const defaultHeaders = {
  'Content-Type': 'application/json',
};

const defaultGraphQLClientInstance = new GQLClient(defaultBaseURL, {
  headers: defaultHeaders,
});

interface GraphQLClient {
  graphQLClient: GQLClient;
}

const GraphQLClientContext = createContext<GraphQLClient>({
  graphQLClient: defaultGraphQLClientInstance,
});

/**
 * The GraphQLClientContextProvider's job is to provide an GraphQL client that
 * takes care of things like managing the HTTP Authorization header and
 * other default behavior.
 */
export const GraphQLClientContextProvider = ({
  injectedGraphQLInstance,
  baseURL,
  children,
}: {
  injectedGraphQLInstance?: GQLClient;
  baseURL?: string;
  children?: React.ReactNode;
}) => {
  const { authResult } = useAuth();
  const graphQLInstance =
    injectedGraphQLInstance || defaultGraphQLClientInstance;

  if (baseURL) {
    graphQLInstance.setEndpoint(`${baseURL}/v1/graphql` || defaultBaseURL);
  }

  const graphQLClient = useMemo(() => {
    if (!authResult?.accessToken) {
      return graphQLInstance;
    }
    graphQLInstance.setHeader(
      'Authorization',
      `Bearer ${authResult.accessToken}`,
    );
    return graphQLInstance;
  }, [authResult?.accessToken, graphQLInstance]);

  const context: GraphQLClient = { graphQLClient };

  return (
    <GraphQLClientContext.Provider value={context}>
      {children}
    </GraphQLClientContext.Provider>
  );
};

export const useGraphQLClient = () => useContext(GraphQLClientContext);
