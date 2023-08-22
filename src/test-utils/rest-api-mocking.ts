import { createAPIMockingUtility } from '@lifeomic/one-query/test-utils';
import { RestAPIEndpoints } from '../types/rest-types';

export const createRestAPIMock = createAPIMockingUtility<RestAPIEndpoints>({
  baseUrl: 'https://api.us.lifeomic.com',
});
