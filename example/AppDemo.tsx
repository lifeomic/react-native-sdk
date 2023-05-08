import React from 'react';
import {
  authConfig,
  baseURL,
  secondaryBaseURL,
  secondaryConfig,
} from './storybook/stories/OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import { HelloWorldScreen } from './src/screens/HelloWorldScreen';
import { useEnvironmentSelection } from '../src/hooks';
import { t } from 'i18next';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  const usePrimaryEnvironment = useEnvironmentSelection();

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
        apiBaseURL: usePrimaryEnvironment ? baseURL : secondaryBaseURL,
        additionalNavigationTabs: [
          {
            name: 'AdditionalTab',
            component: HelloWorldScreen,
            options: {
              tabBarLabel: t('tabs-settings', 'Settings'),
              tabBarIcon: 'menu',
            },
          },
        ],
      }}
    >
      <RootProviders
        authConfig={usePrimaryEnvironment ? authConfig : secondaryConfig}
      >
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
