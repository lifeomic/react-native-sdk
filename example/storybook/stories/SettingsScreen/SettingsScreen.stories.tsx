import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import {
  AppConfigContextProvider,
  DeveloperConfigProvider,
  SettingsScreen,
} from '../../../../src';
import { SafeView } from '../../helpers/SafeView';
import { openURL } from '../../../../src/common/urls';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';

const appConfig = {
  support: {
    url: 'https://lifeomic.com',
  },
};

storiesOf('SettingsScreen', module)
  .addDecorator(DataProviderDecorator())
  .add(
    'default',
    () => (
      <AppConfigContextProvider>
        <SafeView>
          <SettingsScreen
            navigation={{ navigate: action('navigate') } as any}
            route={{} as any}
          />
        </SafeView>
      </AppConfigContextProvider>
    ),
    {
      mockAPICalls: (api) =>
        api.mock('GET /v1/life-research/projects/:projectId/app-config', {
          status: 200,
          data: appConfig,
        }),
    },
  )
  .add(
    'modify menu items',
    () => (
      <DeveloperConfigProvider
        developerConfig={{
          modifySettingScreenMenuItems(items) {
            return items
              .map((item) => ({
                ...item,
                title: `${item.title} - Modified`,
              }))
              .concat({
                id: 'custom-menu-item',
                title: 'Injected Menu Item',
                action: () =>
                  openURL('https://github.com/lifeomic/react-native-sdk'),
              });
          },
        }}
      >
        <AppConfigContextProvider>
          <SafeView>
            <SettingsScreen
              navigation={{ navigate: action('navigate') } as any}
              route={{} as any}
            />
          </SafeView>
        </AppConfigContextProvider>
      </DeveloperConfigProvider>
    ),
    {
      mockAPICalls: (api) =>
        api.mock('GET /v1/life-research/projects/:projectId/app-config', {
          status: 200,
          data: appConfig,
        }),
    },
  );
