import React from 'react';
import {
  authConfig,
  baseURL,
  secondaryBaseURL,
  secondaryConfig,
} from './storybook/stories/OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import { useEnvironmentSelection } from '../src/hooks';
import MyComponent from './src/screens/MyComponent';

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
        navigationTab: [
          {
            name: 'OptionalTab',
            component: MyComponent,
            options: {
              tabBarLabel: { key: ['tabs-optional', 'Optional'] },
              tabBarIcon: 'menu',
            },
          },
          {
            name: 'AnotherOne',
            component: MyComponent,
            options: {
              tabBarLabel: { key: ['tabs-another-one', 'AnotherOne'] },
              tabBarIcon: 'menu',
            },
          },
          {
            name: 'AndAnotherOne',
            component: MyComponent,
            options: {
              tabBarLabel: { key: ['tabs-and-another-one', 'AndAnotherOne'] },
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
