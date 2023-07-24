import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { NotificationsScreen } from '.';
import { PushNotificationsProvider } from '../../../../src/hooks/usePushNotifications';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';

storiesOf('NotificationsScreen', module)
  .addDecorator(DataProviderDecorator())
  .add('demo', () => (
    <PushNotificationsProvider>
      <NotificationsScreen />
    </PushNotificationsProvider>
  ));
