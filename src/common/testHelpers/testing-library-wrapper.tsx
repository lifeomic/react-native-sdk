import React from 'react';
import { render } from '@testing-library/react-native';
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

const customRender = (ui: any, options?: any) =>
  render(ui, { wrapper: wrapper, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
