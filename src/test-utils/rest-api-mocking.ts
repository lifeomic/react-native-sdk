import { setupServer } from 'msw/node';
import { createAPIMockingUtility } from '@lifeomic/one-query/test-utils';
import { RestAPIEndpoints } from '../types/rest-types';

const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });
export const createRestAPIMock = createAPIMockingUtility<RestAPIEndpoints>({
  server,
  baseUrl: 'https://api.us.lifeomic.com',
});
