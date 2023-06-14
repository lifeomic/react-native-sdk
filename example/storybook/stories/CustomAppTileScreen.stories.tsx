import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  HomeTabScreenParamList,
  HomeTabScreenProps,
  LoggedInRootParamList,
  LandingTabsParamList,
} from '../../../src/navigators/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

storiesOf('Custom App Tile Screen', module).add('demo', () => (
  <DeveloperConfigProvider
    developerConfig={{
      appTileScreens: {
        'https://lifeomic.com/custom-app-tile-1': MyCustomAppTileScreen1,
      },
    }}
  >
    <LoggedInStack />
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

function HomeScreen({
  navigation,
  route,
}: HomeTabScreenProps<'HomeTabScreen'>) {
  const parentNavigation =
    navigation.getParent<StackNavigationProp<LoggedInRootParamList>>();
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        <ScrollView
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
        >
          <TilesList navigation={navigation} route={route} />
          <View style={{ padding: 8 }}>
            <Tile
              id="app-tile-invalid"
              title="Error 2"
              onPress={() => {
                parentNavigation.navigate('HomeScreens', {
                  screen: 'Home/CustomAppTile',
                  params: {
                    appTile: {
                      id: 'app-tile-invalid',
                      title: 'Title 3',
                      source: {
                        url: 'https://lifeomic.com/custom-app-tile-3',
                      },
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
            Error 2 is an edge case where Home/CustomAppTile is manually
            navigated to with a bogus appTile configuration
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const HomeTabStackNavigator =
  createNativeStackNavigator<HomeTabScreenParamList>();
function HomeTabStack() {
  return (
    <HomeTabStackNavigator.Navigator>
      <HomeTabStackNavigator.Screen
        name="HomeTabScreen"
        component={HomeScreen}
      />
    </HomeTabStackNavigator.Navigator>
  );
}

const BottomTabNavigator = createBottomTabNavigator<LandingTabsParamList>();
function TabNavigator() {
  return (
    <BottomTabNavigator.Navigator>
      <BottomTabNavigator.Screen name="HomeTab" component={HomeTabStack} />
    </BottomTabNavigator.Navigator>
  );
}

const Stack = createNativeStackNavigator<HomeStackParamList>();
function HomeStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
        <Stack.Screen
          name="Home/CustomAppTile"
          component={CustomAppTileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const LoggedInStackNavigator =
  createNativeStackNavigator<LoggedInRootParamList>();
function LoggedInStack() {
  return (
    <NavigationContainer>
      <LoggedInStackNavigator.Navigator>
        <LoggedInStackNavigator.Screen
          name="LandingTabs"
          component={TabNavigator}
        />
        <LoggedInStackNavigator.Screen
          name="HomeScreens"
          component={HomeStack}
        />
      </LoggedInStackNavigator.Navigator>
    </NavigationContainer>
  );
}
