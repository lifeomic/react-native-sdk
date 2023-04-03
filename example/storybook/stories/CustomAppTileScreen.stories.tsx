import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  AppTileScreen,
  CustomAppTileScreen,
  DeveloperConfigProvider,
  HomeStackParamList,
  Tile,
} from 'src';
import { TilesList } from 'src/components/tiles/TilesList';

storiesOf('Custom App Tile Screen', module).add('demo', () => (
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

const appTiles = [
  {
    id: 'app-tile-1',
    title: 'URL overridden',
    source: {
      url: 'https://lifeomic.com/custom-app-tile-1',
    },
  },
  {
    id: 'app-tile-unknown',
    title: 'Error 1',
    source: {
      url: 'https://lifeomic.com/custom-app-tile-2',
    },
  },
];

function HomeScreen() {
  type NavigationParams = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
  const { navigate } = useNavigation<NavigationParams>();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        <ScrollView
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
        >
          <TilesList tiles={appTiles} />
          <View style={{ padding: 8 }}>
            <Tile
              id="app-tile-invalid"
              title="Error 2"
              onPress={() => {
                navigate('tiles/CustomAppTile', {
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
          </View>
        </ScrollView>
        <View>
          <Text>
            Error 1 is an issue where the app is configured with an app tile
            whose URL is meant to be overridden via DeveloperConfigProvider, but
            is not. In this case, the real URL is navigated to in a browser, so
            a friendly error message could be displayed there for this edge
            case.
          </Text>
          <Text>
            Error 2 is an edge case where tiles/CustomAppTile is manually
            navigated to with a bogus appTile configuration
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const Stack = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="tiles/AppTile" component={AppTileScreen} />
        <Stack.Screen
          name="tiles/CustomAppTile"
          component={CustomAppTileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
