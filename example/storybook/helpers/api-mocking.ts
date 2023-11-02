import { setupServer } from 'msw/native';
import { createAPIMocker } from '@lifeomic/one-query/test-utils';
import { RestAPIEndpoints } from '../../../src/types/rest-types';
import { addDecorator } from '@storybook/react-native';

const server = setupServer();

const mocker = createAPIMocker<RestAPIEndpoints>(
  server,
  'https://api.us.lifeomic.com',
);

declare module '@storybook/addons' {
  interface Parameters {
    mockAPICalls?: (mock: typeof mocker) => void;
  }
}

export const initializeApiMocking = () => {
  // Do not warn or error out if a non-mocked request happens.
  // If we don't use this, Storybook will be spammy about requests made to
  // fetch the JS bundle etc.
  server.listen({ onUnhandledRequest: 'bypass' });

  addDecorator((storyFn, { parameters }) => {
    mocker.reset();
    if (parameters.mockAPICalls) {
      parameters.mockAPICalls(mocker);
    }
    return storyFn();
  });
};
