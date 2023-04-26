import React, { useEffect, useState } from 'react';
import {
  authConfig,
  baseURL,
  secondaryBaseURL,
  secondaryConfig,
} from './storybook/stories/OAuth.stories';
import { DeveloperConfigProvider, RootProviders, RootStack } from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeEventEmitter } from 'react-native';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  const [usePrimaryEnv, setUsePrimaryEnv] = useState(true);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter({
      addListener: () => {},
      removeListeners: () => {},
    });

    const subscription = eventEmitter.addListener('environmentToggle', () => {
      setUsePrimaryEnv((val) => !val);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const storedEnv =
        (await AsyncStorage.getItem('environment-toggle')) ?? 'primary';
      setUsePrimaryEnv(storedEnv === 'primary');
    })();
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
        apiBaseURL: usePrimaryEnv ? baseURL : secondaryBaseURL,
      }}
    >
      <RootProviders authConfig={usePrimaryEnv ? authConfig : secondaryConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}

export default App;
