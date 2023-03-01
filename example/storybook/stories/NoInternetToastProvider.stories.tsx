import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { NoInternetToastProvider } from '../../../src';
import Toast from 'react-native-toast-message';
import { boolean } from '@storybook/addon-knobs';

storiesOf('NoInternetToast', module).add('demo', () => {
  const isConnected = boolean('Internet Connection', false);
  return (
    <NoInternetToastProvider _isConnected={isConnected}>
      <Toast />
    </NoInternetToastProvider>
  );
});
