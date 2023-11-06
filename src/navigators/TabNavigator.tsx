import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useStyles } from '../hooks/useStyles';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { useTheme } from '../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { ViewStyle } from 'react-native';
import { TabParamList } from './types';
import { useDeveloperConfig } from '../hooks';
import { useTabsConfig } from '../hooks/useTabsConfig';
import { TabBar } from './TabBar';
import { getDefaultTabs } from './getDefaultTabs';

export function TabNavigator() {
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const icons = useIcons();
  const { componentProps } = useDeveloperConfig();
  const { useTabBar = true } = componentProps?.TabNavigator || {};
  const { tabs } = useTabsConfig(getDefaultTabs(icons));

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
            headerShown: !!tab?.headerShown,
            title: tab.label,
          }}
          initialParams={tab.initialParams}
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
