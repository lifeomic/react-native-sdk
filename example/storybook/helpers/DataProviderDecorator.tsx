import React from 'react';
import { DecoratorFunction } from '@storybook/addons';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HttpClientContextProvider } from '../../../src/hooks/useHttpClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveAccountContext, ActiveConfigContext } from '../../../src/hooks';

export const DataProviderDecorator = (
  builder?: (adapter: MockAdapter) => void,
) => {
  const axiosInstance = axios.create();
  const mock = new MockAdapter(axiosInstance);

  if (builder) {
    builder(mock);
  }

  const EnvironmentDecorator: DecoratorFunction<any> = (StoryFn, storyCtx) => {
    return (
      <ActiveAccountContext.Provider
        value={
          {
            accountHeaders: {},
          } as any
        }
      >
        <ActiveConfigContext.Provider
          value={
            {
              project: {
                id: 'mockProject',
                name: 'mockProject',
              },
              subject: { subjectId: 'mockSubjectId' },
            } as any
          }
        >
          <QueryClientProvider client={new QueryClient()}>
            <HttpClientContextProvider injectedAxiosInstance={axiosInstance}>
              {StoryFn(storyCtx)}
            </HttpClientContextProvider>
          </QueryClientProvider>
        </ActiveConfigContext.Provider>
      </ActiveAccountContext.Provider>
    );
  };

  return EnvironmentDecorator;
};
