import React, { useCallback } from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useIcons } from '../components/BrandConfigProvider';
import { TabParamList } from './types';
import { useTabsConfig } from '../hooks/useTabsConfig';
import { TabBar } from './TabBar';
import { getDefaultTabs } from './getDefaultTabs';
import { BottomNavigationBar } from './BottomNavigationBar';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const icons = useIcons();
  const { tabs, useTabBar } = useTabsConfig(getDefaultTabs(icons));

  const tabBar = useCallback(
    (props: BottomTabBarProps) =>
      useTabBar ? <TabBar {...props} /> : <BottomNavigationBar {...props} />,
    [useTabBar],
  );

  return (
    <Tab.Navigator tabBar={tabBar}>
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
