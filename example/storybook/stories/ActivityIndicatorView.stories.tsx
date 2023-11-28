import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { authConfig } from '../helpers/oauthConfig';
import {
  ActivityIndicatorView,
  DeveloperConfigProvider,
  RootProviders,
} from '../../../src';
import { withKnobs, color } from '@storybook/addon-knobs';

storiesOf('ActivityIndicatorView', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <DeveloperConfigProvider
      developerConfig={{
        simpleTheme: {
          primaryColor: color('primaryColor', '#0477BF'),
        },
      }}
    >
      <RootProviders account="mockaccount" authConfig={authConfig}>
        <ActivityIndicatorView message="Timed out, is something wrong?" />
      </RootProviders>
    </DeveloperConfigProvider>
  ));
