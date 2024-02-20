import React from 'react';
import { DecoratorFunction } from '@storybook/addons';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  Tracker,
  TrackTileServiceProvider,
  useAxiosTrackTileService,
} from '../../../../../src/components/TrackTile/main';
import {
  FetchTrackerResponse,
  QueryOntologyResponse,
} from '../../../../../src/components/TrackTile/hooks/useAxiosTrackTileService';
import { nutrition } from './ontologies';
import { HttpClientContextProvider } from '../../../../../src/hooks/useHttpClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeveloperConfigProvider } from '../../../../../src/components/DeveloperConfigProvider';

const axiosInstance = axios.create() as any;
const mock = new MockAdapter(axiosInstance);

export const MockEnvironmentDecorator = ({
  trackers = [] as Partial<Tracker>[],
  ontology = nutrition as any as QueryOntologyResponse,
  values = {
    data: {
      patient: {
        observationsConnection: {
          edges: [],
        },
        proceduresConnection: {
          edges: [],
        },
      },
    },
  } as FetchTrackerResponse,
} = {}) => {
  mock.onGet(/\/track-tiles\/trackers.*/).reply(200, trackers);
  mock.onPost('/v1/graphql').reply((req) => {
    const body = JSON.parse(req.data ?? '{}');

    if (body?.variables?.resource) {
      const id = Math.random().toString();
      const resource = body?.variables?.resource;
      return [200, { data: { resource: { id, ...resource } } }];
    } else if (body?.variables?.code) {
      return [200, ontology];
    }

    return [200, values];
  });
  mock.onPut().reply(200);
  mock.onDelete().reply(200);

  const EnvironmentDecorator: DecoratorFunction<any> = (StoryFn, storyCtx) => {
    return (
      <DeveloperConfigProvider
        developerConfig={{
          ontology: {
            educationContentOverrides: {
              'e1368d74-8236-40cf-b3e7-a28e3293ead2': {
                thumbnail:
                  'https://lifeapps.io/wp-content/uploads/2019/07/nuts-877188828-150x150.jpg?w=300',
              },
            },
          },
        }}
      >
        <QueryClientProvider client={new QueryClient()}>
          <HttpClientContextProvider injectedAxiosInstance={axiosInstance}>
            <Provider>{StoryFn(storyCtx)}</Provider>
          </HttpClientContextProvider>
        </QueryClientProvider>
      </DeveloperConfigProvider>
    );
  };

  return EnvironmentDecorator;
};

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <TrackTileServiceProvider value={useAxiosTrackTileService()}>
      {children}
    </TrackTileServiceProvider>
  );
}
