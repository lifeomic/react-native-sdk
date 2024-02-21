import React from 'react';
import { DecoratorFunction } from '@storybook/addons';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HttpClientContextProvider } from '../../../src/hooks/useHttpClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ActiveAccountProvider,
  ActiveProjectContext,
} from '../../../src/hooks';

export type DataOverrideProviderProps = {
  children: React.ReactNode;
  builder?: (adapter: MockAdapter) => void;
};

const mockQueryClient = new QueryClient();

export const DataOverrideProvider: React.FC<DataOverrideProviderProps> = ({
  builder,
  children,
}) => {
  const axiosInstance = axios.create() as any;
  const mock = new MockAdapter(axiosInstance);

  if (builder) {
    builder(mock);
  }

  return (
    <ActiveAccountProvider account="mockaccount">
      <ActiveProjectContext.Provider
        value={
          {
            activeProject: {
              id: 'mockProject',
              name: 'mockProject',
            },
            activeSubjectId: 'mockSubjectId',
          } as any
        }
      >
        <QueryClientProvider client={mockQueryClient}>
          <HttpClientContextProvider injectedAxiosInstance={axiosInstance}>
            {children}
          </HttpClientContextProvider>
        </QueryClientProvider>
      </ActiveProjectContext.Provider>
    </ActiveAccountProvider>
  );
};

export const DataProviderDecorator =
  (builder?: (adapter: MockAdapter) => void): DecoratorFunction<any> =>
  (StoryFn, storyCtx) => {
    return (
      <DataOverrideProvider builder={builder}>
        {StoryFn(storyCtx)}
      </DataOverrideProvider>
    );
  };
