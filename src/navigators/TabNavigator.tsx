import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { t } from 'i18next';
import { SettingsStack } from './SettingsStack';
import { HomeStack } from './HomeStack';
import { NotificationsStack } from './NotificationsStack';
import { useStyles } from '../hooks/useStyles';
import { createStyles } from '../components/BrandConfigProvider';
import { useTheme } from '../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import { TabParamList } from './types';
import { useDeveloperConfig } from '../hooks';
import { TabBar } from './TabBar';
import { NavigationTab } from '../common/DeveloperConfig';
import { Bell, Home, Settings } from '@lifeomic/chromicons-native';

export function TabNavigator() {
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const { componentProps } = useDeveloperConfig();
  const { useTabBar } = componentProps?.TabNavigator || {};
  const tabs = componentProps?.TabBar?.tabs ?? getDefaultTabs();

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
      {tabs?.map((tab) => (
        <Tab.Screen
          name={tab.name}
          component={tab.component}
          key={tab.name}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: tab.icon,
            headerShown: tab?.headerShown,
            tabBarColor: tab?.color,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export function getDefaultTabs() {
  const defaults: NavigationTab[] = [
    {
      name: 'HomeTab',
      component: HomeStack,
      label: t('tabs-home', 'Home'),
      icon: Home,
      color: 'red',
      headerShown: false,
    },
    {
      name: 'NotificationsTab',
      component: NotificationsStack,
      label: t('tabs-notifications', 'Notifications'),
      icon: Bell,
      headerShown: false,
    },
    {
      name: 'SettingsTab',
      component: SettingsStack,
      label: t('tabs-settings', 'Settings'),
      icon: Settings,
      headerShown: false,
    },
  ];
  return defaults;
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
