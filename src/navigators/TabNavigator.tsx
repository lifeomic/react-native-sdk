import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { t } from 'i18next';
import { useStyles } from '../hooks/useStyles';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { useTheme } from '../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import {
  HomeTabScreenParamList,
  NotificationsTabScreenParamList,
  SettingsTabScreenParamList,
  LandingTabsParamList,
} from './types';
import { useDeveloperConfig } from '../hooks';
import { TabBar } from './TabBar';
import { HomeTabScreen, SettingsTabScreen } from '../screens';
import { NotificationsTabScreen } from '../screens/NotificationsTabScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components';

const HomeTabScreenStackNavigator =
  createNativeStackNavigator<HomeTabScreenParamList>();
function HomeTabScreenStack() {
  return (
    <HomeTabScreenStackNavigator.Navigator
      screenOptions={{ header: AppNavHeader }}
    >
      <HomeTabScreenStackNavigator.Screen
        name="HomeTabScreen"
        component={HomeTabScreen}
        options={{ title: t('tabs-home', 'Home') }}
      />
    </HomeTabScreenStackNavigator.Navigator>
  );
}

const NotificationsTabScreenStackNavigator =
  createNativeStackNavigator<NotificationsTabScreenParamList>();
function NotificationsTabScreenStack() {
  return (
    <NotificationsTabScreenStackNavigator.Navigator
      screenOptions={{ header: AppNavHeader }}
    >
      <NotificationsTabScreenStackNavigator.Screen
        name="NotificationsTabScreen"
        component={NotificationsTabScreen}
        options={{ title: t('tabs-notifications', 'Notifications') }}
      />
    </NotificationsTabScreenStackNavigator.Navigator>
  );
}

const SettingsTabScreenStackNavigator =
  createNativeStackNavigator<SettingsTabScreenParamList>();
function SettingsScreenTabStack() {
  return (
    <SettingsTabScreenStackNavigator.Navigator
      screenOptions={{ header: AppNavHeader }}
    >
      <SettingsTabScreenStackNavigator.Screen
        name="SettingsTabScreen"
        component={SettingsTabScreen}
        options={{ title: t('tabs-settings', 'Settings') }}
      />
    </SettingsTabScreenStackNavigator.Navigator>
  );
}

export function TabNavigator() {
  const { Home, Bell, Settings } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const { additionalNavigationTabs, componentProps } = useDeveloperConfig();
  const { useTabBar } = componentProps?.TabNavigator || {};

  const Tab = useTabBar
    ? createBottomTabNavigator<LandingTabsParamList>()
    : createMaterialBottomTabNavigator<LandingTabsParamList>();

  const tabBar = (props: any) => {
    return useTabBar ? <TabBar {...props} /> : null;
  };

  return (
    <Tab.Navigator
      tabBar={tabBar}
      shifting={true}
      barStyle={styles.barStyle}
      activeColor={theme.colors.onSurface}
      inactiveColor={theme.colors.onSurfaceDisabled}
      labeled
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabScreenStack}
        key="HomeTab"
        options={{
          tabBarLabel: t('tabs-home', 'Home'),
          tabBarIcon: Home,
          tabBarColor: 'red',
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsTabScreenStack}
        key="NotificationsTab"
        options={{
          tabBarLabel: t('tabs-notifications', 'Notifications'),
          tabBarIcon: Bell,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreenTabStack}
        key="SettingsTab"
        options={{
          tabBarLabel: t('tabs-settings', 'Settings'),
          tabBarIcon: Settings,
        }}
      />
      {!useTabBar &&
        additionalNavigationTabs?.map((tab) => (
          <Tab.Screen
            name={tab.name}
            component={tab.component}
            key={tab.name}
            options={{
              tabBarLabel: tab.options.tabBarLabel,
              tabBarIcon: tab.options.tabBarIcon,
            }}
          />
        ))}
    </Tab.Navigator>
  );
}

const defaultStyles = createStyles('TabNavigator', (theme) => ({
  barStyle: {
    backgroundColor: theme.colors.background,
    zIndex: 1,
    ...shadow(4),
  } as ViewStyle,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabNavigatorStyles = NamedStylesProp<typeof defaultStyles>;
