import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { t } from 'i18next';
import { SettingsStack, SettingsStackParamList } from './SettingsStack';
import { HomeStack } from './HomeStack';

export type TabParamList = {
  HomeTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

const Tab = createMaterialBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator shifting={true}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs-home', 'Home'),
          tabBarIcon: 'home',
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
