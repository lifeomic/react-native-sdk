import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { DeveloperConfigProvider, SettingsScreen } from '../../../../src';
import { SafeView } from '../../helpers/SafeView';
import { openURL } from '../../../../src/common/urls';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';

const appConfig = {
  support: {
    url: 'https://lifeomic.com',
  },
};

storiesOf('SettingsScreen', module)
  .addDecorator(
    DataProviderDecorator((mock) => mock.onGet().reply(200, appConfig)),
  )
  .add('default', () => (
    <SafeView>
      <SettingsScreen
        navigation={{ navigate: action('navigate') } as any}
        route={{} as any}
      />
    </SafeView>
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
      <SafeView>
        <SettingsScreen
          navigation={{ navigate: action('navigate') } as any}
          route={{} as any}
        />
      </SafeView>
    </DeveloperConfigProvider>
  ));
