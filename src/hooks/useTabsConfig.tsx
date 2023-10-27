import React from 'react';
import { camelCase, upperFirst } from 'lodash';
import { SvgProps } from 'react-native-svg/lib/typescript/ReactNativeSVG';
import {
  AppTileStack,
  HomeStack,
  NotificationsStack,
  SettingsStack,
} from '../navigators';
import { AppConfig, useAppConfig } from './useAppConfig';
import { useDeveloperConfig } from './useDeveloperConfig';
import { useIcons } from '../components/BrandConfigProvider';
import { DeveloperConfig, NavigationTab } from '../common/DeveloperConfig';

type TabConfig = Exclude<AppConfig['tabsConfig'], undefined>['tabs'][number];

export const useTabsConfig = (defaultTabs: NavigationTab[] = []) => {
  const { data: appConfig } = useAppConfig();
  const { componentProps, CustomStacks } = useDeveloperConfig();

  return (
    fromAppConfigTabs(appConfig?.tabsConfig?.tabs, CustomStacks) ??
    componentProps?.TabBar?.tabs ??
    defaultTabs
  );
};

const stackFromTab = (
  tab: TabConfig,
  stacks: DeveloperConfig['CustomStacks'],
) => {
  switch (tab.type) {
    case 'appTile':
      return AppTileStack;
    case 'customTab':
      return stacks?.[tab.initialParams.name] || (() => null); // No screen defined
    case 'home':
      return HomeStack;
    case 'notifications':
      return NotificationsStack;
    case 'settings':
      return SettingsStack;
    default:
      const exhaustiveCheck: never = tab.type;
      console.warn(`Unhandled tab type: ${exhaustiveCheck}`);
      return () => null;
  }
};

export const fromAppConfigTabs = (
  tabs?: TabConfig[],
  stacks?: DeveloperConfig['CustomStacks'],
) => {
  if (!tabs) {
    return tabs;
  }

  return tabs.map((tab) => {
    return {
      ...tab,
      component: stackFromTab(tab, stacks),
      icon: (props: SvgProps) => <DynamicTabIcon {...tab} {...props} />,
      svgProps: () => tab.svgProps,
      svgPropsActive: () => tab.svgPropsActive,
      svgPropsInactive: () => tab.svgPropsInactive,
    } as NavigationTab;
  });
};

const DynamicTabIcon = (props: SvgProps & { icon?: string }) => {
  const iconName = upperFirst(camelCase(props.icon ?? 'Menu'));
  const { Menu, [iconName]: TabIcon = Menu } = useIcons();

  return <TabIcon key={iconName} {...props} />;
};