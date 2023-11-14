import { createAPIMocker } from '@lifeomic/one-query/test-utils';
import { RestAPIEndpoints } from '../types/rest-types';
import { SetupServerApi, setupServer } from 'msw/node';

const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });

export const createRestAPIMock = () =>
  createAPIMocker<RestAPIEndpoints>(
    server as SetupServerApi,
    'https://api.us.lifeomic.com',
  );
