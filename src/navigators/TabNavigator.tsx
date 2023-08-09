import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { t } from 'i18next';
import { SettingsStack } from './SettingsStack';
import { HomeStack } from './HomeStack';
import { NotificationsStack } from './NotificationsStack';
import { useStyles } from '../hooks/useStyles';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { useTheme } from '../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import { TabParamList } from './types';
import { useDeveloperConfig } from '../hooks';
import { TabBar } from './TabBar';

export function TabNavigator() {
  const { Home, Bell, Settings } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const { additionalNavigationTabs, componentProps } = useDeveloperConfig();
  const { useTabBar } = componentProps?.TabNavigator || {};
  const tabs = componentProps?.TabBar?.tabs;

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
        name={tabs?.[0].name ?? 'HomeTab'}
        component={tabs?.[0].component ?? HomeStack}
        key={tabs?.[0].name ?? 'HomeTab'}
        options={{
          tabBarLabel: tabs?.[0].label ?? t('tabs-home', 'Home'),
          tabBarIcon: tabs?.[0].icon ?? Home,
          tabBarColor: tabs?.[0].color ?? 'red',
          headerShown: tabs?.[0].headerShown ?? false,
        }}
      />
      <Tab.Screen
        name={tabs?.[1].name ?? 'NotificationsTab'}
        component={tabs?.[1].component ?? NotificationsStack}
        key={tabs?.[1].name ?? 'NotificationsTab'}
        options={{
          tabBarLabel:
            tabs?.[1].label ?? t('tabs-notifications', 'Notifications'),
          tabBarIcon: tabs?.[1].icon ?? Bell,
          tabBarColor: tabs?.[1].color,
          headerShown: tabs?.[1].headerShown ?? false,
        }}
      />
      <Tab.Screen
        name={tabs?.[2].name ?? 'SettingsTab'}
        component={tabs?.[2].component ?? SettingsStack}
        key={tabs?.[2].name ?? 'SettingsTab'}
        options={{
          tabBarLabel: tabs?.[2].label ?? t('tabs-settings', 'Settings'),
          tabBarIcon: tabs?.[2].icon ?? Settings,
          tabBarColor: tabs?.[2].color,
          headerShown: tabs?.[2].headerShown ?? false,
        }}
      />
      {!useTabBar &&
        additionalNavigationTabs?.map((tab) => (
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
