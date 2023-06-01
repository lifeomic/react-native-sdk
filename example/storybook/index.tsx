import React from 'react';
import { AppRegistry } from 'react-native';
import { init } from '../../src/common/init';

import {
  getStorybookUI,
  configure,
  addDecorator,
} from '@storybook/react-native';
import { withKnobs } from '@storybook/addon-knobs';
import { BrandConfigProvider } from '../../src';

import './rn-addons';

// LifeOmic app initialization
init();

// enables knobs for all stories
addDecorator(withKnobs);

// enables default brand for all stories
addDecorator((storyFn: any, context) => (
  <BrandConfigProvider>{storyFn(context)}</BrandConfigProvider>
));

// import stories
configure(() => {
  require('./stories');
}, module);

// Refer to https://github.com/storybookjs/react-native/tree/master/app/react-native#getstorybookui-options
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({
  asyncStorage: null,
  onDeviceUI: false,
});

// If you are using React Native vanilla and after installation you don't see your app name here, write it manually.
// If you use Expo you should remove this line.
AppRegistry.registerComponent('%APP_NAME%', () => StorybookUIRoot);

export default StorybookUIRoot;
