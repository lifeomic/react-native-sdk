import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { boolean } from '@storybook/addon-knobs';
import { NoInternetToastProvider } from '../../../src';
import Toast from 'react-native-toast-message';

storiesOf('NoInternetToast', module).add('demo', () => {
  const internetConnection = boolean('Internet connection', false);
  return (
    <NoInternetToastProvider forceShowToast={internetConnection}>
      <Toast />
    </NoInternetToastProvider>
  );
});
