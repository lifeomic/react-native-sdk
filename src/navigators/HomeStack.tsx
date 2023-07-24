import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTileScreen } from '../screens/AppTileScreen';
import { CustomAppTileScreen } from '../screens/CustomAppTileScreen';
import { TrackTileTrackerScreen } from '../screens/TrackTileTrackerScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import { t } from '../../lib/i18n';
import { notifySaveEditTrackerValue } from '../components/TrackTile/main';
import TrackTileSettingsScreen from '../screens/TrackTileSettingsScreen';
import TrackTileAdvancedDetailsScreen from '../screens/TrackTileAdvancedDetailsScreen';
import TrackTileAdvancedEditorScreen from '../screens/TrackTileAdvancedEditorScreen';
import { useNavigation } from '@react-navigation/native';
import {
  HeaderButton,
  HeaderButtons,
  Item,
} from 'react-navigation-header-buttons';
import { AuthedAppTileScreen } from '../screens/AuthedAppTileScreen';
import { HomeStackParamList } from './types';
import { CircleDiscussionScreen } from '../screens/CircleDiscussionScreen';
import { useDeveloperConfig } from '../hooks';
import { MyDataScreen } from '../screens/MyDataScreen';
import { YoutubePlayerScreen } from '../screens/YoutubePlayerScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { getAdditionalHomeScreens } = useDeveloperConfig();

  return (
    <Stack.Navigator screenOptions={{ header: AppNavHeader }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
      <Stack.Screen name="Home/AuthedAppTile" component={AuthedAppTileScreen} />
      <Stack.Screen name="Home/CustomAppTile" component={CustomAppTileScreen} />
      <Stack.Screen name="Home/TrackTile" component={TrackTileTrackerScreen} />
      <Stack.Screen
        name="Home/Circle/Discussion"
        component={CircleDiscussionScreen}
      />
      <Stack.Screen
        name="Home/TrackTileSettings"
        component={TrackTileSettingsScreen}
        options={{ title: t('Track-It Items') }}
      />
      <Stack.Screen
        name="Home/AdvancedTrackerDetails"
        component={TrackTileAdvancedDetailsScreen}
      />
      <Stack.Screen
        name="Home/AdvancedTrackerEditor"
        component={TrackTileAdvancedEditorScreen}
        options={() => ({
          headerRight: SaveEditorButton,
        })}
      />
      <Stack.Screen
        name="Home/MyData"
        component={MyDataScreen}
        options={{ title: t('My Data') }}
      />
      <Stack.Screen
        name="Home/YoutubePlayer"
        component={YoutubePlayerScreen}
        options={({ route }) => ({ title: route.params.videoName || ' ' })}
      />
      {getAdditionalHomeScreens?.(Stack)}
    </Stack.Navigator>
  );
}

const HeaderButtonComponent = (props: any) => (
  <HeaderButton {...props} color={'#02BFF1'} />
);

const SaveEditorButton = () => {
  const navigation = useNavigation();

  return (
    <HeaderButtons HeaderButtonComponent={HeaderButtonComponent}>
      <Item
        title="Save"
        onPress={async () => {
          await new Promise(notifySaveEditTrackerValue);
          navigation.goBack();
        }}
      />
    </HeaderButtons>
  );
};
