import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import {
  AppConfigContext,
  DeveloperConfigProvider,
  SettingsScreen,
} from '../../../../src';
import { SafeView } from '../../helpers/SafeView';
import { openURL } from '../../../../src/common/urls';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';

const appConfig = {
  data: {
    support: {
      url: 'https://lifeomic.com',
    },
  },
  isLoading: false,
  isFetched: true,
  error: undefined,
};

storiesOf('SettingsScreen', module)
  .addDecorator(DataProviderDecorator())
  .add('default', () => (
    <AppConfigContext.Provider value={appConfig}>
      <SafeView>
        <SettingsScreen
          navigation={{ navigate: action('navigate') } as any}
          route={{} as any}
        />
      </SafeView>
    </AppConfigContext.Provider>
  ))
  .add('modify menu items', () => (
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
      <AppConfigContext.Provider value={appConfig}>
        <SafeView>
          <SettingsScreen
            navigation={{ navigate: action('navigate') } as any}
            route={{} as any}
          />
        </SafeView>
      </AppConfigContext.Provider>
    </DeveloperConfigProvider>
  ));
