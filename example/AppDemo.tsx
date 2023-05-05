import React from 'react';
import {
  authConfig,
  baseURL,
  secondaryBaseURL,
  secondaryConfig,
} from './storybook/stories/OAuth.stories';
import {
  DeveloperConfigProvider,
  RootProviders,
  RootStack,
  TabScreen,
} from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import { useEnvironmentSelection } from '../src/hooks';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  const usePrimaryEnvironment = useEnvironmentSelection();

  // structure of single element of array
  // <Tab.Screen
  //     name="OptionalTab"
  //     component={OptionalScreen}
  //     options={{
  //       tabBarLabel: t('tabs-menu', 'Menu'),
  //       tabBarIcon: 'menu',
  //     }}
  // />

  const tabScreens: TabScreen[] = [
    {
      name: 'test',
      component: <div>hello world</div>,
      options: {
        tabBarLabel: 'test',
        tabBarIcon: 'test',
      },
    },
  ];

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
        tabScreen: tabScreens,
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
