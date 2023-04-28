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
