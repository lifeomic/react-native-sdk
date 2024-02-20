import { createAPIHooks } from '@lifeomic/one-query';
import axios from 'axios';

import { AuthAPIEndpoints } from '@lifeomic/react-client';
import { useDeveloperConfig } from './useDeveloperConfig';

export const defaultBaseURL = 'https://apps.us.lifeomic.com';

const hooks = createAPIHooks<AuthAPIEndpoints>({
  name: 'lifeomic-apps-react-native-sdk',
  client: () => {
    // hook will be used according to rules of hooks
    // https://github.com/lifeomic/one-query?tab=readme-ov-file#createapihooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { appsAPIBaseURL = defaultBaseURL } = useDeveloperConfig();
    return axios.create({ baseURL: appsAPIBaseURL });
  },
});

export const useAppsAPIMutation = hooks.useAPIMutation;
