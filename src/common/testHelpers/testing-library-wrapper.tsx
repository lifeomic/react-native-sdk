import React from 'react';
import { render as realRender } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from '../../hooks/useGraphQLClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';

const wrapper = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GraphQLClientContextProvider baseURL={baseURL}>
        {children}
      </GraphQLClientContextProvider>
    </QueryClientProvider>
  );
};

const render: typeof realRender = (ui: any, options?: any) =>
  realRender(ui, { wrapper: wrapper, ...options });

export * from '@testing-library/react-native';
export { render };
