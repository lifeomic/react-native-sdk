import React, { useCallback } from 'react';
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
  const { additionalNavigationTabs, componentProps, navigationTabs } =
    useDeveloperConfig();
  const { useTabBar } = componentProps?.TabNavigator || {};

  const Tab = useTabBar
    ? createBottomTabNavigator<TabParamList>()
    : createMaterialBottomTabNavigator<TabParamList>();

  const tabBar = (props: any) => {
    return useTabBar ? <TabBar {...props} /> : null;
  };

  const defaultTabs = useCallback(
    () => (
      <>
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          key="HomeTab"
          options={{
            tabBarLabel: t('tabs-home', 'Home'),
            tabBarIcon: Home,
            tabBarColor: 'red',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="NotificationsTab"
          component={NotificationsStack}
          key="NotificationsTab"
          options={{
            tabBarLabel: t('tabs-notifications', 'Notifications'),
            tabBarIcon: Bell,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          key="SettingsTab"
          component={SettingsStack}
          options={{
            tabBarLabel: t('tabs-settings', 'Settings'),
            tabBarIcon: Settings,
            headerShown: false,
          }}
        />
      </>
    ),
    [Bell, Home, Settings, Tab],
  );

  return (
    <Tab.Navigator
      tabBar={tabBar}
      shifting={true}
      barStyle={styles.barStyle}
      activeColor={theme.colors.onSurface}
      inactiveColor={theme.colors.onSurfaceDisabled}
      labeled
    >
      {navigationTabs
        ? navigationTabs?.map((tab) => (
            <Tab.Screen
              name={tab.name}
              component={tab.component}
              key={tab.name}
              options={{
                tabBarLabel: tab.options.tabBarLabel,
                tabBarIcon: tab.options.tabBarIcon,
                headerShown: false,
              }}
            />
          ))
        : defaultTabs()}
      {!useTabBar &&
        additionalNavigationTabs?.map((tab) => (
          <Tab.Screen
            name={tab.name}
            component={tab.component}
            key={tab.name}
            options={{
              tabBarLabel: tab.options.tabBarLabel,
              tabBarIcon: tab.options.tabBarIcon,
              headerShown: false,
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
