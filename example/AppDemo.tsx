import React from 'react';
import { authConfig } from './storybook/stories/OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';

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
          accentColor: '#ffbe0b',
        },
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
