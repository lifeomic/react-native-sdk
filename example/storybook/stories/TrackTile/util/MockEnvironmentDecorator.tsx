import React from 'react';
import { DecoratorFunction } from '@storybook/addons';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  MetricType,
  TrackTileServiceProvider,
  useAxiosTrackTileService,
} from 'src/components/TrackTile/main';
import {
  FetchTrackerResponse,
  QueryOntologyResponse,
} from 'src/components/TrackTile/hooks/useAxiosTrackTileService';
import { nutrition } from './ontologies';

const axiosInstance = axios.create();
const mock = new MockAdapter(axiosInstance);

export const MockEnvironmentDecorator = ({
  trackers = [] as Partial<MetricType>[],
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
  mock.onPost('/graphql').reply((req) => {
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
    return <Provider>{StoryFn(storyCtx)}</Provider>;
  };

  return EnvironmentDecorator;
};

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <TrackTileServiceProvider
      value={useAxiosTrackTileService({
        datastoreSettings: {
          account: 'stub',
          project: 'stub',
        },
        axiosInstance: axiosInstance as any,
      })}
    >
      {children}
    </TrackTileServiceProvider>
  );
}
