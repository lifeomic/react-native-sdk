import { APIMocker, createAPIMocker } from '@lifeomic/one-query/test-utils';
import { RestAPIEndpoints } from '@lifeomic/react-client';
import { SetupServerApi, setupServer } from 'msw/node';
import { Overrides } from '../hooks/rest-api';

const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });

export const createRestAPIMock: () => APIMocker<
  RestAPIEndpoints & Overrides
> = () =>
  createAPIMocker<RestAPIEndpoints & Overrides>(
    server as SetupServerApi,
    'https://api.us.lifeomic.com',
  );
