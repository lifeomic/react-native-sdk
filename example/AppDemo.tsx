import React from 'react';
import { authConfig, baseURL } from './storybook/stories/OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import { HelloWorldScreen } from './src/screens/HelloWorldScreen';
import { t } from 'i18next';
import { Menu } from '@lifeomic/chromicons-native';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        appTileScreens: {
          'https://lifeomic.com/mobile-app-tiles/fhir-example':
            FhirExampleScreen,
        },
        simpleTheme: {
          primaryColor: '#fb5607',
        },
        apiBaseURL: baseURL,
        additionalNavigationTabs: [
          {
            name: 'AdditionalTab',
            component: HelloWorldScreen,
            options: {
              tabBarLabel: t('tabs-settings', 'Settings'),
              tabBarIcon: Menu,
            },
          },
        ],
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
