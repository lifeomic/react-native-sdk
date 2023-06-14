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
  TabParamList,
} from './types';
import { useDeveloperConfig } from '../hooks';
import { TabBar } from './TabBar';
import { HomeScreen, SettingsScreen } from '../screens';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components';

const HomeScreenStack = createNativeStackNavigator<HomeTabScreenParamList>();
function HomeTabStack() {
  return (
    <HomeScreenStack.Navigator screenOptions={{ header: AppNavHeader }}>
      <HomeScreenStack.Screen
        name="HomeTabScreen"
        component={HomeScreen}
        options={{ title: t('tabs-home', 'Home') }}
      />
    </HomeScreenStack.Navigator>
  );
}

const NotificationsScreenStack =
  createNativeStackNavigator<NotificationsTabScreenParamList>();
function NotificationsTabStack() {
  return (
    <NotificationsScreenStack.Navigator
      screenOptions={{ header: AppNavHeader }}
    >
      <NotificationsScreenStack.Screen
        name="NotificationsTabScreen"
        component={NotificationsScreen}
        options={{ title: t('tabs-notifications', 'Notifications') }}
      />
    </NotificationsScreenStack.Navigator>
  );
}

const SettingsScreenStack =
  createNativeStackNavigator<SettingsTabScreenParamList>();
function SettingsTabStack() {
  return (
    <SettingsScreenStack.Navigator screenOptions={{ header: AppNavHeader }}>
      <SettingsScreenStack.Screen
        name="SettingsTabScreen"
        component={SettingsScreen}
        options={{ title: t('tabs-settings', 'Settings') }}
      />
    </SettingsScreenStack.Navigator>
  );
}

export function TabNavigator() {
  const { Home, Bell, Settings } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const { additionalNavigationTabs, componentProps } = useDeveloperConfig();
  const { useTabBar } = componentProps?.TabNavigator || {};

  const Tab = useTabBar
    ? createBottomTabNavigator<TabParamList>()
    : createMaterialBottomTabNavigator<TabParamList>();

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
        component={HomeTabStack}
        key="HomeTab"
        options={{
          tabBarLabel: t('tabs-home', 'Home'),
          tabBarIcon: Home,
          tabBarColor: 'red',
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsTabStack}
        key="NotificationsTab"
        options={{
          tabBarLabel: t('tabs-notifications', 'Notifications'),
          tabBarIcon: Bell,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsTabStack}
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
