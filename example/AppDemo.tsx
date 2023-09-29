import React, { useEffect } from 'react';
import { authConfig, baseURL } from './storybook/helpers/oauthConfig';
import {
  DeveloperConfigProvider,
  HomeStackParamList,
  RootProviders,
  RootStack,
} from '../src';
import { FhirExampleScreen } from './src/screens/FhirExampleScreen';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

type CustomHomeStackParamsList = HomeStackParamList & {
  CustomHomeScreen: undefined;
};
type UserDetailsScreenRouteProp = RouteProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen'
>;

type CustomHomeScreenNavigationProp = NativeStackNavigationProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen'
>;

const CustomHomeScreen = () => {
  const navigation = useNavigation<CustomHomeScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();

  return (
    <View>
      <Text>Custom Home Screen</Text>
    </View>
  );
};

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
        getAdditionalHomeScreens: (HomeStack) => [
          <HomeStack.Screen
            name="Home"
            component={CustomHomeScreen}
            key={'CustomHomeScreen'}
          />,
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
