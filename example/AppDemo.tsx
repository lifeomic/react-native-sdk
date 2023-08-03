import React from 'react';
import { authConfig, baseURL } from './storybook/helpers/oauthConfig';
import {
  DeveloperConfigProvider,
  RootProviders,
  RootStack,
  inviteNotifier,
} from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  React.useEffect(() => {
    inviteNotifier.emit('inviteDetected', { inviteId: 'TODO', evc: 'TODO' });
  }, []);

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
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
