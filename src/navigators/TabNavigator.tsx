import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { t } from 'i18next';
import { SettingsStack, SettingsStackParamList } from './SettingsStack';
import { HomeStack } from './HomeStack';
import { NotificationsStack } from './NotificationsStack';
import { useStyles } from '../hooks/useStyles';
import { createStyles } from '../components/BrandConfigProvider';
import { useTheme } from '../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export type TabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

const Tab = createMaterialBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();

  return (
    <Tab.Navigator
      shifting={true}
      barStyle={styles.barStyle}
      activeColor={theme.colors.onSurface}
      inactiveColor={theme.colors.onSurfaceDisabled}
      labeled
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs-home', 'Home'),
          tabBarIcon: 'home',
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStack}
        options={{
          tabBarLabel: t('tabs-notifications', 'Notifications'),
          tabBarIcon: 'bell',
          tabBarBadge: false, //TODO: set dynamically for new notifications
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: t('tabs-settings', 'Settings'),
          tabBarIcon: 'cog',
        }}
      />
    </Tab.Navigator>
  );
}

const defaultStyles = createStyles('TabNavigator', () => ({
  barStyle: {
    backgroundColor: '#fff',
    zIndex: 1,
    ...shadow(4),
  } as ViewStyle,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabNavigatorStyles = NamedStylesProp<typeof defaultStyles>;
