import React from 'react';
import { authConfig, baseURL, account } from './storybook/helpers/oauthConfig';
import { DeveloperConfigProvider, RootProviders, LoggedInStack } from '../src';
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
        },
        apiBaseURL: baseURL,
        showPreLoginWarning: false,
      }}
    >
      <RootProviders account={account ?? 'mockaccount'} authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
