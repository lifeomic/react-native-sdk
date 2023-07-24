import React from 'react';
import { Text, View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  AppTileScreen,
  CustomAppTileScreen,
  DeveloperConfigProvider,
  Tile,
} from '../../../src';
import { TilesList } from '../../../src/components/tiles/TilesList';
import {
  HomeStackParamList,
  HomeStackScreenProps,
} from '../../../src/navigators/types';
import { DataProviderDecorator } from '../helpers/DataProviderDecorator';
import { ScreenSurface } from '../../../src/components/ScreenSurface';

storiesOf('Custom App Tile Screen', module)
  .addDecorator(
    DataProviderDecorator((mock) => {
      mock.onGet().reply(() => [
        200,
        {
          homeTab: {
            appTiles: [
              {
                id: 'custom-app-tile-1',
                title: 'Working',
                source: {
                  url: 'https://lifeomic.com/custom-app-tile-1',
                },
              },
              {
                id: 'custom-app-tile-2',
                title: 'Error 1',
                source: {
                  url: 'https://lifeomic.com/custom-app-tile-2',
                },
              },
            ],
          },
        },
      ]);
    }),
  )
  .add('demo', () => (
    <DeveloperConfigProvider
      developerConfig={{
        appTileScreens: {
          'https://lifeomic.com/custom-app-tile-1': MyCustomAppTileScreen1,
        },
      }}
    >
      <HomeStack />
    </DeveloperConfigProvider>
  ));

function MyCustomAppTileScreen1() {
  return (
    <Text>
      This is a custom app tile. You can utilize SDK hooks, e.g.
      useHttpClient().
    </Text>
  );
}

function HomeScreen({ navigation, route }: HomeStackScreenProps<'Home'>) {
  return (
    <>
      <ScreenSurface testID="home-screen">
        <TilesList navigation={navigation} route={route} />
        <View
          style={{
            marginHorizontal: 24,
            marginBottom: 24,
          }}
        >
          <Tile
            id="app-tile-invalid"
            title="Error 2"
            onPress={() => {
              navigation.navigate('Home/CustomAppTile', {
                appTile: {
                  id: 'app-tile-invalid',
                  title: 'Title 3',
                  source: {
                    url: 'https://lifeomic.com/custom-app-tile-3',
                  },
                },
              });
            }}
          />
          <View>
            <Text>
              Error 1 is an issue where the app is configured with an app tile
              whose URL is meant to be overridden via DeveloperConfigProvider,
              but is not. In this case, the real URL is navigated to in a
              browser, so a friendly error message could be displayed there for
              this edge case.
            </Text>
            <Text>
              Error 2 is an edge case where Home/CustomAppTile is manually
              navigated to with a bogus appTile configuration
            </Text>
          </View>
        </View>
      </ScreenSurface>
    </>
  );
}

const Stack = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
        <Stack.Screen
          name="Home/CustomAppTile"
          component={CustomAppTileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
