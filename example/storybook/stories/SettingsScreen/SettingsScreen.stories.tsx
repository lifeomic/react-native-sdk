import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import {
  AppConfig,
  AppConfigContextProvider,
  DeveloperConfigProvider,
  SettingsScreen,
} from '../../../../src';
import { SafeView } from '../../helpers/SafeView';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';
import { openURL } from '../../../../src/common/urls';

storiesOf('SettingsScreen', module)
  .addDecorator(
    DataProviderDecorator((mock) => {
      mock.onGet().reply(() => [
        200,
        {
          support: {
            url: 'https://lifeomic.com',
          },
        } as AppConfig,
      ]);
    }),
  )
  .add('default', () => (
    <AppConfigContextProvider>
      <SafeView>
        <SettingsScreen
          navigation={{ navigate: action('navigate') } as any}
          route={{} as any}
        />
      </SafeView>
    </AppConfigContextProvider>
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
      <AppConfigContextProvider>
        <SafeView>
          <SettingsScreen
            navigation={{ navigate: action('navigate') } as any}
            route={{} as any}
          />
        </SafeView>
      </AppConfigContextProvider>
    </DeveloperConfigProvider>
  ));
